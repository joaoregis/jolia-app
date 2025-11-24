import { Transaction, TransactionFormState, Subprofile } from '../types';
import { addMonths } from '../lib/utils';

/**
 * Calculates updates for a series of installments when one is modified.
 * 
 * @param currentTransaction The transaction currently being edited (from DB)
 * @param formData The new data from the form
 * @param seriesTransactions All transactions in the series (future ones)
 * @param activeTab The currently active tab (subprofile ID or 'geral')
 * @returns Array of updates to apply to each transaction in the series
 */
export const calculateInstallmentUpdates = (
    currentTransaction: Transaction,
    formData: TransactionFormState,
    seriesTransactions: Transaction[],
    activeTab?: string
): { id: string, data: Partial<Transaction> }[] => {

    const baseDate = new Date(formData.date + 'T00:00:00');
    const originalDate = new Date(currentTransaction.date + 'T00:00:00');

    // Calculate offset in months
    const monthDiff = (baseDate.getFullYear() - originalDate.getFullYear()) * 12 + (baseDate.getMonth() - originalDate.getMonth());

    return seriesTransactions.map((t) => {
        let newDate = t.date;
        let newPaymentDate = t.paymentDate;
        let newDueDate = t.dueDate;

        if (monthDiff !== 0) {
            const currentTDate = new Date(t.date + 'T00:00:00');
            newDate = addMonths(currentTDate, monthDiff).toISOString().split('T')[0];

            if (t.paymentDate) {
                const currentTPaymentDate = new Date(t.paymentDate + 'T00:00:00');
                newPaymentDate = addMonths(currentTPaymentDate, monthDiff).toISOString().split('T')[0];
            }
            if (t.dueDate) {
                const currentTDueDate = new Date(t.dueDate + 'T00:00:00');
                newDueDate = addMonths(currentTDueDate, monthDiff).toISOString().split('T')[0];
            }
        } else if (t.id === currentTransaction.id) {
            // If it's the current transaction and no month change, use form data explicitly
            newDate = formData.date;
            newPaymentDate = formData.paymentDate;
            newDueDate = formData.dueDate;
        }

        const updatePayload: Partial<Transaction> = {
            description: formData.description,
            type: formData.type,
            planned: formData.planned,
            actual: formData.actual,
            paid: t.id === currentTransaction.id ? formData.paid : t.paid, // Only update paid status for current
            isShared: formData.isShared,
            // subprofileId logic needs to be handled by caller or passed in cleanly. 
            // Here we return the raw values, caller handles deleteField()
            subprofileId: formData.isShared ? undefined : (formData.subprofileId || activeTab),
            labelIds: formData.labelIds,
            notes: formData.notes,
            date: newDate,
            paymentDate: newPaymentDate,
            dueDate: newDueDate,
        };

        return { id: t.id, data: updatePayload };
    });
};

/**
 * Calculates revenue proportions for subprofiles based on income transactions.
 * 
 * @param allTransactions List of all transactions to calculate income from
 * @param activeSubprofiles List of active subprofiles
 * @returns Map of subprofile ID to proportion (0-1)
 */
export const calculateApportionmentProportions = (
    allTransactions: Transaction[],
    activeSubprofiles: Subprofile[]
): Map<string, number> => {
    const subprofileIncomes = new Map<string, number>(activeSubprofiles.map(s => [s.id, 0]));

    allTransactions
        .filter(t => t.type === 'income' && t.subprofileId && subprofileIncomes.has(t.subprofileId))
        .forEach(t => {
            subprofileIncomes.set(t.subprofileId!, (subprofileIncomes.get(t.subprofileId!) || 0) + t.actual);
        });

    const totalIncome = Array.from(subprofileIncomes.values()).reduce((acc, income) => acc + income, 0);
    const proportions = new Map<string, number>();

    if (totalIncome > 0) {
        subprofileIncomes.forEach((income, subId) => proportions.set(subId, income / totalIncome));
    } else {
        const equalShare = 1 / activeSubprofiles.length;
        activeSubprofiles.forEach(sub => proportions.set(sub.id, equalShare));
    }

    return proportions;
};

/**
 * Prepares the data for the next occurrence of a recurring transaction when skipping.
 * 
 * @param transaction The transaction being skipped
 * @returns The data for the new future transaction
 */
export const prepareNextRecurringTransaction = (transaction: Transaction): Omit<Transaction, 'id'> => {
    const { id, skippedInMonths, ...rest } = transaction;

    // Using addMonths for safe calculation
    const nextDate = addMonths(new Date(rest.date + 'T00:00:00'), 1);
    rest.date = nextDate.toISOString().split('T')[0];

    if (rest.paymentDate) {
        const nextPaymentDate = addMonths(new Date(rest.paymentDate + 'T00:00:00'), 1);
        rest.paymentDate = nextPaymentDate.toISOString().split('T')[0];
    }
    if (rest.dueDate) {
        const nextDueDate = addMonths(new Date(rest.dueDate + 'T00:00:00'), 1);
        rest.dueDate = nextDueDate.toISOString().split('T')[0];
    }

    rest.paid = false;
    // createdAt should be set by the caller (serverTimestamp)

    return rest;
};
