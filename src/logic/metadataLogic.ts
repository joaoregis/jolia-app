import { doc, setDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../lib/firebase';

const getStatsRef = (profileId: string) => doc(db, `profiles/${profileId}/metadata/transactionStats`);

/**
 * Ensures the stats document exists and has the correct month added.
 * If the doc doesn't exist, it creates it.
 */
export const registerMonthInStats = async (profileId: string, date: string, batch?: any) => {
    const monthStr = date.substring(0, 7); // YYYY-MM
    const statsRef = getStatsRef(profileId);

    // We can blindly use arrayUnion with setDoc({merge: true}) which works even if doc doesn't exist?
    // Actually setDoc with merge: true is safest.
    if (batch) {
        batch.set(statsRef, { availableMonths: arrayUnion(monthStr) }, { merge: true });
    } else {
        await setDoc(statsRef, { availableMonths: arrayUnion(monthStr) }, { merge: true });
    }
};

/**
 * Force regenerates the available months list by scanning all transactions.
 * This is the "Self-Healing" heavy operation.
 */
export const regenerateAvailableMonths = async (profileId: string, allTransactions: any[]) => {
    const months = new Set<string>();
    allTransactions.forEach(t => {
        if (t.date) months.add(t.date.substring(0, 7));
    });

    const sortedMonths = Array.from(months).sort();
    await setDoc(getStatsRef(profileId), { availableMonths: sortedMonths }, { merge: true });
    return sortedMonths;
};
