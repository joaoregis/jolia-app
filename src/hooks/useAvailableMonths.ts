// src/hooks/useAvailableMonths.ts
import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where, orderBy, doc, getDocs } from 'firebase/firestore';
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

        const statsRef = doc(db, `profiles/${profileId}/metadata/transactionStats`);

        // Check metadata first
        const unsubscribe = onSnapshot(statsRef, async (docSnap) => {
            if (docSnap.exists() && docSnap.data().availableMonths) {
                // Metadata exists, use it (1 READ)
                const months = docSnap.data().availableMonths as string[];
                setAvailableMonths(months.sort());
                setLoading(false);
            } else {
                // Metadata missing or empty -> SELF-HEALING FALLBACK
                console.log("Stats metadata missing. Performing self-healing...");

                // Perform the expensive query ONCE
                const q = query(collection(db, "transactions"), where("profileId", "==", profileId), orderBy("date"));

                // We don't listen to this one, just get it once to build stats
                try {
                    const snapshot = await getDocs(q);
                    const allTransactions = snapshot.docs.map(d => d.data());

                    // Import dynamically to avoid circular dependency if possible, or use logic safely
                    const { regenerateAvailableMonths } = await import('../logic/metadataLogic');
                    const sortedMonths = await regenerateAvailableMonths(profileId, allTransactions);

                    setAvailableMonths(sortedMonths);
                } catch (err) {
                    console.error("Self-healing failed:", err);
                } finally {
                    setLoading(false);
                }
            }
        }, (error) => {
            console.error("Erro ao buscar estatísticas de meses (metadata):", error);
            setLoading(false);
        });

        // Limpa o listener ao desmontar o componente
        return () => unsubscribe();
    }, [profileId]);

    return { availableMonths, loading };
}
