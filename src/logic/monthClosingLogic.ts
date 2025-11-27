import { Transaction, Profile } from '../types';
import { prepareApportionedChild } from '../lib/transactionUtils';
import { prepareNextRecurringTransaction } from './mutationLogic';
import { serverTimestamp } from 'firebase/firestore';

/**
 * Prepares the list of transactions to be created when closing the month.
 * Handles the generation of next month's recurring transactions and correctly regenerates
 * apportioned children for shared proportional expenses.
 * 
 * @param transactions All transactions from the current month (source).
 * @param currentMonthString The current month string (e.g., "2023-10") to mark as skipped.
 * @param profile The user profile (needed for apportionment method and subprofiles).
 * @param subprofileRevenueProportions Map of subprofile ID to revenue proportion.
 * @returns Array of transaction objects to be saved (including timestamps).
 */
export const prepareMonthClosingUpdates = (
    transactions: Transaction[],
    currentMonthString: string,
    profile: Profile,
    subprofileRevenueProportions: Map<string, number>
): any[] => {
    const transactionsToCreate: any[] = [];

    // Filter for recurring transactions that are NOT apportioned children.
    // We only recur the PARENTS. Children are regenerated based on the new parents.
    const recurringParents = transactions.filter(t =>
        t.isRecurring &&
        !t.seriesId &&
        !t.isApportioned &&
        !t.skippedInMonths?.includes(currentMonthString)
    );

    recurringParents.forEach(parent => {
        // 1. Generate the next month's parent transaction
        // We use the helper but we need to ensure it doesn't carry over 'isApportioned' or 'parentId' 
        // if the source was somehow corrupted, but our filter !t.isApportioned handles that.
        const nextParentData = prepareNextRecurringTransaction(parent);

        // Assign a new ID for the parent immediately so we can link children to it
        // Assign a new ID for the parent immediately so we can link children to it 
        // Ideally we let Firestore generate IDs, but we need the ID to link children.
        // Since we are returning data to be saved in a batch, we can't easily get the ID back 
        // unless we use doc refs in the caller. 
        // STRATEGY CHANGE: Return objects with a temporary 'tempId' or similar, 
        // OR better: Return a structure that the caller can iterate and create refs for.
        // BUT, to keep this pure, we can't create refs here.
        // Let's assume the caller will handle the actual DB writes. 
        // We can return a structured object: { parent: data, children: data[] }

        // However, to match the existing pattern where we might just return a flat list 
        // or let the caller handle refs, let's refine the return type.
        // The caller (DashboardScreen) uses `batch.set(doc(collection(db, 'transactions')), rest)`.
        // It doesn't easily support linking children unless we generate IDs here.
        // We will generate IDs here using crypto.randomUUID() which is valid for Firestore keys usually,
        // or just use it as a reference. 
        // Actually, Firestore IDs are auto-generated. If we want to link, we should probably 
        // return a structure: { parent: { data, tempId }, children: { data }[] }

        // Let's stick to the plan: The function returns the data.
        // We will add a special property `_tempId` to the parent and `parentId` to children
        // using that `_tempId`. The caller will need to map these `_tempId`s to actual Firestore Doc Refs.

        const tempParentId = `temp_${crypto.randomUUID()}`;

        const parentToSave = {
            ...nextParentData,
            createdAt: serverTimestamp(),
            _tempId: tempParentId // Internal marker for the caller
        };

        transactionsToCreate.push({ type: 'parent', data: parentToSave });

        // 2. If it's a Shared Proportional transaction, generate NEW children
        if (profile.apportionmentMethod === 'proportional' && parent.isShared) {
            subprofileRevenueProportions.forEach((proportion, subId) => {
                // We need a "complete" parent object to pass to prepareApportionedChild
                // We construct it from the nextParentData + the tempId
                const parentForHelper = {
                    ...nextParentData,
                    id: tempParentId
                } as Transaction;

                const childData = prepareApportionedChild(
                    parentForHelper,
                    proportion,
                    subId,
                    tempParentId
                );

                transactionsToCreate.push({
                    type: 'child',
                    data: { ...childData, createdAt: serverTimestamp() },
                    parentId: tempParentId
                });
            });
        }
    });

    return transactionsToCreate;
};
