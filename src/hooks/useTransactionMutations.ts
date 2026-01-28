// src/hooks/useTransactionMutations.ts
import { writeBatch, doc, collection, serverTimestamp as firestoreServerTimestamp, deleteField, getDoc, getDocs, query, where, orderBy, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Transaction, TransactionFormState, Profile } from '../types';
import { cleanUndefinedFields, generateInstallments, prepareApportionedChild } from '../lib/transactionUtils';

import { calculateInstallmentUpdates, calculateApportionmentProportions, prepareNextRecurringTransaction } from '../logic/mutationLogic';

export const useTransactionMutations = (profile: Profile | null) => {

    const handleSaveTransaction = async (
        data: TransactionFormState,
        id?: string,
        subprofileRevenueProportions?: Map<string, number>,
        activeTab?: string,
        editScope: 'one' | 'future' = 'one'
    ) => {
        if (!profile) return;
        const batch = writeBatch(db);
        const transactionsRef = collection(db, 'transactions');

        try {
            // 1. Criando uma nova transação parcelada
            if (data.isInstallmentPurchase && data.totalInstallments && data.totalInstallments > 1 && !id) {
                const installments = generateInstallments(data, profile.id, activeTab);
                installments.forEach(installment => {
                    const docRef = doc(transactionsRef);
                    batch.set(docRef, installment);
                });

            } else if (id) { // 2. Editando uma transação existente (qualquer tipo)
                const docRef = doc(db, 'transactions', id);
                const docSnap = await getDoc(docRef);

                if (!docSnap.exists()) throw new Error("Transação não encontrada");
                const currentTransaction = { id: docSnap.id, ...docSnap.data() } as Transaction;

                // Lógica para edição de parcelas
                if (currentTransaction.seriesId) {
                    if (editScope === 'one') {
                        // Edita apenas esta parcela
                        const updateData = { ...data };
                        delete (updateData as any).isInstallmentPurchase;
                        delete (updateData as any).totalInstallments;

                        const finalData = { ...updateData };
                        if (data.isShared) {
                            delete (finalData as Partial<TransactionFormState>).subprofileId;
                        } else if (activeTab) {
                            finalData.subprofileId = activeTab;
                        }

                        batch.update(docRef, cleanUndefinedFields(finalData));

                    } else {
                        // Edita esta e as futuras
                        const seriesQuery = query(
                            transactionsRef,
                            where('seriesId', '==', currentTransaction.seriesId),
                            where('currentInstallment', '>=', currentTransaction.currentInstallment),
                            orderBy('currentInstallment')
                        );
                        const seriesSnapshot = await getDocs(seriesQuery);
                        const seriesTransactions = seriesSnapshot.docs.map(d => ({ id: d.id, ...d.data() } as Transaction));

                        const updates = calculateInstallmentUpdates(currentTransaction, data, seriesTransactions, activeTab);

                        updates.forEach(update => {
                            const ref = doc(db, 'transactions', update.id);
                            batch.update(ref, cleanUndefinedFields(update.data));
                        });
                    }
                } else {
                    // Edição normal (não parcelada)
                    const updateData = { ...data };
                    delete (updateData as any).isInstallmentPurchase;
                    delete (updateData as any).totalInstallments;

                    const finalData: any = { ...updateData };
                    if (data.isShared) {
                        finalData.subprofileId = deleteField();
                    } else if (activeTab) {
                        finalData.subprofileId = activeTab;
                    }

                    batch.update(docRef, cleanUndefinedFields(finalData));

                    // Lógica de rateio proporcional (se necessário)
                    if ((profile.apportionmentMethod === 'proportional' || profile.apportionmentMethod === 'percentage') && data.isShared && !currentTransaction.isApportioned) {
                        const updatedParentData = { ...currentTransaction, ...finalData };
                        // Recalcula filhos se for pai compartilhado
                        if (subprofileRevenueProportions) {
                            await recalculateApportionedChildren(batch, id, updatedParentData, subprofileRevenueProportions);
                        }
                    }
                }

            } else { // 3. Criando uma nova transação simples (não parcelada)
                if ((profile.apportionmentMethod === 'proportional' || profile.apportionmentMethod === 'percentage') && data.isShared) {
                    // Cria pai
                    const parentDocRef = doc(transactionsRef);
                    const parentId = parentDocRef.id;
                    const { isInstallmentPurchase, totalInstallments, ...parentData } = data;

                    const finalParentData = { ...parentData, profileId: profile.id, createdAt: firestoreServerTimestamp() };
                    delete (finalParentData as Partial<TransactionFormState>).subprofileId;

                    batch.set(parentDocRef, cleanUndefinedFields(finalParentData));

                    if (subprofileRevenueProportions && subprofileRevenueProportions.size > 0) {
                        subprofileRevenueProportions.forEach((proportion, subId) => {
                            const childDocRef = doc(transactionsRef);
                            // Simulando um objeto Transaction completo para o helper (com id vazio e dados do form)
                            const parentDataForHelper = { ...finalParentData, id: parentId } as Transaction;
                            const childData = prepareApportionedChild(parentDataForHelper, proportion, subId, parentId);
                            batch.set(childDocRef, childData);
                        });
                    }
                } else {
                    const { isInstallmentPurchase, totalInstallments, ...restData } = data;
                    const dataToSave: Partial<Transaction> = { ...restData, profileId: profile.id };

                    if (data.isShared) {
                        delete dataToSave.subprofileId;
                    } else if (activeTab) {
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
            const childData = prepareApportionedChild(updatedParentData as Transaction, proportion, subId, parentId);
            batch.set(childDocRef, childData);
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

        const isProportionalSharedParent = transaction.isShared && !transaction.isApportioned && (profile.apportionmentMethod === 'proportional' || profile.apportionmentMethod === 'percentage');

        if (isProportionalSharedParent) {
            let proportions: Map<string, number>;

            if (profile.apportionmentMethod === 'percentage' && profile.subprofileApportionmentPercentages) {
                proportions = new Map<string, number>();
                // Only consider active subprofiles for safety, or all? Usually active.
                const activeSubprofiles = profile.subprofiles.filter(s => s.status === 'active');
                activeSubprofiles.forEach(sub => {
                    const percentage = profile.subprofileApportionmentPercentages?.[sub.id] || 0;
                    proportions.set(sub.id, percentage / 100);
                });
            } else {
                const allTransactionsQuery = query(collection(db, 'transactions'), where('profileId', '==', profile.id));
                const allTransactionsSnapshot = await getDocs(allTransactionsQuery);
                const allTransactions = allTransactionsSnapshot.docs.map(d => d.data() as Transaction);

                const activeSubprofiles = profile.subprofiles.filter(s => s.status === 'active');
                proportions = calculateApportionmentProportions(allTransactions, activeSubprofiles);
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

                if ((profile.apportionmentMethod === 'proportional' || profile.apportionmentMethod === 'percentage') && subprofileRevenueProportions) {
                    const activeSubprofiles = profile.subprofiles.filter(s => s.status === 'active');
                    const newParentData = { ...originalTransaction, isShared: true, subprofileId: undefined };

                    subprofileRevenueProportions.forEach((proportion, subId) => {
                        if (activeSubprofiles.some(s => s.id === subId)) {
                            const childDocRef = doc(collection(db, "transactions"));
                            // Usando o helper para criar o filho
                            // Precisamos garantir que o newParentData tenha id para o helper (embora aqui seja um update, o id original serve)
                            const parentDataForHelper = { ...newParentData, id: transactionId } as Transaction;
                            const childData = prepareApportionedChild(parentDataForHelper, proportion, subId, transactionId);
                            batch.set(childDocRef, childData);
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
        const batch = writeBatch(db);
        const transactionRef = doc(db, 'transactions', transaction.id);

        // 1. Atualiza a transação atual para marcar como "pulada"
        const updatedSkippedInMonths = [...(transaction.skippedInMonths || []), currentMonthString];

        // 2. Cria a transação do próximo mês imediatamente
        const nextTransactionData = prepareNextRecurringTransaction(transaction);
        const nextTransactionRef = doc(collection(db, 'transactions'));

        // Add server timestamp here as it's not in the pure function
        const dataToSave = {
            ...nextTransactionData,
            createdAt: serverTimestamp()
        };

        // Salva a referência da futura na atual e cria a futura
        batch.update(transactionRef, {
            skippedInMonths: updatedSkippedInMonths,
            generatedFutureTransactionId: nextTransactionRef.id
        });
        batch.set(nextTransactionRef, dataToSave);

        // 3. Propagar para filhos se for transação compartilhada
        const childrenQuery = query(collection(db, 'transactions'), where('parentId', '==', transaction.id));
        const childrenSnapshot = await getDocs(childrenQuery);

        childrenSnapshot.forEach(childDoc => {
            const childData = childDoc.data() as Transaction;
            const childUpdatedSkipped = [...(childData.skippedInMonths || []), currentMonthString];
            batch.update(childDoc.ref, { skippedInMonths: childUpdatedSkipped });
        });

        await batch.commit();
    };

    const handleUnskipTransaction = async (transaction: Transaction, currentMonthString: string) => {
        const batch = writeBatch(db);
        const transactionRef = doc(db, 'transactions', transaction.id);

        const updatedSkippedInMonths = (transaction.skippedInMonths || []).filter(m => m !== currentMonthString);

        const updatePayload: any = { skippedInMonths: updatedSkippedInMonths };

        // Se houver uma transação futura gerada automaticamente, tentamos excluí-la
        if (transaction.generatedFutureTransactionId) {
            const futureTransactionRef = doc(db, 'transactions', transaction.generatedFutureTransactionId);
            batch.delete(futureTransactionRef);
            updatePayload.generatedFutureTransactionId = deleteField();
        }

        batch.update(transactionRef, updatePayload);

        // 3. Propagar para filhos se for transação compartilhada
        const childrenQuery = query(collection(db, 'transactions'), where('parentId', '==', transaction.id));
        const childrenSnapshot = await getDocs(childrenQuery);

        childrenSnapshot.forEach(childDoc => {
            const childData = childDoc.data() as Transaction;
            const childUpdatedSkipped = (childData.skippedInMonths || []).filter(m => m !== currentMonthString);
            batch.update(childDoc.ref, { skippedInMonths: childUpdatedSkipped });
        });

        await batch.commit();
    };

    const handleSaveNote = async (id: string, note: string) => {
        await updateDoc(doc(db, 'transactions', id), { notes: note });
    };

    return {
        handleSaveTransaction,
        handleDeleteTransaction: performDelete, // Alias for compatibility if needed, or just use performDelete
        handleTogglePaid,
        handleFieldUpdate,
        handleSkipTransaction,
        handleUnskipTransaction,
        handleConfirmTransfer,
        performDelete,
        handleSaveNote
    };
};