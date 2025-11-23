// src/screens/DashboardScreen.tsx

import React, { useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { updateDoc, doc, writeBatch, collection, getDocs, query, where } from 'firebase/firestore';
import { db, serverTimestamp } from '../lib/firebase';
import { Profile, Transaction, TransactionFormState, TransactionActions } from '../types';
import { useToast } from '../contexts/ToastContext';
import { useProfileContext } from '../hooks/useProfileContext';

// Hooks
import { useTransactions } from '../hooks/useTransactions';
import { useAvailableMonths } from '../hooks/useAvailableMonths';
import { useTransactionMutations } from '../hooks/useTransactionMutations';
import { useSubprofileManager } from '../hooks/useSubprofileManager';
import { useDashboardState } from '../hooks/useDashboardState';
import { useDashboardData } from '../hooks/useDashboardData';
import { useDashboardLogic } from '../hooks/useDashboardLogic';
import { useLabels } from '../hooks/useLabels';

// Componentes
import { DashboardHeader } from '../components/DashboardHeader';
import { SummaryCards } from '../components/SummaryCards';
import { TransactionTable, IgnoredTransactionsTable } from '../components/TransactionTable';
import { TransactionFilters } from '../components/TransactionFilters';
import { TransactionModal } from '../components/TransactionModal';
import { TransactionForm } from '../components/TransactionForm';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { AddSubprofileModal } from '../components/AddSubprofileModal';
import { EditSubprofileModal } from '../components/EditSubprofileModal';
import { ImportModal } from '../components/ImportModal';
import { DeleteConfirmationModal } from '../components/DeleteConfirmationModal';
import { ExportModal } from '../components/ExportModal';
import { SubprofileContextMenu } from '../components/SubprofileContextMenu';
import { Plus } from 'lucide-react';
import { SettingsModal } from '../components/SettingsModal';
import { TransferTransactionModal } from '../components/TransactionTransferModal';
import { SeriesEditConfirmationModal } from '../components/SeriesEditConfirmationModal';
import { CalculationToolbar } from '../components/CalculationToolbar';
import { addMonths } from '../lib/utils';

const LoadingScreen: React.FC = () => (
    <div className="flex h-screen items-center justify-center bg-background text-text-secondary">
        A carregar dados do perfil...
    </div>
);

const ACTIVE_TAB_STORAGE_KEY = 'jolia_active_tab';

export const DashboardScreen: React.FC = () => {
    const { profileId, subprofileId } = useParams<{ profileId: string; subprofileId?: string }>();
    const navigate = useNavigate();
    const { profile, loading: profileLoading, setActiveThemeBySubprofileId } = useProfileContext();
    const { showToast } = useToast();

    const { availableMonths, loading: monthsLoading } = useAvailableMonths(profileId);

    // New Logic Hook
    const {
        state: logicState,
        setters: logicSetters,
        handlers: logicHandlers
    } = useDashboardLogic(profile, availableMonths, monthsLoading);

    const { transactions: allTransactions, loading: transactionsLoading } = useTransactions(profileId, logicState.currentMonth);
    const { labels, loading: labelsLoading } = useLabels(profileId);

    const transactionMutations = useTransactionMutations(profile);
    const subprofileManager = useSubprofileManager(profile);

    // Expanded State Hook
    const { modals, contextMenu, editScope } = useDashboardState();

    const activeTab = subprofileId || 'geral';

    useEffect(() => {
        setActiveThemeBySubprofileId(activeTab);
        localStorage.setItem(ACTIVE_TAB_STORAGE_KEY, activeTab);
    }, [activeTab, setActiveThemeBySubprofileId]);

    const currentMonthString = useMemo(() => `${logicState.currentMonth.getFullYear()}-${String(logicState.currentMonth.getMonth() + 1).padStart(2, '0')}`, [logicState.currentMonth]);

    const { sortedData, ignoredTransactions, subprofileRevenueProportions, activeTransactions } = useDashboardData(
        allTransactions,
        profile,
        labels,
        activeTab,
        currentMonthString,
        logicState.sortConfig,
        logicState.filterConfig
    );

    useEffect(() => {
        logicHandlers.resetSelections();
    }, [activeTab, logicState.currentMonth, logicHandlers]);

    useEffect(() => {
        if (profile?.apportionmentMethod !== 'proportional' || allTransactions.length === 0 || transactionsLoading) return;
        const recalculateApportionedExpenses = async () => {
            const batch = writeBatch(db);
            const parentExpenses = allTransactions.filter(t => t.isShared && !t.isApportioned);
            const childrenByParentId = allTransactions.filter(t => t.isApportioned && t.parentId).reduce((acc, c) => {
                acc.set(c.parentId!, [...(acc.get(c.parentId!) || []), c]);
                return acc;
            }, new Map<string, Transaction[]>());
            let hasChanges = false;
            parentExpenses.forEach(parent => {
                subprofileRevenueProportions.forEach((proportion, subId) => {
                    const newPlanned = parent.planned * proportion;
                    const newActual = parent.actual * proportion;
                    const existingChild = childrenByParentId.get(parent.id)?.find(c => c.subprofileId === subId);
                    if (existingChild && (existingChild.planned !== newPlanned || existingChild.actual !== newActual)) {
                        batch.update(doc(db, "transactions", existingChild.id), { planned: newPlanned, actual: newActual });
                        hasChanges = true;
                    }
                });
            });
            if (hasChanges) {
                console.log("Recalculando despesas rateadas...");
                await batch.commit();
            }
        };
        recalculateApportionedExpenses();
    }, [allTransactions, profile?.apportionmentMethod, subprofileRevenueProportions, transactionsLoading]);

    const isCurrentMonthClosed = useMemo(() => profile?.closedMonths?.includes(currentMonthString) || false, [profile, currentMonthString]);

    const allTransactionsPaid = useMemo(() => {
        if (activeTransactions.length === 0) return true;
        return activeTransactions.every(t => t.paid);
    }, [activeTransactions]);

    const canCloseMonth = useMemo(() => {
        if (!profile || isCurrentMonthClosed || !allTransactionsPaid || availableMonths.length === 0) return false;
        const closedMonthsSet = new Set(profile.closedMonths || []);
        const firstMonthWithData = availableMonths[0];
        const start = new Date(Number(firstMonthWithData.substring(0, 4)), Number(firstMonthWithData.substring(5, 7)) - 1, 1);
        const current = new Date(logicState.currentMonth.getFullYear(), logicState.currentMonth.getMonth(), 1);
        for (let d = start; d < current; d.setMonth(d.getMonth() + 1)) {
            const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            if (availableMonths.includes(monthStr) && !closedMonthsSet.has(monthStr)) return false;
        }
        return true;
    }, [profile, availableMonths, logicState.currentMonth, isCurrentMonthClosed, allTransactionsPaid]);

    const calculationData = useMemo(() => {
        const calculate = (ids: Set<string>, source: Transaction[]) => {
            const selected = source.filter(t => ids.has(t.id));
            if (selected.length === 0) return undefined;
            return {
                count: selected.length,
                sumPlanned: selected.reduce((acc, t) => acc + t.planned, 0),
                sumActual: selected.reduce((acc, t) => acc + t.actual, 0),
            };
        };
        return {
            income: calculate(logicState.selectedIncomeIds, sortedData.receitas),
            expense: calculate(logicState.selectedExpenseIds, sortedData.despesas),
            ignored: calculate(logicState.selectedIgnoredIds, ignoredTransactions),
        };
    }, [logicState.selectedIncomeIds, logicState.selectedExpenseIds, logicState.selectedIgnoredIds, sortedData, ignoredTransactions]);

    const handleTabClick = useCallback((tabId: string) => {
        const path = tabId === 'geral' ? `/profile/${profileId}` : `/profile/${profileId}/${tabId}`;
        navigate(path);
    }, [profileId, navigate]);

    const handleOpenModalForNew = useCallback(() => {
        if (isCurrentMonthClosed) return;

        const today = new Date();
        const isViewingCurrentMonth = today.getFullYear() === logicState.currentMonth.getFullYear() && today.getMonth() === logicState.currentMonth.getMonth();
        const defaultDate = isViewingCurrentMonth ? today : new Date(logicState.currentMonth.getFullYear(), logicState.currentMonth.getMonth(), 1);

        const baseData = { paid: false, date: defaultDate.toISOString().split('T')[0], notes: '' };

        const initialValues = activeTab === 'geral'
            ? { ...baseData, type: 'expense' as const, isShared: true, isRecurring: false, labelIds: [] }
            : { ...baseData, subprofileId: activeTab, isShared: false, type: 'expense' as const, isRecurring: false, labelIds: [] };

        modals.transaction.open(initialValues);
    }, [activeTab, isCurrentMonthClosed, modals.transaction, logicState.currentMonth]);

    const handleOpenModalForEdit = useCallback((t: Transaction) => {
        if (isCurrentMonthClosed || t.isApportioned) return;
        if (t.seriesId) {
            modals.seriesAction.open('edit', t);
        } else {
            modals.transaction.open(t);
        }
    }, [isCurrentMonthClosed, modals.transaction, modals.seriesAction]);

    const handleDeleteRequest = useCallback((t: Transaction) => {
        if (isCurrentMonthClosed || t.isApportioned) return;
        if (t.seriesId) {
            modals.seriesAction.open('delete', t);
        } else {
            modals.deleteTransaction.open(t);
        }
    }, [isCurrentMonthClosed, modals.deleteTransaction, modals.seriesAction]);

    const handleOpenTransferModal = useCallback((t: Transaction) => {
        if (isCurrentMonthClosed || t.isApportioned) return;
        modals.transfer.open(t);
    }, [isCurrentMonthClosed, modals.transfer]);

    const handleSaveTransactionWrapper = async (data: TransactionFormState, id?: string) => {
        try {
            await transactionMutations.handleSaveTransaction(data, id, subprofileRevenueProportions, activeTab, editScope.state || 'one');
            showToast('Transação salva com sucesso!', 'success');
            modals.transaction.close();
            editScope.set(null);
        } catch (error) {
            showToast('Erro ao salvar transação.', 'error');
        }
    };

    const handleConfirmTransferWrapper = async (transactionId: string, destination: { type: 'subprofile' | 'main'; id?: string }) => {
        try {
            await transactionMutations.handleConfirmTransfer(transactionId, destination, subprofileRevenueProportions);
            showToast('Transação transferida com sucesso!', 'success');
            modals.transfer.close();
        } catch (error) {
            showToast('Erro ao transferir transação.', 'error');
        }
    };

    const performDeleteWrapper = async (scope: 'one' | 'future' = 'one') => {
        const transactionToDelete = modals.seriesAction.transaction || modals.deleteTransaction.transactionToDelete;
        if (transactionToDelete) {
            try {
                await transactionMutations.performDelete(transactionToDelete, scope);
                showToast('Transação(ões) excluída(s) com sucesso!', 'success');
            } catch (error) {
                showToast('Erro ao excluir transação.', 'error');
            } finally {
                modals.deleteTransaction.close();
                modals.seriesAction.close();
            }
        }
    };

    const performCloseMonth = async () => {
        if (!profile || !canCloseMonth) return;
        modals.closeMonth.close();
        try {
            const recurringTransactions = allTransactions.filter(t =>
                t.isRecurring &&
                !t.seriesId &&
                !t.skippedInMonths?.includes(currentMonthString)
            );

            if (recurringTransactions.length > 0) {
                const batch = writeBatch(db);
                recurringTransactions.forEach(t => {
                    const { id, skippedInMonths, generatedFutureTransactionId, ...rest } = t;

                    const currentDate = new Date(rest.date + 'T00:00:00');
                    if (isNaN(currentDate.getTime())) {
                        console.error(`Invalid date for transaction ${id}: ${rest.date}`);
                        return;
                    }
                    const nextLaunchDate = addMonths(currentDate, 1);
                    rest.date = nextLaunchDate.toISOString().split('T')[0];

                    if (rest.dueDate) {
                        const currentDueDate = new Date(rest.dueDate + 'T00:00:00');
                        if (!isNaN(currentDueDate.getTime())) {
                            const nextDueDate = addMonths(currentDueDate, 1);
                            rest.dueDate = nextDueDate.toISOString().split('T')[0];
                        } else {
                            console.warn(`Invalid dueDate for transaction ${id}: ${rest.dueDate}`);
                        }
                    }

                    delete rest.paymentDate;

                    rest.paid = false;
                    rest.createdAt = serverTimestamp();
                    batch.set(doc(collection(db, 'transactions')), rest);
                });
                await batch.commit();
            }
            await updateDoc(doc(db, "profiles", profile.id), { closedMonths: [...(profile.closedMonths || []), currentMonthString] });
            showToast('Mês fechado e recorrências criadas com sucesso!', 'success');
            logicHandlers.changeMonth(1);
        } catch (error) {
            console.error('Erro ao fechar o mês:', error);
            showToast('Ocorreu um erro ao fechar o mês.', 'error');
        }
    };

    const handleArchiveSubprofileWrapper = async () => {
        if (modals.archiveSubprofile.subprofileToArchive) {
            try {
                await subprofileManager.handleArchiveSubprofile(modals.archiveSubprofile.subprofileToArchive);
                showToast('Subperfil arquivado com sucesso!', 'success');
                modals.archiveSubprofile.close();
                handleTabClick('geral');
            } catch (error) {
                showToast('Erro ao arquivar subperfil.', 'error');
            }
        }
    };

    const handleBulkSave = async (transactions: TransactionFormState[]) => {
        if (!profile) return;
        try {
            const batch = writeBatch(db);
            transactions.forEach(t => batch.set(doc(collection(db, 'transactions')), { ...t, profileId: profile.id, createdAt: serverTimestamp() }));
            await batch.commit();
            showToast(`${transactions.length} transações importadas com sucesso!`, 'success');
        } catch (error) {
            showToast('Erro ao importar transações.', 'error');
        }
    };

    const handleSaveSettings = async (newSettings: Partial<Profile>) => {
        if (!profile || !profileId) return;
        try {
            const { apportionmentMethod: oldMethod } = profile;
            const { apportionmentMethod: newMethod } = newSettings;
            await updateDoc(doc(db, "profiles", profileId), newSettings);
            if (newMethod !== oldMethod) {
                const batch = writeBatch(db);
                if (newMethod === 'proportional') {
                    allTransactions.filter(t => t.isShared && !t.isApportioned).forEach(parent => {
                        const { id, ...rest } = parent;
                        subprofileRevenueProportions.forEach((proportion, subId) => {
                            batch.set(doc(collection(db, 'transactions')), { ...rest, description: `[Rateio] ${parent.description}`, planned: parent.planned * proportion, actual: parent.actual * proportion, isShared: false, isApportioned: true, parentId: parent.id, subprofileId: subId, createdAt: serverTimestamp() });
                        });
                    });
                } else if (oldMethod === 'proportional') {
                    const childrenQuery = query(collection(db, 'transactions'), where('profileId', '==', profileId), where('isApportioned', '==', true));
                    const childrenSnapshot = await getDocs(childrenQuery);
                    childrenSnapshot.forEach(doc => batch.delete(doc.ref));
                }
                await batch.commit();
            }
            showToast('Configurações salvas com sucesso!', 'success');
            modals.settings.close();
        } catch (error) {
            showToast('Erro ao salvar configurações.', 'error');
        }
    };

    const handleSeriesActionConfirm = (scope: 'one' | 'future') => {
        const { actionType, transaction } = modals.seriesAction;
        if (!transaction) return;

        if (actionType === 'delete') {
            performDeleteWrapper(scope);
        } else if (actionType === 'edit') {
            editScope.set(scope);
            modals.transaction.open(transaction);
        }
        modals.seriesAction.close();
    };

    const transactionActions: TransactionActions = useMemo(() => ({
        onEdit: handleOpenModalForEdit,
        onDelete: handleDeleteRequest,
        onTogglePaid: async (t) => {
            try {
                await transactionMutations.handleTogglePaid(t);
                showToast('Status de pagamento atualizado!', 'success');
            } catch {
                showToast('Erro ao atualizar status.', 'error');
            }
        },
        onUpdateField: async (id, field, value) => {
            try {
                await transactionMutations.handleFieldUpdate(id, field, value);
                showToast('Campo atualizado com sucesso!', 'success');
            } catch {
                showToast('Erro ao atualizar campo.', 'error');
            }
        },
        onSkip: async (t) => {
            try {
                await transactionMutations.handleSkipTransaction(t, currentMonthString);
                showToast('Transação ignorada neste mês.', 'info');
            } catch {
                showToast('Erro ao ignorar transação.', 'error');
            }
        },
        onUnskip: async (t) => {
            try {
                await transactionMutations.handleUnskipTransaction(t, currentMonthString);
                showToast('Transação reativada para este mês.', 'info');
            } catch (e: any) {
                showToast(e.message || 'Erro ao reativar transação.', 'error');
            }
        },
        onTransfer: handleOpenTransferModal,
        onSaveNote: async (id, note) => {
            try {
                await transactionMutations.handleSaveNote(id, note);
                showToast('Nota salva com sucesso!', 'success');
            } catch {
                showToast('Erro ao salvar nota.', 'error');
            }
        }
    }), [handleOpenModalForEdit, handleDeleteRequest, transactionMutations, currentMonthString, handleOpenTransferModal, showToast]);

    if (profileLoading || monthsLoading || !logicState.sortConfig || labelsLoading) return <LoadingScreen />;
    if (!profile) return <div>Perfil não encontrado.</div>;

    const activeSubprofiles = profile.subprofiles.filter(s => s.status === 'active');

    return (
        <div className="p-4 md:p-6 lg:p-10 space-y-6">
            <DashboardHeader
                profileName={profile.name}
                activeTab={activeTab}
                currentMonth={logicState.currentMonth}
                formattedMonth={logicState.currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                isCurrentMonthClosed={isCurrentMonthClosed}
                canCloseMonth={canCloseMonth}
                allTransactionsPaid={allTransactionsPaid}
                canGoToPreviousMonth={availableMonths.length > 0 && currentMonthString > availableMonths[0]}
                canGoToNextMonth={availableMonths.length > 0 && availableMonths.some(m => m > currentMonthString)}
                changeMonth={logicHandlers.changeMonth}
                handleCloseMonthAttempt={() => canCloseMonth && modals.closeMonth.open()}
                onExport={modals.export.open}
                onImport={modals.import.open}
                onNewTransaction={handleOpenModalForNew}
                onOpenSettings={modals.settings.open}
                availableMonths={availableMonths}
                closedMonths={profile.closedMonths || []}
                onMonthSelect={logicHandlers.handleMonthSelect}
            />

            <div className="border-b border-border-color">
                <nav className="-mb-px flex space-x-2 md:space-x-6 overflow-x-auto">
                    <button onClick={() => handleTabClick('geral')} className={`whitespace-nowrap py-4 px-1 md:px-2 border-b-2 font-medium text-sm ${activeTab === 'geral' ? 'text-accent border-accent' : 'border-transparent text-text-secondary hover:text-text-primary'}`}>Visão Geral</button>
                    {activeSubprofiles.map(sub => (
                        <div key={sub.id} onContextMenu={(e) => { e.preventDefault(); contextMenu.open(e.pageX, e.pageY, sub); }}>
                            <button onClick={() => handleTabClick(sub.id)} className={`whitespace-nowrap py-4 px-1 md:px-2 border-b-2 font-medium text-sm ${activeTab === sub.id ? 'text-accent border-accent' : 'border-transparent text-text-secondary hover:text-text-primary'}`}>{sub.name}</button>
                        </div>
                    ))}
                    {activeSubprofiles.length < 10 && <button onClick={modals.addSubprofile.open} className="py-4 px-2 text-text-secondary hover:text-accent"><Plus size={16} /></button>}
                </nav>
            </div>

            {transactionsLoading ? <div className="text-center py-10 text-text-secondary">A carregar transações...</div> : (
                <>
                    <TransactionFilters
                        filters={logicState.filterConfig}
                        onFilterChange={logicSetters.setFilterConfig}
                        labels={labels}
                        onClearFilters={() => logicSetters.setFilterConfig({})}
                        groupBy={logicState.groupBy}
                        onGroupByChange={logicSetters.setGroupBy}
                    />
                    <SummaryCards data={sortedData} activeTab={activeTab} />
                    <div className="grid grid-cols-1 gap-6">
                        {(sortedData.receitas.length > 0 || activeTab !== 'geral') && (
                            <TransactionTable
                                title={activeTab === 'geral' ? "Receitas da Casa" : "Receitas"}
                                data={sortedData.receitas}
                                labels={labels}
                                type="income"
                                isClosed={isCurrentMonthClosed}
                                sortConfig={logicState.sortConfig}
                                requestSort={logicHandlers.requestSort}
                                actions={transactionActions}
                                selectedIds={logicState.selectedIncomeIds}
                                onSelectionChange={logicHandlers.createSelectionHandler(logicSetters.setSelectedIncomeIds)}
                                onSelectAll={logicHandlers.createSelectAllHandler(logicSetters.setSelectedIncomeIds, sortedData.receitas)}
                                groupBy={logicState.groupBy}
                            />
                        )}
                        <TransactionTable
                            title={activeTab === 'geral' ? 'Despesas da Casa' : 'Despesas Individuais'}
                            data={sortedData.despesas}
                            labels={labels}
                            type="expense"
                            isClosed={isCurrentMonthClosed}
                            sortConfig={logicState.sortConfig}
                            requestSort={logicHandlers.requestSort}
                            subprofiles={profile.subprofiles}
                            subprofileRevenueProportions={subprofileRevenueProportions}
                            apportionmentMethod={profile.apportionmentMethod}
                            actions={transactionActions}
                            selectedIds={logicState.selectedExpenseIds}
                            onSelectionChange={logicHandlers.createSelectionHandler(logicSetters.setSelectedExpenseIds)}
                            onSelectAll={logicHandlers.createSelectAllHandler(logicSetters.setSelectedExpenseIds, sortedData.despesas)}
                            groupBy={logicState.groupBy}
                        />
                        {ignoredTransactions.length > 0 &&
                            <IgnoredTransactionsTable
                                data={ignoredTransactions}
                                onUnskip={(t) => transactionActions.onUnskip(t)}
                                currentMonthString={currentMonthString}
                                activeTab={activeTab}
                                isCurrentMonthClosed={isCurrentMonthClosed}
                                selectedIds={logicState.selectedIgnoredIds}
                                onSelectionChange={logicHandlers.createSelectionHandler(logicSetters.setSelectedIgnoredIds)}
                                onSelectAll={logicHandlers.createSelectAllHandler(logicSetters.setSelectedIgnoredIds, ignoredTransactions.filter(t => activeTab === 'geral' ? t.isShared : t.subprofileId === activeTab))}
                            />
                        }
                    </div>
                </>
            )}

            <CalculationToolbar selections={calculationData} onClearSelection={logicHandlers.handleClearAllSelections} />

            {/* Modais */}
            <TransactionModal isOpen={modals.transaction.isOpen} onClose={modals.transaction.close} title={modals.transaction.initialValues?.id ? 'Editar Transação' : 'Nova Transação'}>
                <TransactionForm onClose={modals.transaction.close} onSave={handleSaveTransactionWrapper} initialValues={modals.transaction.initialValues} isSubprofileView={activeTab !== 'geral'} />
            </TransactionModal>
            <AddSubprofileModal isOpen={modals.addSubprofile.isOpen} onClose={modals.addSubprofile.close} onSave={subprofileManager.handleCreateSubprofile} />
            <EditSubprofileModal
                isOpen={modals.editSubprofile.isOpen}
                onClose={modals.editSubprofile.close}
                onSave={subprofileManager.handleUpdateSubprofile}
                subprofile={modals.editSubprofile.subprofileToEdit}
                profile={profile}
                onSaveTheme={subprofileManager.handleSaveCustomTheme}
                onDeleteTheme={subprofileManager.handleDeleteCustomTheme}
            />
            <DeleteConfirmationModal isOpen={modals.archiveSubprofile.isOpen} onClose={modals.archiveSubprofile.close} onConfirm={handleArchiveSubprofileWrapper} itemName={modals.archiveSubprofile.subprofileToArchive?.name || ''} title={`Arquivar "${modals.archiveSubprofile.subprofileToArchive?.name}"`} message={<p>Esta ação não irá apagar os dados. Para confirmar, digite <strong className="text-text-primary">{modals.archiveSubprofile.subprofileToArchive?.name}</strong>.</p>} confirmButtonText='Arquivar' />
            <ConfirmationModal isOpen={modals.closeMonth.isOpen} onClose={modals.closeMonth.close} onConfirm={performCloseMonth} title="Fechar o Mês?" message="Esta ação é irreversível e irá criar as transações recorrentes para o próximo mês. Deseja continuar?" />
            <ConfirmationModal isOpen={modals.deleteTransaction.isOpen} onClose={modals.deleteTransaction.close} onConfirm={() => performDeleteWrapper('one')} title="Excluir Transação" message="Tem a certeza que quer excluir este item? Esta ação não pode ser desfeita." />
            <ImportModal isOpen={modals.import.isOpen} onClose={modals.import.close} onSave={handleBulkSave} activeSubprofileId={activeTab} />
            <ExportModal isOpen={modals.export.isOpen} onClose={modals.export.close} profile={profile} activeSubprofileId={activeTab} allTransactions={allTransactions} />
            {contextMenu.state && <SubprofileContextMenu subprofile={contextMenu.state.subprofile} x={contextMenu.state.x} y={contextMenu.state.y} onClose={contextMenu.close} onEdit={(sub) => { modals.editSubprofile.open(sub); contextMenu.close(); }} onArchive={(sub) => { modals.archiveSubprofile.open(sub); contextMenu.close(); }} />}
            <SettingsModal isOpen={modals.settings.isOpen} onClose={modals.settings.close} onSave={handleSaveSettings} profile={profile} />
            <TransferTransactionModal isOpen={modals.transfer.isOpen} onClose={modals.transfer.close} transaction={modals.transfer.transactionToTransfer} subprofiles={activeSubprofiles} onConfirmTransfer={handleConfirmTransferWrapper} />
            <SeriesEditConfirmationModal isOpen={modals.seriesAction.isOpen} actionType={modals.seriesAction.actionType} onClose={modals.seriesAction.close} onConfirm={handleSeriesActionConfirm} />

            <div className="text-center text-xs text-text-secondary opacity-50 pb-4">
                v{__APP_VERSION__}
            </div>
        </div>
    );
};