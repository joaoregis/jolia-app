import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Feedback, FeedbackStatus } from '../types';
import { useToast } from '../contexts/ToastContext';

export function useFeedbacks(profileId?: string) {
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    useEffect(() => {
        if (!profileId) {
            setLoading(false);
            return;
        }

        const q = query(
            collection(db, 'feedbacks'),
            where('profileId', '==', profileId),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Feedback[];
            setFeedbacks(items);
            setLoading(false);
        }, (error) => {
            console.error("Erro ao buscar feedbacks:", error);
            showToast('Erro ao carregar feedbacks', 'error');
            setLoading(false);
        });

        return () => unsubscribe();
    }, [profileId, showToast]);

    const addFeedback = async (data: Omit<Feedback, 'id' | 'createdAt' | 'status'>) => {
        try {
            await addDoc(collection(db, 'feedbacks'), {
                ...data,
                status: 'open',
                isViewed: false,
                createdAt: serverTimestamp()
            });
            showToast('Feedback registrado!', 'success');
        } catch (error) {
            console.error("Erro ao adicionar feedback:", error);
            showToast('Erro ao salvar feedback', 'error');
            throw error;
        }
    };

    const updateFeedbackStatus = async (id: string, status: FeedbackStatus) => {
        try {
            const updateData: any = { status };
            if (status === 'resolved') {
                updateData.resolvedAt = serverTimestamp();
            }
            await updateDoc(doc(db, 'feedbacks', id), updateData);
            showToast('Status atualizado!', 'success');
        } catch (error) {
            showToast('Erro ao atualizar status', 'error');
        }
    };

    const markAsViewed = async (id: string) => {
        try {
            await updateDoc(doc(db, 'feedbacks', id), { isViewed: true });
        } catch (error) {
            console.error("Erro ao marcar como visualizado:", error);
        }
    };

    const deleteFeedback = async (id: string) => {
        try {
            await deleteDoc(doc(db, 'feedbacks', id));
            showToast('Feedback removido!', 'success');
        } catch (error) {
            showToast('Erro ao remover feedback', 'error');
        }
    };

    return {
        feedbacks,
        loading,
        addFeedback,
        updateFeedbackStatus,
        markAsViewed,
        deleteFeedback
    };
}
