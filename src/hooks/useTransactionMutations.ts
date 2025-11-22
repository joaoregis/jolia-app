// src/hooks/useTransactionMutations.ts
import { writeBatch, doc, collection, serverTimestamp as firestoreServerTimestamp, deleteField, getDoc, getDocs, query, where, orderBy, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Transaction, TransactionFormState, Profile } from '../types';
import { cleanUndefinedFields, generateInstallments, prepareApportionedChild } from '../lib/transactionUtils';
import { addMonths } from '../lib/utils';

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

                        // Base date calculation for updates
                        const baseDate = new Date(data.date + 'T00:00:00');
                        // Removed unused basePaymentDate and baseDueDate
                        const originalDate = new Date(currentTransaction.date + 'T00:00:00');

                        // Calculate offset in months if the date changed, or just update fields if not
                        // Simplificação: Atualizar campos não-data em todas, e recalcular datas se necessário
                        // Se o usuário mudou a data desta parcela, propagamos a diferença de meses

                        // Diferença em meses entre a data original desta parcela e a nova data
                        const monthDiff = (baseDate.getFullYear() - originalDate.getFullYear()) * 12 + (baseDate.getMonth() - originalDate.getMonth());

                        seriesSnapshot.forEach((doc) => {
                            const t = doc.data() as Transaction;
                            // Mantém a lógica de datas relativa
                            // Se monthDiff for 0, apenas atualiza outros campos. Se for != 0, ajusta datas.

                            let newDate = t.date;
                            let newPaymentDate = t.paymentDate;
                            let newDueDate = t.dueDate;

                            if (monthDiff !== 0) {
                                const currentTDate = new Date(t.date + 'T00:00:00');
                                newDate = addMonths(currentTDate, monthDiff).toISOString().split('T')[0];

                                if (t.paymentDate) {
                                    const currentTPaymentDate = new Date(t.paymentDate + 'T00:00:00');
                                    newPaymentDate = addMonths(currentTPaymentDate, monthDiff).toISOString().split('T')[0];
                                }
                                if (t.dueDate) {
                                    const currentTDueDate = new Date(t.dueDate + 'T00:00:00');
                                    newDueDate = addMonths(currentTDueDate, monthDiff).toISOString().split('T')[0];
                                }
                            } else if (doc.id === id) {
                                // Se for a transação atual e não houve mudança de mês, usa a data do form explicitamente
                                newDate = data.date;
                                newPaymentDate = data.paymentDate;
                                newDueDate = data.dueDate;
                            }

                            const updatePayload = {
                                description: data.description,
                                type: data.type,
                                planned: data.planned,
                                actual: data.actual,
                                paid: doc.id === id ? data.paid : t.paid, // Só atualiza pago na atual
                                isShared: data.isShared,
                                subprofileId: data.isShared ? deleteField() : data.subprofileId,
                                labelIds: data.labelIds,
                                notes: data.notes,
                                date: newDate,
                                paymentDate: newPaymentDate,
                                dueDate: newDueDate,
                            };
                            batch.update(doc.ref, cleanUndefinedFields(updatePayload));
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
                    if (profile.apportionmentMethod === 'proportional' && data.isShared && !currentTransaction.isApportioned) {
                        const updatedParentData = { ...currentTransaction, ...finalData };
                        // Recalcula filhos se for pai compartilhado
                        if (subprofileRevenueProportions) {
                            await recalculateApportionedChildren(batch, id, updatedParentData, subprofileRevenueProportions);
                        }
                    }
                }

            } else { // 3. Criando uma nova transação simples (não parcelada)
                if (profile.apportionmentMethod === 'proportional' && data.isShared) {
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
        const { id, skippedInMonths, ...rest } = transaction;
        const nextTransactionRef = doc(collection(db, 'transactions'));

        // Usando addMonths para cálculo seguro
        const nextDate = addMonths(new Date(rest.date + 'T00:00:00'), 1);
        rest.date = nextDate.toISOString().split('T')[0];

        if (rest.paymentDate) {
            const nextPaymentDate = addMonths(new Date(rest.paymentDate + 'T00:00:00'), 1);
            rest.paymentDate = nextPaymentDate.toISOString().split('T')[0];
        }
        if (rest.dueDate) {
            const nextDueDate = addMonths(new Date(rest.dueDate + 'T00:00:00'), 1);
            rest.dueDate = nextDueDate.toISOString().split('T')[0];
        }

        rest.paid = false;
        rest.createdAt = serverTimestamp();

        // Salva a referência da futura na atual e cria a futura
        batch.update(transactionRef, {
            skippedInMonths: updatedSkippedInMonths,
            generatedFutureTransactionId: nextTransactionRef.id
        });
        batch.set(nextTransactionRef, rest);

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