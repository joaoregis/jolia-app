// src/hooks/useAvailableMonths.ts
import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';

/**
 * Hook para buscar todos os meses únicos que possuem transações para um determinado perfil.
 * @param profileId O ID do perfil para buscar os meses.
 * @returns Um objeto contendo a lista de meses disponíveis (no formato 'YYYY-MM') e o estado de carregamento.
 */
export function useAvailableMonths(profileId?: string) {
    const [availableMonths, setAvailableMonths] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!profileId) {
            setLoading(false);
            return;
        }
        setLoading(true);
        // Este query busca todas as transações, mas poderíamos otimizá-lo
        // no futuro se a performance se tornar um problema, por exemplo,
        // mantendo um documento separado com a lista de meses.
        const q = query(collection(db, "transactions"), where("profileId", "==", profileId), orderBy("date"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const months = new Set<string>();
            snapshot.forEach(doc => {
                const transactionDate = doc.data().date;
                // Garante que a data existe e é uma string antes de processar
                if (transactionDate && typeof transactionDate === 'string') {
                    months.add(transactionDate.substring(0, 7)); // Extrai o formato 'YYYY-MM'
                }
            });
            // Ordena os meses cronologicamente
            setAvailableMonths(Array.from(months).sort());
            setLoading(false);
        }, (error) => {
            console.error("Erro ao buscar meses disponíveis:", error);
            setLoading(false);
        });

        // Limpa o listener ao desmontar o componente
        return () => unsubscribe();
    }, [profileId]);

    return { availableMonths, loading };
}
