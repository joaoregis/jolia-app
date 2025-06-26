// src/screens/DashboardScreen.tsx

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { updateDoc, doc, writeBatch, collection, getDocs, query, where } from 'firebase/firestore';
import { db, serverTimestamp } from '../lib/firebase';
import { AppData, Profile, SortConfig, Subprofile, Transaction, TransactionFormState } from '../types';
import { themes } from '../lib/themes';

// Hooks
import { useProfile } from '../hooks/useProfile';
import { useTransactions } from '../hooks/useTransactions';
import { useAvailableMonths } from '../hooks/useAvailableMonths';

// Componentes
import { DashboardHeader } from '../components/DashboardHeader';
import { SummaryCards } from '../components/SummaryCards';
import { TransactionTable } from '../components/TransactionTable';
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

const LoadingScreen: React.FC = () => (
    <div className="flex h-screen items-center justify-center bg-background text-text-secondary">
        A carregar dados do perfil...
    </div>
);

const SORT_CONFIG_STORAGE_KEY = 'jolia_sort_config';

export const DashboardScreen: React.FC = () => {
    const { profileId, '*': subprofileId } = useParams<{ profileId: string; '*': string }>();
    const navigate = useNavigate();

    // Hooks de Dados
    const { profile, loading: profileLoading } = useProfile(profileId);
    const { availableMonths, loading: monthsLoading } = useAvailableMonths(profileId);
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
    const { transactions: allTransactions, loading: transactionsLoading } = useTransactions(profileId, currentMonth);

    // Estado da UI
    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
    const [isSubprofileModalOpen, setIsSubprofileModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [isCloseMonthModalOpen, setIsCloseMonthModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

    const [modalInitialValues, setModalInitialValues] = useState<Partial<Transaction> | null>(null);
    const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
    const [subprofileToArchive, setSubprofileToArchive] = useState<Subprofile | null>(null);
    const [subprofileToEdit, setSubprofileToEdit] = useState<Subprofile | null>(null);

    const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; subprofile: Subprofile } | null>(null);

    const activeTab = subprofileId || 'geral';

    useEffect(() => {
        try {
            const savedSortConfig = localStorage.getItem(SORT_CONFIG_STORAGE_KEY);
            if (savedSortConfig) {
                setSortConfig(JSON.parse(savedSortConfig));
            } else {
                setSortConfig({ key: 'createdAt', direction: 'descending' });
            }
        } catch (error) {
            console.error("Erro ao carregar sortConfig do localStorage:", error);
            setSortConfig({ key: 'createdAt', direction: 'descending' });
        }
    }, []);

    useEffect(() => {
        if (sortConfig) {
            try {
                localStorage.setItem(SORT_CONFIG_STORAGE_KEY, JSON.stringify(sortConfig));
            } catch (error) {
                console.error("Erro ao salvar sortConfig no localStorage:", error);
            }
        }
    }, [sortConfig]);

    useEffect(() => {
        if (monthsLoading || !profile) return;
        const closedMonthsSet = new Set(profile.closedMonths || []);
        const firstOpenMonthStr = availableMonths.find(month => !closedMonthsSet.has(month));
        let initialDate: Date;
        if (firstOpenMonthStr) {
            const [year, month] = firstOpenMonthStr.split('-').map(Number);
            initialDate = new Date(year, month - 1, 1);
        } else if (availableMonths.length > 0) {
            const lastMonthStr = availableMonths[availableMonths.length - 1];
            const [year, month] = lastMonthStr.split('-').map(Number);
            initialDate = new Date(year, month - 1, 1);
        } else {
            initialDate = new Date();
        }
        setCurrentMonth(initialDate);
    }, [monthsLoading, availableMonths, profile]);

    const handleTabClick = useCallback((tabId: string) => {
        const path = tabId === 'geral' ? `/profile/${profileId}` : `/profile/${profileId}/${tabId}`;
        navigate(path);
    }, [profileId, navigate]);

    const activeTheme = useMemo(() => {
        if (!profile) return themes.default;
        const activeSub = profile.subprofiles.find(s => s.id === activeTab);
        return themes[activeSub?.themeId || 'default'] || themes.default;
    }, [activeTab, profile]);

    useEffect(() => {
        const root = document.documentElement;
        Object.entries(activeTheme.variables).forEach(([key, value]) => root.style.setProperty(key, value));
        return () => {
            Object.keys(themes.default.variables).forEach(key => root.style.removeProperty(key));
            Object.keys(themes).forEach(themeKey => {
                Object.keys(themes[themeKey].variables).forEach(cssVar => {
                    root.style.removeProperty(cssVar);
                });
            });
        };
    }, [activeTheme]);
    
    const subprofileRevenueProportions = useMemo(() => {
        if (!profile) return new Map<string, number>();

        const activeSubprofiles = profile.subprofiles.filter(s => s.status === 'active');
        if (activeSubprofiles.length === 0) return new Map<string, number>();

        const subprofileIncomes = new Map<string, number>();
        activeSubprofiles.forEach(sub => subprofileIncomes.set(sub.id, 0));

        allTransactions.forEach(t => {
            if (t.type === 'income' && t.subprofileId && subprofileIncomes.has(t.subprofileId)) {
                const currentIncome = subprofileIncomes.get(t.subprofileId) || 0;
                subprofileIncomes.set(t.subprofileId, currentIncome + t.actual);
            }
        });

        const totalIncome = Array.from(subprofileIncomes.values()).reduce((acc, income) => acc + income, 0);
        const proportions = new Map<string, number>();

        if (totalIncome > 0) {
            subprofileIncomes.forEach((income, subId) => {
                proportions.set(subId, income / totalIncome);
            });
        } else {
            const equalShare = 1 / activeSubprofiles.length;
            activeSubprofiles.forEach(sub => {
                proportions.set(sub.id, equalShare);
            });
        }
        return proportions;
    }, [allTransactions, profile]);

    const filteredData = useMemo<AppData>(() => {
        let result: AppData = { receitas: [], despesas: [] };
        if (activeTab === 'geral') {
            result.despesas = allTransactions.filter(t => t.type === 'expense' && t.isShared);
        } else {
            result.receitas = allTransactions.filter(t => t.type === 'income' && t.subprofileId === activeTab);
            result.despesas = allTransactions.filter(t => t.type === 'expense' && t.subprofileId === activeTab);
        }
        return result;
    }, [allTransactions, activeTab]);

    const sortedData = useMemo(() => {
        let sortedReceitas = [...filteredData.receitas];
        let sortedDespesas = [...filteredData.despesas];
        if (sortConfig) {
            const sortFn = (a: Transaction, b: Transaction) => {
                const aVal = a[sortConfig.key];
                const bVal = b[sortConfig.key];
                if (aVal == null && bVal == null) return 0;
                if (aVal == null) return sortConfig.direction === 'ascending' ? 1 : -1;
                if (bVal == null) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (sortConfig.key === 'date' || sortConfig.key === 'paymentDate' || sortConfig.key === 'createdAt') {
                    const dateA = new Date(aVal as string);
                    const dateB = new Date(bVal as string);
                    if (dateA < dateB) return sortConfig.direction === 'ascending' ? -1 : 1;
                    if (dateA > dateB) return sortConfig.direction === 'ascending' ? 1 : -1;
                    return 0;
                }
                if (typeof aVal === 'boolean' && typeof bVal === 'boolean') {
                    if (aVal === bVal) return 0;
                    return (sortConfig.direction === 'ascending' ? (aVal ? -1 : 1) : (aVal ? 1 : -1));
                }
                if (aVal < bVal) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            };
            sortedReceitas.sort(sortFn);
            sortedDespesas.sort(sortFn);
        }
        return { receitas: sortedReceitas, despesas: sortedDespesas };
    }, [filteredData, sortConfig]);

    const currentMonthString = useMemo(() => `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`, [currentMonth]);
    const isCurrentMonthClosed = useMemo(() => profile?.closedMonths?.includes(currentMonthString) || false, [profile, currentMonthString]);
    const allTransactionsPaid = useMemo(() => allTransactions.every(t => t.paid), [allTransactions]);
    
    const canCloseMonth = useMemo(() => {
        if (!profile || isCurrentMonthClosed || !allTransactionsPaid || availableMonths.length === 0) return false;
        const closedMonthsSet = new Set(profile.closedMonths || []);
        const firstMonthWithData = availableMonths[0];
        const getYearMonth = (dateStr: string) => ({ year: parseInt(dateStr.substring(0, 4), 10), month: parseInt(dateStr.substring(5, 7), 10) - 1 });
        const start = new Date(getYearMonth(firstMonthWithData).year, getYearMonth(firstMonthWithData).month, 1);
        const current = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        let d = new Date(start);
        while (d.getTime() < current.getTime()) {
            const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            if (availableMonths.includes(monthStr) && !closedMonthsSet.has(monthStr)) return false;
            d.setMonth(d.getMonth() + 1);
        }
        return true;
    }, [profile, availableMonths, currentMonth, isCurrentMonthClosed, allTransactionsPaid]);
    
    useEffect(() => {
        if (profile?.apportionmentMethod !== 'proportional' || allTransactions.length === 0 || transactionsLoading) {
            return;
        }
    
        const recalculateApportionedExpenses = async () => {
            const batch = writeBatch(db);
            let hasChanges = false;
    
            const parentExpenses = allTransactions.filter(t => t.isShared);
            const childExpenses = allTransactions.filter(t => t.isApportioned);
    
            const childrenByParentId = new Map<string, Transaction[]>();
            childExpenses.forEach(c => {
                if(c.parentId) {
                    const children = childrenByParentId.get(c.parentId) || [];
                    children.push(c);
                    childrenByParentId.set(c.parentId, children);
                }
            });

            parentExpenses.forEach(parent => {
                subprofileRevenueProportions.forEach((proportion, subId) => {
                    const newPlannedValue = parent.planned * proportion;
                    const newActualValue = parent.actual * proportion;
    
                    const existingChild = childrenByParentId.get(parent.id)?.find(c => c.subprofileId === subId);
    
                    if (existingChild) {
                        if (existingChild.planned !== newPlannedValue || existingChild.actual !== newActualValue) {
                            const childRef = doc(db, "transactions", existingChild.id);
                            batch.update(childRef, {
                                planned: newPlannedValue,
                                actual: newActualValue
                            });
                            hasChanges = true;
                        }
                    }
                });
            });
    
            if (hasChanges) {
                console.log("Recalculando despesas rateadas devido à alteração nas receitas...");
                await batch.commit();
            }
        };
    
        recalculateApportionedExpenses();
    
    }, [allTransactions, profile?.apportionmentMethod, subprofileRevenueProportions, transactionsLoading]);

    const changeMonth = useCallback((amount: number) => {
        setCurrentMonth(prev => {
            const newDate = new Date(prev);
            newDate.setDate(1);
            newDate.setMonth(newDate.getMonth() + amount);
            return newDate;
        });
    }, []);

    const requestSort = useCallback((key: keyof Transaction) => {
        setSortConfig(prevSortConfig => {
            let direction: 'ascending' | 'descending' = 'ascending';
            if (prevSortConfig?.key === key && prevSortConfig.direction === 'ascending') {
                direction = 'descending';
            }
            return { key, direction };
        });
    }, []);
    
    const handleOpenModalForNew = useCallback(() => {
        if (isCurrentMonthClosed) return;
        const dateString = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), new Date().getDate()).toISOString().split('T')[0];
        const baseData = { paid: false, date: dateString };
        setModalInitialValues(activeTab === 'geral'
            ? { ...baseData, type: 'expense', isShared: true, isRecurring: false }
            : { ...baseData, subprofileId: activeTab, isShared: false, type: 'expense' }
        );
        setIsTransactionModalOpen(true);
    }, [activeTab, isCurrentMonthClosed, currentMonth]);

    const handleOpenModalForEdit = useCallback((t: Transaction) => {
        if (isCurrentMonthClosed || t.isApportioned) return;
        setModalInitialValues(t);
        setIsTransactionModalOpen(true);
    }, [isCurrentMonthClosed]);

    const handleSaveTransaction = async (data: TransactionFormState, id?: string) => {
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
    
                if(subprofileRevenueProportions.size > 0) {
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
                } else if(!id) {
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
            setIsTransactionModalOpen(false);
        } catch (error) {
            console.error("Erro ao salvar transação: ", error);
        }
    };

    const handleFieldUpdate = async (id: string, field: keyof Transaction, value: any) => {
        await updateDoc(doc(db, 'transactions', id), { [field]: value });
    };

    const handleTogglePaid = async (transaction: Transaction) => {
        const newPaidStatus = !transaction.paid;
        const batch = writeBatch(db);

        // Atualiza a transação principal (seja ela pai ou não)
        const mainDocRef = doc(db, "transactions", transaction.id);
        batch.update(mainDocRef, { paid: newPaidStatus });

        // Se for uma transação da casa (pai), atualiza as filhas
        if (transaction.isShared && profile?.apportionmentMethod === 'proportional') {
            const q = query(collection(db, 'transactions'), where('parentId', '==', transaction.id));
            const childrenSnapshot = await getDocs(q);
            childrenSnapshot.forEach(doc => {
                batch.update(doc.ref, { paid: newPaidStatus });
            });
        }

        await batch.commit();
    };

    const performDelete = async () => {
        if (transactionToDelete) {
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
            } finally {
                setTransactionToDelete(null);
            }
        }
    };
    
    const performCloseMonth = async () => {
        if (!profile || !canCloseMonth) return;
        setIsCloseMonthModalOpen(false);
        const recurringTransactions = allTransactions.filter(t => t.isRecurring);
        if (recurringTransactions.length > 0) {
            const batch = writeBatch(db);
            const transactionsRef = collection(db, 'transactions');
            recurringTransactions.forEach(t => {
                const newTransactionData: Omit<Transaction, 'id'> = { ...t };
                delete (newTransactionData as Partial<Transaction>).id;
                const nextLaunchDate = new Date(newTransactionData.date + 'T00:00:00');
                nextLaunchDate.setMonth(nextLaunchDate.getMonth() + 1);
                newTransactionData.date = nextLaunchDate.toISOString().split('T')[0];
                if (newTransactionData.paymentDate) {
                    const nextPaymentDate = new Date(newTransactionData.paymentDate + 'T00:00:00');
                    nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
                    newTransactionData.paymentDate = nextPaymentDate.toISOString().split('T')[0];
                }
                newTransactionData.paid = false;
                newTransactionData.createdAt = serverTimestamp() as any;
                const docRef = doc(transactionsRef);
                batch.set(docRef, newTransactionData);
            });
            await batch.commit();
        }
        const updatedClosedMonths = [...(profile.closedMonths || []), currentMonthString];
        await updateDoc(doc(db, "profiles", profile.id), { closedMonths: updatedClosedMonths });
        changeMonth(1);
    };

    const handleCreateSubprofile = async (name: string, themeId: string) => {
        if (!profile) return;
        const newSubprofile: Subprofile = {
            id: name.trim().toLowerCase().replace(/\s+/g, '-'),
            name: name.trim(),
            status: 'active',
            themeId: themeId
        };
        const updatedSubprofiles = [...profile.subprofiles, newSubprofile];
        await updateDoc(doc(db, "profiles", profile.id), { subprofiles: updatedSubprofiles });
    };

     const handleUpdateSubprofile = async (id: string, newName: string, newThemeId: string) => {
        if (!profile) return;
        const updatedSubprofiles = profile.subprofiles.map(sub =>
            sub.id === id ? { ...sub, name: newName, themeId: newThemeId } : sub
        );
        await updateDoc(doc(db, "profiles", profile.id), { subprofiles: updatedSubprofiles });
    };
    
     const handleBulkSave = async (transactions: TransactionFormState[]) => {
        if (!profile) return;
        const batch = writeBatch(db);
        const transactionsRef = collection(db, 'transactions');
        transactions.forEach(transaction => {
            const docRef = doc(transactionsRef);
            batch.set(docRef, { ...transaction, profileId: profile.id, createdAt: serverTimestamp() });
        });
        await batch.commit();
    };

    const handleArchiveSubprofile = async () => {
        if (!profile || !subprofileToArchive) return;
        const updatedSubprofiles = profile.subprofiles.map(sub => 
            sub.id === subprofileToArchive.id ? { ...sub, status: 'archived' } : sub
        );
        await updateDoc(doc(db, "profiles", profile.id), { subprofiles: updatedSubprofiles });
        handleTabClick('geral');
        setSubprofileToArchive(null);
    };

    const handleSaveSettings = async (newSettings: Partial<Profile>) => {
        if (!profile || !profileId) return;

        const oldMethod = profile.apportionmentMethod;
        const newMethod = newSettings.apportionmentMethod;

        await updateDoc(doc(db, "profiles", profileId), newSettings);
        
        const batch = writeBatch(db);
        const transactionsRef = collection(db, 'transactions');
        
        if (newMethod === 'proportional' && oldMethod !== 'proportional') {
            const sharedExpenses = allTransactions.filter(t => t.isShared && !t.isApportioned);
            
            if (subprofileRevenueProportions.size > 0 && sharedExpenses.length > 0) {
                sharedExpenses.forEach(parent => {
                    subprofileRevenueProportions.forEach((proportion, subId) => {
                        const childDocRef = doc(transactionsRef);
                        const childData: Omit<Transaction, 'id'> = {
                            ...(parent as Omit<Transaction, 'id' | 'createdAt'>),
                            profileId: profile.id,
                            description: `[Rateio] ${parent.description}`,
                            planned: parent.planned * proportion,
                            actual: parent.actual * proportion,
                            isShared: false,
                            isApportioned: true,
                            parentId: parent.id,
                            subprofileId: subId,
                            createdAt: serverTimestamp()
                        };
                        batch.set(childDocRef, childData);
                    });
                });
            }
        } 
        else if (newMethod === 'manual' && oldMethod === 'proportional') {
            const apportionedChildren = allTransactions.filter(t => t.isApportioned);
            apportionedChildren.forEach(child => {
                const docRef = doc(db, 'transactions', child.id);
                batch.delete(docRef);
            });
        }
    
        await batch.commit();
        setIsSettingsModalOpen(false);
    };

    if (profileLoading || monthsLoading) return <LoadingScreen />;
    if (!profile) return <div>Perfil não encontrado.</div>;

    const formattedMonth = currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase());
    const activeSubprofiles = profile.subprofiles.filter(s => s.status === 'active');
    if (!sortConfig) return <LoadingScreen />;

    return (
        <div className="p-4 md:p-6 lg:p-10 space-y-6">
            <DashboardHeader
                profileName={profile.name}
                activeTab={activeTab}
                currentMonth={currentMonth}
                formattedMonth={formattedMonth}
                isCurrentMonthClosed={isCurrentMonthClosed}
                canCloseMonth={canCloseMonth}
                allTransactionsPaid={allTransactionsPaid}
                canGoToPreviousMonth={availableMonths.length > 0 && currentMonthString > availableMonths[0]}
                canGoToNextMonth={availableMonths.length > 0 && currentMonthString < availableMonths[availableMonths.length - 1]}
                changeMonth={changeMonth}
                handleCloseMonthAttempt={() => canCloseMonth && setIsCloseMonthModalOpen(true)}
                onExport={() => setIsExportModalOpen(true)}
                onImport={() => setIsImportModalOpen(true)}
                onNewTransaction={handleOpenModalForNew}
                onOpenSettings={() => setIsSettingsModalOpen(true)}
            />
            
             <div className="border-b border-border-color">
                <nav className="-mb-px flex space-x-2 md:space-x-6 overflow-x-auto" aria-label="Tabs">
                    <button onClick={() => handleTabClick('geral')} className={`whitespace-nowrap py-4 px-1 md:px-2 border-b-2 font-medium text-sm ${activeTab === 'geral' ? 'text-accent border-accent' : 'border-transparent text-text-secondary hover:text-text-primary hover:border-text-secondary'}`}>
                        Visão Geral
                    </button>
                    {activeSubprofiles.map(sub => (
                        <div key={sub.id} onContextMenu={(e) => { e.preventDefault(); setContextMenu({ x: e.pageX, y: e.pageY, subprofile: sub }); }} className="relative group">
                            <button onClick={() => handleTabClick(sub.id)} className={`whitespace-nowrap py-4 px-1 md:px-2 border-b-2 font-medium text-sm ${activeTab === sub.id ? 'text-accent border-accent' : 'border-transparent text-text-secondary hover:text-text-primary hover:border-gray-300'}`}>
                                {sub.name}
                            </button>
                        </div>
                    ))}
                    {activeSubprofiles.length < 10 && (
                        <button onClick={() => setIsSubprofileModalOpen(true)} className="py-4 px-2 text-text-secondary hover:text-accent">
                            <Plus size={16} />
                        </button>
                    )}
                </nav>
            </div>
            
            {transactionsLoading ? (
                <div className="text-center py-10 text-text-secondary">A carregar transações...</div>
            ) : (
                <>
                    <SummaryCards data={filteredData} activeTab={activeTab} />
                    <div className="grid grid-cols-1 gap-6">
                        {activeTab !== 'geral' && <TransactionTable title="Receitas" data={sortedData.receitas} type="income" onEdit={handleOpenModalForEdit} onDelete={setTransactionToDelete} requestSort={requestSort} onTogglePaid={handleTogglePaid} onUpdateField={handleFieldUpdate} sortConfig={sortConfig} isClosed={isCurrentMonthClosed} />}
                        <TransactionTable 
                            title={activeTab === 'geral' ? 'Despesas da Casa' : 'Despesas Individuais'} 
                            data={sortedData.despesas} 
                            type="expense" 
                            onEdit={handleOpenModalForEdit} 
                            onDelete={setTransactionToDelete} 
                            requestSort={requestSort} 
                            onTogglePaid={handleTogglePaid} 
                            onUpdateField={handleFieldUpdate} 
                            sortConfig={sortConfig} 
                            isClosed={isCurrentMonthClosed}
                            subprofileRevenueProportions={subprofileRevenueProportions}
                            subprofiles={profile.subprofiles}
                            apportionmentMethod={profile.apportionmentMethod}
                        />
                    </div>
                </>
            )}

            {/* Modais */}
            <TransactionModal isOpen={isTransactionModalOpen} onClose={() => setIsTransactionModalOpen(false)} title={modalInitialValues?.id ? 'Editar Transação' : 'Nova Transação'}>
                <TransactionForm onClose={() => setIsTransactionModalOpen(false)} onSave={handleSaveTransaction} initialValues={modalInitialValues} isSubprofileView={activeTab !== 'geral'} />
            </TransactionModal>
            <AddSubprofileModal isOpen={isSubprofileModalOpen} onClose={() => setIsSubprofileModalOpen(false)} onSave={handleCreateSubprofile} />
            <EditSubprofileModal isOpen={!!subprofileToEdit} onClose={() => setSubprofileToEdit(null)} onSave={handleUpdateSubprofile} subprofile={subprofileToEdit} />
            <DeleteConfirmationModal isOpen={!!subprofileToArchive} onClose={() => setSubprofileToArchive(null)} onConfirm={handleArchiveSubprofile} itemName={subprofileToArchive?.name || ''} title={`Arquivar "${subprofileToArchive?.name}"`} message={<p>Esta ação não irá apagar os dados. Para confirmar, digite <strong className="text-text-primary">{subprofileToArchive?.name}</strong>.</p>} confirmButtonText='Arquivar' />
            <ConfirmationModal isOpen={isCloseMonthModalOpen} onClose={() => setIsCloseMonthModalOpen(false)} onConfirm={performCloseMonth} title="Fechar o Mês?" message="Esta ação é irreversível e irá criar as transações recorrentes para o próximo mês. Deseja continuar?" />
            <ConfirmationModal isOpen={!!transactionToDelete} onClose={() => setTransactionToDelete(null)} onConfirm={performDelete} title="Excluir Transação" message="Tem a certeza que quer excluir este item? Esta ação não pode ser desfeita." />
            <ImportModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} onSave={handleBulkSave} activeSubprofileId={activeTab} />
            <ExportModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} profile={profile} activeSubprofileId={activeTab} allTransactions={allTransactions} />
            {contextMenu && <SubprofileContextMenu subprofile={contextMenu.subprofile} x={contextMenu.x} y={contextMenu.y} onClose={() => setContextMenu(null)} onEdit={(sub) => { setSubprofileToEdit(sub); setContextMenu(null); }} onArchive={(sub) => { setSubprofileToArchive(sub); setContextMenu(null); }} />}
            <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} onSave={handleSaveSettings} profile={profile} />
        </div>
    );
};