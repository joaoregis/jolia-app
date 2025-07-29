// src/hooks/useLabels.ts

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Label } from '../types';

export const useLabels = (profileId?: string) => {
    const [labels, setLabels] = useState<Label[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!profileId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        const q = query(
            collection(db, 'labels'),
            where('profileId', '==', profileId),
            orderBy('createdAt', 'asc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedLabels = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Label));
            setLabels(fetchedLabels);
            setLoading(false);
        }, (error) => {
            console.error("Erro ao buscar rótulos:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [profileId]);

    return { labels, loading };
};