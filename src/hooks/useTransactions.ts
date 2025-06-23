// src/hooks/useTransactions.ts
import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Transaction } from '../types';

export function useTransactions(profileId?: string, currentMonth?: Date) {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!profileId || !currentMonth) {
            setLoading(false);
            return;
        }

        setLoading(true);
        const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).toISOString().split('T')[0];
        const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).toISOString().split('T')[0];

        const q = query(
            collection(db, "transactions"),
            where("profileId", "==", profileId),
            where("date", ">=", startOfMonth),
            where("date", "<=", endOfMonth)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            setTransactions(snapshot.docs.map(d => ({ ...d.data(), id: d.id })) as Transaction[]);
            setLoading(false);
        }, (error) => {
            console.error("Erro ao buscar transações: ", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [profileId, currentMonth]);

    return { transactions, loading };
}