// src/hooks/useTransactionMutations.ts

import {
    updateDoc,
    doc,
    writeBatch,
    collection,
    getDocs,
    query,
    where,
    arrayUnion,
    arrayRemove,
    getDoc,
    deleteField
} from 'firebase/firestore';
import { db, serverTimestamp } from '../lib/firebase';
import { Profile, Transaction, TransactionFormState } from '../types';

/**
 * Hook customizado para encapsular toda a lógica de mutação (CUD) de transações.
 * @param profile - O perfil ativo.
 * @returns Um objeto com funções para manipular transações.
 */
export function useTransactionMutations(profile: Profile | null) {

    const handleSaveTransaction = async (data: TransactionFormState, id?: string, subprofileRevenueProportions?: Map<string, number>, activeTab?: string) => {
        if (!profile) return;
    
        const batch = writeBatch(db);
        const transactionsRef = collection(db, "transactions");
    
        const isProportional = profile.apportionmentMethod === 'proportional';
        const isEditingSharedExpense = id && data.isShared;
    
        try {
            if (data.isShared && isProportional) {
                const parentDocRef = id ? doc(db, "transactions", id) : doc(transactionsRef);
                const parentId = parentDocRef.id;
    
                const parentData: Partial<Transaction> = { ...data, profileId: profile.id };
                delete parentData.subprofileId; 
                if (!id) parentData.createdAt = serverTimestamp();
    
                if (id) batch.update(parentDocRef, parentData);
                else batch.set(parentDocRef, parentData);
    
                if (isEditingSharedExpense) {
                    const q = query(transactionsRef, where("parentId", "==", id));
                    const oldChildrenSnapshot = await getDocs(q);
                    oldChildrenSnapshot.forEach(doc => batch.delete(doc.ref));
                }
    
                if(subprofileRevenueProportions && subprofileRevenueProportions.size > 0) {
                    subprofileRevenueProportions.forEach((proportion, subId) => {
                        const childDocRef = doc(transactionsRef);
                        const childData: Omit<Transaction, 'id'> = {
                            ...(data as Omit<Transaction, 'id' | 'createdAt'>),
                            profileId: profile.id,
                            description: `[Rateio] ${data.description}`,
                            planned: data.planned * proportion,
                            actual: data.actual * proportion,
                            isShared: false,
                            isApportioned: true,
                            parentId: parentId,
                            subprofileId: subId,
                            createdAt: serverTimestamp()
                        };
                        batch.set(childDocRef, childData);
                    });
                }
            } else {
                const dataToSave: Partial<Transaction> = { ...data, profileId: profile.id };
                
                if (data.isShared) {
                    delete dataToSave.subprofileId;
                } else if(!id && activeTab) {
                    dataToSave.subprofileId = activeTab;
                }

                if (id) {
                    batch.update(doc(db, "transactions", id), dataToSave);
                } else {
                    dataToSave.createdAt = serverTimestamp();
                    batch.set(doc(transactionsRef), dataToSave);
                }
            }
    
            await batch.commit();
        } catch (error) {
            console.error("Erro ao salvar transação: ", error);
        }
    };

    const handleFieldUpdate = async (id: string, field: keyof Transaction, value: any) => {
        if (!profile) return;
        const batch = writeBatch(db);
        const transactionRef = doc(db, 'transactions', id);
    
        // Obtém a transação para verificar se ela é compartilhada
        const docSnap = await getDoc(transactionRef);
        if (!docSnap.exists()) {
            console.error("Transação não encontrada para atualização.");
            return;
        }
        const transaction = docSnap.data() as Transaction;
    
        // Atualiza o documento pai
        batch.update(transactionRef, { [field]: value });
    
        // Se for uma despesa compartilhada com rateio proporcional, propaga a alteração para os filhos
        const isProportionalShared = transaction.isShared && profile.apportionmentMethod === 'proportional';
        // Campos que não devem ser propagados diretamente pois possuem cálculo próprio (ou já são tratados em outras funções)
        const fieldsToIgnore = ['planned', 'actual', 'description', 'paid', 'isShared', 'subprofileId'];
    
        if (isProportionalShared && !fieldsToIgnore.includes(field)) {
            const q = query(collection(db, 'transactions'), where('parentId', '==', id));
            const childrenSnapshot = await getDocs(q);
            childrenSnapshot.forEach(childDoc => {
                batch.update(childDoc.ref, { [field]: value });
            });
        }
    
        await batch.commit();
    };

    const handleTogglePaid = async (transaction: Transaction) => {
        const newPaidStatus = !transaction.paid;
        const batch = writeBatch(db);

        const mainDocRef = doc(db, "transactions", transaction.id);
        batch.update(mainDocRef, { paid: newPaidStatus });

        if (transaction.isShared && profile?.apportionmentMethod === 'proportional') {
            const q = query(collection(db, 'transactions'), where('parentId', '==', transaction.id));
            const childrenSnapshot = await getDocs(q);
            childrenSnapshot.forEach(doc => {
                batch.update(doc.ref, { paid: newPaidStatus });
            });
        }

        await batch.commit();
    };

    const performDelete = async (transactionToDelete: Transaction) => {
        const batch = writeBatch(db);
        try {
            if (transactionToDelete.isShared) {
                const q = query(collection(db, 'transactions'), where('parentId', '==', transactionToDelete.id));
                const childrenSnapshot = await getDocs(q);
                childrenSnapshot.forEach(doc => batch.delete(doc.ref));
            }
            batch.delete(doc(db, "transactions", transactionToDelete.id));
            await batch.commit();
        } catch (error) {
            console.error("Erro ao excluir transação:", error);
        }
    };
    
    const handleConfirmTransfer = async (transactionId: string, destination: { type: 'subprofile' | 'main'; id?: string }, subprofileRevenueProportions?: Map<string, number>) => {
        if (!profile) return;
        
        const transactionRef = doc(db, "transactions", transactionId);
        const batch = writeBatch(db);

        try {
            const transactionDoc = await getDoc(transactionRef);
            if (!transactionDoc.exists()) {
                console.error("Transação não encontrada para transferência.");
                return;
            }
            const originalTransaction = transactionDoc.data() as Transaction;
            const wasShared = originalTransaction.isShared;

            if (destination.type === 'main') {
                batch.update(transactionRef, { 
                    subprofileId: deleteField(), 
                    isShared: true 
                });

                if (profile.apportionmentMethod === 'proportional' && subprofileRevenueProportions) {
                    const activeSubprofiles = profile.subprofiles.filter(s => s.status === 'active');
                    const newParentData = { ...originalTransaction, isShared: true, subprofileId: undefined };
                    
                    subprofileRevenueProportions.forEach((proportion, subId) => {
                        if (activeSubprofiles.some(s => s.id === subId)) {
                             const childDocRef = doc(collection(db, "transactions"));
                             const childData = { ...newParentData };
                             delete (childData as Partial<Transaction>).id;

                             batch.set(childDocRef, {
                                ...childData,
                                description: `[Rateio] ${childData.description}`,
                                planned: childData.planned * proportion,
                                actual: childData.actual * proportion,
                                isShared: false,
                                isApportioned: true,
                                parentId: transactionId,
                                subprofileId: subId,
                                createdAt: serverTimestamp()
                             });
                        }
                    });
                }
            } 
            else if (destination.type === 'subprofile' && destination.id) {
                batch.update(transactionRef, { 
                    subprofileId: destination.id, 
                    isShared: false 
                });

                if (wasShared) {
                    const q = query(collection(db, 'transactions'), where('parentId', '==', transactionId));
                    const childrenSnapshot = await getDocs(q);
                    childrenSnapshot.forEach(doc => batch.delete(doc.ref));
                }
            }

            await batch.commit();
        } catch (error) {
            console.error("Erro ao transferir transação:", error);
        }
    };

    const handleSkipTransaction = async (transaction: Transaction, currentMonthString: string) => {
        if (!transaction.id) return;
        const transactionRef = doc(db, 'transactions', transaction.id);
        await updateDoc(transactionRef, {
            skippedInMonths: arrayUnion(currentMonthString)
        });
    };

    const handleUnskipTransaction = async (transaction: Transaction, currentMonthString: string) => {
        if (!transaction.id) return;
        const transactionRef = doc(db, 'transactions', transaction.id);
        await updateDoc(transactionRef, {
            skippedInMonths: arrayRemove(currentMonthString)
        });
    };

    const handleSaveNote = async (transactionId: string, note: string) => {
        const transactionRef = doc(db, 'transactions', transactionId);
        if (!note.trim()) {
            await updateDoc(transactionRef, { notes: deleteField() });
        } else {
            await updateDoc(transactionRef, { notes: note });
        }
    };


    return { 
        handleSaveTransaction, 
        handleFieldUpdate, 
        handleTogglePaid, 
        performDelete,
        handleConfirmTransfer,
        handleSkipTransaction,
        handleUnskipTransaction,
        handleSaveNote
    };
}