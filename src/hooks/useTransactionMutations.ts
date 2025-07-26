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
    deleteField,
    orderBy
} from 'firebase/firestore';
import { db, serverTimestamp } from '../lib/firebase';
import { Profile, Transaction, TransactionFormState } from '../types';

/**
 * Remove propriedades com valor `undefined` de um objeto.
 * O Firestore não aceita `undefined` como valor de campo.
 * @param obj O objeto a ser limpo.
 */
const cleanUndefinedFields = (obj: any) => {
    Object.keys(obj).forEach(key => obj[key] === undefined && delete obj[key]);
    return obj;
};

/**
 * Hook customizado para encapsular toda a lógica de mutação (CUD) de transações.
 * @param profile - O perfil ativo.
 * @returns Um objeto com funções para manipular transações.
 */
export function useTransactionMutations(profile: Profile | null) {

    const handleSaveTransaction = async (data: TransactionFormState, id?: string, subprofileRevenueProportions?: Map<string, number>, activeTab?: string, scope: 'one' | 'future' = 'one') => {
        if (!profile) return;
    
        const batch = writeBatch(db);
        const transactionsRef = collection(db, "transactions");
    
        const isProportional = profile.apportionmentMethod === 'proportional';
    
        try {
            // 1. Criando uma nova transação parcelada
            if (data.isInstallmentPurchase && data.totalInstallments && data.totalInstallments > 1 && !id) {
                const seriesId = crypto.randomUUID();
                const totalInstallments = data.totalInstallments;

                for (let i = 0; i < totalInstallments; i++) {
                    const installmentDocRef = doc(transactionsRef);
                    const installmentDate = new Date(data.date + 'T00:00:00');
                    installmentDate.setMonth(installmentDate.getMonth() + i);
                    
                    let paymentDate = data.paymentDate ? new Date(data.paymentDate + 'T00:00:00') : undefined;
                    if(paymentDate) paymentDate.setMonth(paymentDate.getMonth() + i);

                    let dueDate = data.dueDate ? new Date(data.dueDate + 'T00:00:00') : undefined;
                    if(dueDate) dueDate.setMonth(dueDate.getMonth() + i);

                    const installmentData: Omit<Transaction, 'id'> = {
                        ...data,
                        profileId: profile.id,
                        date: installmentDate.toISOString().split('T')[0],
                        paymentDate: paymentDate ? paymentDate.toISOString().split('T')[0] : undefined,
                        dueDate: dueDate ? dueDate.toISOString().split('T')[0] : undefined,
                        seriesId: seriesId,
                        currentInstallment: i + 1,
                        totalInstallments: totalInstallments,
                        isRecurring: i === 0,
                        createdAt: serverTimestamp()
                    };
                    if (data.isShared) {
                        delete (installmentData as Partial<TransactionFormState>).subprofileId;
                    } else if (activeTab) {
                        installmentData.subprofileId = activeTab;
                    }
                    delete (installmentData as Partial<TransactionFormState>).isInstallmentPurchase;
                    
                    batch.set(installmentDocRef, cleanUndefinedFields(installmentData));
                }

            } else if (id) { // 2. Editando uma transação existente (qualquer tipo)
                const docRef = doc(db, "transactions", id);
                const docSnap = await getDoc(docRef);
                if (!docSnap.exists()) throw new Error("Documento não encontrado");
                const originalTransaction = docSnap.data() as Transaction;

                if (originalTransaction.seriesId && scope === 'future') {
                    const seriesQuery = query(
                        transactionsRef,
                        where('seriesId', '==', originalTransaction.seriesId),
                        where('currentInstallment', '>=', originalTransaction.currentInstallment),
                        orderBy('currentInstallment')
                    );
                    const seriesSnapshot = await getDocs(seriesQuery);

                    const baseDate = new Date(data.date + 'T00:00:00');
                    const basePaymentDate = data.paymentDate ? new Date(data.paymentDate + 'T00:00:00') : undefined;
                    const baseDueDate = data.dueDate ? new Date(data.dueDate + 'T00:00:00') : undefined;
                    
                    seriesSnapshot.forEach(doc => {
                        const installment = doc.data() as Transaction;
                        const monthDiff = (installment.currentInstallment || 0) - (originalTransaction.currentInstallment || 0);
                        
                        const newDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + monthDiff, baseDate.getDate());
                        const newPaymentDate = basePaymentDate ? new Date(basePaymentDate.getFullYear(), basePaymentDate.getMonth() + monthDiff, basePaymentDate.getDate()) : undefined;
                        const newDueDate = baseDueDate ? new Date(baseDueDate.getFullYear(), baseDueDate.getMonth() + monthDiff, baseDueDate.getDate()) : undefined;

                        const updatePayload = {
                            description: data.description,
                            type: data.type,
                            planned: data.planned,
                            actual: data.actual,
                            paid: data.paid,
                            isShared: data.isShared,
                            subprofileId: data.subprofileId,
                            notes: data.notes,
                            date: newDate.toISOString().split('T')[0],
                            paymentDate: newPaymentDate ? newPaymentDate.toISOString().split('T')[0] : undefined,
                            dueDate: newDueDate ? newDueDate.toISOString().split('T')[0] : undefined,
                        };
                        batch.update(doc.ref, cleanUndefinedFields(updatePayload));
                    });

                } else { 
                    const { isInstallmentPurchase, totalInstallments, ...restData } = data;
                    batch.update(docRef, cleanUndefinedFields(restData));
                }

            } else { // 3. Criando uma nova transação simples (não parcelada)
                if (data.isShared && isProportional) {
                    const parentDocRef = doc(transactionsRef);
                    const parentId = parentDocRef.id;
                    const { isInstallmentPurchase, totalInstallments, ...parentData } = data;
                    
                    const finalParentData = { ...parentData, profileId: profile.id, createdAt: serverTimestamp() };
                    delete (finalParentData as Partial<TransactionFormState>).subprofileId;

                    batch.set(parentDocRef, cleanUndefinedFields(finalParentData));
        
                    if(subprofileRevenueProportions && subprofileRevenueProportions.size > 0) {
                        subprofileRevenueProportions.forEach((proportion, subId) => {
                            const childDocRef = doc(transactionsRef);
                            const childData: Omit<Transaction, 'id'> = {
                                ...parentData,
                                profileId: profile.id,
                                description: `[Rateio] ${parentData.description}`,
                                planned: parentData.planned * proportion,
                                actual: parentData.actual * proportion,
                                isShared: false,
                                isApportioned: true,
                                parentId: parentId,
                                subprofileId: subId,
                                createdAt: serverTimestamp()
                            };
                            batch.set(childDocRef, cleanUndefinedFields(childData));
                        });
                    }
                } else {
                    const { isInstallmentPurchase, totalInstallments, ...restData } = data;
                    const dataToSave: Partial<Transaction> = { ...restData, profileId: profile.id };
                    
                    if (data.isShared) {
                        delete dataToSave.subprofileId;
                    } else if(activeTab) {
                        dataToSave.subprofileId = activeTab;
                    }
                    dataToSave.createdAt = serverTimestamp();
                    batch.set(doc(transactionsRef), cleanUndefinedFields(dataToSave));
                }
            }
    
            await batch.commit();
        } catch (error) {
            console.error("Erro ao salvar transação: ", error);
            throw error;
        }
    };

    const handleFieldUpdate = async (id: string, field: keyof Transaction, value: any, scope: 'one' | 'future' = 'one') => {
        if (!profile) return;
        const batch = writeBatch(db);
        const transactionRef = doc(db, 'transactions', id);
    
        const docSnap = await getDoc(transactionRef);
        if (!docSnap.exists()) {
            console.error("Transação não encontrada para atualização.");
            return;
        }
        const transaction = docSnap.data() as Transaction;
    
        const updatePayload = { [field]: value };
        cleanUndefinedFields(updatePayload);

        if (scope === 'one' || !transaction.seriesId) {
             batch.update(transactionRef, updatePayload);
        } else { // scope === 'future'
            const seriesQuery = query(
                collection(db, 'transactions'),
                where('seriesId', '==', transaction.seriesId),
                where('currentInstallment', '>=', transaction.currentInstallment),
                orderBy('currentInstallment')
            );
            const seriesSnapshot = await getDocs(seriesQuery);
            seriesSnapshot.forEach(doc => {
                batch.update(doc.ref, updatePayload);
            });
        }
    
        const isProportionalShared = transaction.isShared && profile.apportionmentMethod === 'proportional';
        const fieldsToIgnore = ['planned', 'actual', 'description', 'paid', 'isShared', 'subprofileId'];
    
        if (isProportionalShared && !fieldsToIgnore.includes(field as string)) {
            const q = query(collection(db, 'transactions'), where('parentId', '==', id));
            const childrenSnapshot = await getDocs(q);
            childrenSnapshot.forEach(childDoc => {
                batch.update(childDoc.ref, updatePayload);
            });
        }
    
        await batch.commit();
    };

    const handleTogglePaid = async (transaction: Transaction) => {
        await handleFieldUpdate(transaction.id, 'paid', !transaction.paid, 'one');
    };

    const performDelete = async (transactionToDelete: Transaction, scope: 'one' | 'future' = 'one') => {
        const batch = writeBatch(db);
        try {
            if (scope === 'one' || !transactionToDelete.seriesId) {
                 if (transactionToDelete.isShared) {
                    const q = query(collection(db, 'transactions'), where('parentId', '==', transactionToDelete.id));
                    const childrenSnapshot = await getDocs(q);
                    childrenSnapshot.forEach(doc => batch.delete(doc.ref));
                }
                batch.delete(doc(db, "transactions", transactionToDelete.id));

            } else { // scope === 'future'
                const seriesQuery = query(
                    collection(db, 'transactions'),
                    where('seriesId', '==', transactionToDelete.seriesId),
                    where('currentInstallment', '>=', transactionToDelete.currentInstallment),
                    orderBy('currentInstallment')
                );
                const seriesSnapshot = await getDocs(seriesQuery);
                seriesSnapshot.forEach(doc => batch.delete(doc.ref));
            }
           
            await batch.commit();
        } catch (error) {
            console.error("Erro ao excluir transação:", error);
            throw error;
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
            throw error;
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