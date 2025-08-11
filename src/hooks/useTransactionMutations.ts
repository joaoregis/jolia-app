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
    orderBy,
    serverTimestamp as firestoreServerTimestamp // Renomeado para evitar conflito
} from 'firebase/firestore';
import { db } from '../lib/firebase';
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
                        isRecurring: false, // Parcelas não são recorrentes no sentido tradicional
                        createdAt: firestoreServerTimestamp()
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
                            subprofileId: data.isShared ? deleteField() : data.subprofileId,
                            labelIds: data.labelIds,
                            notes: data.notes,
                            date: newDate.toISOString().split('T')[0],
                            paymentDate: newPaymentDate ? newPaymentDate.toISOString().split('T')[0] : undefined,
                            dueDate: newDueDate ? newDueDate.toISOString().split('T')[0] : undefined,
                        };
                        batch.update(doc.ref, cleanUndefinedFields(updatePayload));
                    });

                } else { 
                    const { isInstallmentPurchase, totalInstallments, ...restData } = data;
                    const finalData = { ...restData, subprofileId: data.isShared ? deleteField() : restData.subprofileId };
                    batch.update(docRef, cleanUndefinedFields(finalData));
                }

            } else { // 3. Criando uma nova transação simples (não parcelada)
                if (data.isShared && isProportional) {
                    const parentDocRef = doc(transactionsRef);
                    const parentId = parentDocRef.id;
                    const { isInstallmentPurchase, totalInstallments, ...parentData } = data;
                    
                    const finalParentData = { ...parentData, profileId: profile.id, createdAt: firestoreServerTimestamp() };
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
                                createdAt: firestoreServerTimestamp()
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
                    dataToSave.createdAt = firestoreServerTimestamp();
                    batch.set(doc(transactionsRef), cleanUndefinedFields(dataToSave));
                }
            }
    
            await batch.commit();
        } catch (error) {
            console.error("Erro ao salvar transação: ", error);
            throw error;
        }
    };
    
    const recalculateApportionedChildren = async (batch: any, parentId: string, updatedParentData: Partial<Transaction>, proportions: Map<string, number>) => {
        // 1. Excluir filhos existentes
        const childrenQuery = query(collection(db, 'transactions'), where('parentId', '==', parentId));
        const childrenSnapshot = await getDocs(childrenQuery);
        childrenSnapshot.forEach(doc => batch.delete(doc.ref));
        
        // 2. Criar novos filhos com dados atualizados
        proportions.forEach((proportion, subId) => {
            const childDocRef = doc(collection(db, "transactions"));
            const { id, subprofileId, isShared, isApportioned, parentId: pId, ...restOfParent } = updatedParentData as Transaction;
            
            const childData: Omit<Transaction, 'id'> = {
                ...restOfParent,
                description: `[Rateio] ${updatedParentData.description}`,
                planned: (updatedParentData.planned || 0) * proportion,
                actual: (updatedParentData.actual || 0) * proportion,
                isShared: false,
                isApportioned: true,
                parentId: parentId,
                subprofileId: subId,
                createdAt: firestoreServerTimestamp()
            };
            batch.set(childDocRef, cleanUndefinedFields(childData));
        });
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
        const transaction = { id: docSnap.id, ...docSnap.data() } as Transaction;
    
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
    
        const isProportionalSharedParent = transaction.isShared && !transaction.isApportioned && profile.apportionmentMethod === 'proportional';
    
        if (isProportionalSharedParent) {
            const allTransactionsQuery = query(collection(db, 'transactions'), where('profileId', '==', profile.id));
            const allTransactionsSnapshot = await getDocs(allTransactionsQuery);
            const allTransactions = allTransactionsSnapshot.docs.map(d => d.data() as Transaction);

            const activeSubprofiles = profile.subprofiles.filter(s => s.status === 'active');
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

            const updatedParentData = { ...transaction, ...updatePayload };
            await recalculateApportionedChildren(batch, transaction.id, updatedParentData, proportions);
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
                                createdAt: firestoreServerTimestamp()
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
        const batch = writeBatch(db);
    
        // 1. Marca a transação atual como "pulada"
        batch.update(transactionRef, {
            skippedInMonths: arrayUnion(currentMonthString)
        });
    
        // 2. Cria uma nova transação para o próximo mês
        const { id, skippedInMonths, ...rest } = transaction;
        const nextDate = new Date(rest.date + 'T00:00:00');
        nextDate.setMonth(nextDate.getMonth() + 1);
        rest.date = nextDate.toISOString().split('T')[0];
    
        if (rest.paymentDate) {
            const nextPaymentDate = new Date(rest.paymentDate + 'T00:00:00');
            nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
            rest.paymentDate = nextPaymentDate.toISOString().split('T')[0];
        }
        if (rest.dueDate) {
            const nextDueDate = new Date(rest.dueDate + 'T00:00:00');
            nextDueDate.setMonth(nextDueDate.getMonth() + 1);
            rest.dueDate = nextDueDate.toISOString().split('T')[0];
        }
    
        rest.paid = false;
        rest.createdAt = firestoreServerTimestamp();
    
        const newTransactionRef = doc(collection(db, 'transactions'));
        batch.set(newTransactionRef, rest);
    
        await batch.commit();
    };

    const handleUnskipTransaction = async (transaction: Transaction, currentMonthString: string) => {
        if (!transaction.id || !profile) return;
        
        // Verifica se o mês está fechado
        if (profile.closedMonths?.includes(currentMonthString)) {
            throw new Error("Não é possível reativar transações de um mês fechado.");
        }

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