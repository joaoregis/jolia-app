// src/screens/DashboardScreen.tsx

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, onSnapshot, query, where, QuerySnapshot, DocumentData, addDoc, updateDoc, deleteDoc, doc, writeBatch, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { AppData, Profile, SortConfig, Subprofile, Transaction, TransactionFormState } from '../types';

import { TransactionTable } from '../components/TransactionTable';
import { TransactionModal } from '../components/TransactionModal';
import { TransactionForm } from '../components/TransactionForm';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { AddSubprofileModal } from '../components/AddSubprofileModal';
import { ImportModal } from '../components/ImportModal';
import { DeleteConfirmationModal } from '../components/DeleteConfirmationModal';
import { ExportModal } from '../components/ExportModal';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';

import { formatCurrency } from '../lib/utils';
import { PlusCircle, Plus, Upload, Trash2, Download, ChevronLeft, ChevronRight, Lock, ShieldCheck } from 'lucide-react';

export const DashboardScreen: React.FC = () => {
    const { profileId, '*': subprofileId } = useParams<{ profileId: string; '*': string }>();
    const navigate = useNavigate();

    const [profile, setProfile] = useState<Profile | null>(null);
    const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
    const [isSubprofileModalOpen, setIsSubprofileModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [modalInitialValues, setModalInitialValues] = useState<Partial<Transaction> | null>(null);
    const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
    const [subprofileToArchive, setSubprofileToArchive] = useState<Subprofile | null>(null);
    const [sortConfig, setSortConfig] = useState<SortConfig | null>({ key: 'date', direction: 'descending' });
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
    const [isCloseMonthModalOpen, setIsCloseMonthModalOpen] = useState(false);
    
    const [availableMonths, setAvailableMonths] = useState<string[]>([]);
    const [monthsLoading, setMonthsLoading] = useState(true);
    
    const activeTab = subprofileId || 'geral';

    const handleTabClick = useCallback((tabId: string) => {
        const path = tabId === 'geral' ? `/profile/${profileId}` : `/profile/${profileId}/${tabId}`;
        navigate(path);
    }, [profileId, navigate]);

    useEffect(() => {
        if (!profileId) return;
        const profileDocRef = doc(db, 'profiles', profileId);
        const unsubscribe = onSnapshot(profileDocRef, (doc) => {
            if (doc.exists()) setProfile({ id: doc.id, ...doc.data() } as Profile);
            else { console.error("Perfil não encontrado!"); navigate('/'); }
        });
        return () => unsubscribe();
    }, [profileId, navigate]);

    useEffect(() => {
        if (!profile) return;

        setMonthsLoading(true);
        const q = query(collection(db, "transactions"), where("profileId", "==", profile.id), orderBy("date"));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const months = new Set<string>();
            snapshot.forEach(doc => {
                const transactionDate = doc.data().date;
                if (transactionDate && typeof transactionDate === 'string') {
                    const monthStr = transactionDate.substring(0, 7);
                    months.add(monthStr);
                }
            });
            
            const sortedMonths = Array.from(months).sort();
            setAvailableMonths(sortedMonths);
            setMonthsLoading(false);
        }, (error) => {
            console.error("Erro ao buscar meses disponíveis:", error);
            setMonthsLoading(false);
        });

        return () => unsubscribe();
    }, [profile]);
    
    // --- MELHORIA: Define o mês inicial como o último mês em aberto ---
    useEffect(() => {
        if (monthsLoading || !profile) return;

        const closedMonthsSet = new Set(profile.closedMonths || []);
        
        // Encontra o primeiro mês na lista de meses disponíveis que NÃO está fechado
        const firstOpenMonthStr = availableMonths.find(month => !closedMonthsSet.has(month));

        if (firstOpenMonthStr) {
            // Se encontrou um mês aberto, define-o como o mês atual
            const [year, month] = firstOpenMonthStr.split('-').map(Number);
            setCurrentMonth(new Date(year, month - 1, 1));
        } else if (availableMonths.length > 0) {
            // Se todos os meses com dados estiverem fechados, vai para o mês seguinte ao último fechado
             const lastMonthStr = availableMonths[availableMonths.length - 1];
             const [year, month] = lastMonthStr.split('-').map(Number);
             setCurrentMonth(new Date(year, month, 1)); // month já é 0-based, então month+1 é month
        }
        else {
            // Se não houver dados nenhuns, mantém o mês atual do calendário
            setCurrentMonth(new Date());
        }

    }, [monthsLoading, availableMonths, profile]);


    useEffect(() => {
        if (!profile) return;
        setLoading(true);
        const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).toISOString().split('T')[0];
        const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).toISOString().split('T')[0];

        const q = query(
            collection(db, "transactions"), 
            where("profileId", "==", profile.id),
            where("date", ">=", startOfMonth),
            where("date", "<=", endOfMonth)
        );

        const unsubscribe = onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
            const transactions = snapshot.docs.map(d => ({ ...d.data(), id: d.id })) as Transaction[];
            setAllTransactions(transactions);
            setLoading(false);
        }, (error) => {
            console.error("Erro ao buscar transações: ", error);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [profile, currentMonth]);
    
    const filteredData = useMemo<AppData>(() => {
        let result: AppData = { receitas: [], despesas: [] };
        if (activeTab === 'geral') {
            result.despesas = allTransactions.filter(t => t.type === 'expense' && t.isShared);
        } else {
            result.receitas = allTransactions.filter(t => t.type === 'income' && t.subprofileId === activeTab);
            result.despesas = allTransactions.filter(t => t.type === 'expense' && !t.isShared && t.subprofileId === activeTab);
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
                if (aVal == null) return 1;
                if (bVal == null) return -1;
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
    
    const currentMonthString = useMemo(() => {
        return `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;
    }, [currentMonth]);
    
    const isCurrentMonthClosed = useMemo(() => {
        return profile?.closedMonths?.includes(currentMonthString) || false;
    }, [profile, currentMonthString]);

    const allTransactionsPaid = useMemo(() => {
        if (allTransactions.length === 0) return true;
        return allTransactions.every(t => t.paid === true);
    }, [allTransactions]);

    const canCloseMonth = useMemo(() => {
        if (!profile || isCurrentMonthClosed || !allTransactionsPaid || availableMonths.length === 0) {
            return false;
        }

        const closedMonthsSet = new Set(profile.closedMonths || []);
        const firstMonthWithData = availableMonths[0];

        const getYearMonth = (dateStr: string) => ({ year: parseInt(dateStr.substring(0, 4)), month: parseInt(dateStr.substring(5, 7)) - 1 });
        const start = new Date(getYearMonth(firstMonthWithData).year, getYearMonth(firstMonthWithData).month, 1);
        const current = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);

        let d = new Date(start);
        while (d.getTime() < current.getTime()) {
            const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            if (!closedMonthsSet.has(monthStr)) {
                return false;
            }
            d.setMonth(d.getMonth() + 1);
        }
        
        return true;
    }, [profile, availableMonths, currentMonth, isCurrentMonthClosed, allTransactionsPaid]);
    
    const canGoToPreviousMonth = useMemo(() => {
        if (monthsLoading || availableMonths.length === 0) return false;
        return currentMonthString > availableMonths[0];
    }, [currentMonthString, availableMonths, monthsLoading]);

    const canGoToNextMonth = useMemo(() => {
        if (monthsLoading || availableMonths.length === 0) return false;
        return currentMonthString < availableMonths[availableMonths.length - 1];
    }, [currentMonthString, availableMonths, monthsLoading]);
    
    const requestSort = useCallback((key: keyof Transaction) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    }, [sortConfig]);
    
    const handleOpenModalForNew = useCallback(() => {
        if (isCurrentMonthClosed) return;
        const date = new Date(currentMonth);
        date.setDate(1);
        const dateString = date.toISOString().split('T')[0];

        if (activeTab === 'geral') {
            setModalInitialValues({ type: 'expense', isShared: true, paid: false, isRecurring: true, date: dateString });
        } else {
            setModalInitialValues({ subprofileId: activeTab, isShared: false, paid: false, type: 'expense', date: dateString });
        }
        setIsTransactionModalOpen(true);
    }, [activeTab, isCurrentMonthClosed, currentMonth]);

    const handleOpenModalForEdit = useCallback((t: Transaction) => {
        if(isCurrentMonthClosed) return;
        setModalInitialValues(t);
        setIsTransactionModalOpen(true);
    }, [isCurrentMonthClosed]);
    
    const handleSaveTransaction = async (d: TransactionFormState, id?: string) => {
        if (!profile) return;
        const dataToSave: Partial<Transaction> = { ...d, profileId: profile.id };
        if (dataToSave.isShared) { 
            dataToSave.subprofileId = undefined; 
        } else if (!id) { 
            dataToSave.subprofileId = activeTab; 
        }
        
        try {
            if (id) { 
                await updateDoc(doc(db, "transactions", id), dataToSave); 
            } else { 
                await addDoc(collection(db, "transactions"), dataToSave as DocumentData); 
            }
            setIsTransactionModalOpen(false);
        } catch (error) {
            console.error("Erro ao salvar transação: ", error);
            alert("Ocorreu um erro ao salvar a transação.");
        }
    };

    const handleFieldUpdate = async (transactionId: string, field: keyof Transaction, value: any) => {
        const transactionRef = doc(db, 'transactions', transactionId);
        try {
            await updateDoc(transactionRef, { [field]: value });
        } catch(error) {
            console.error("Erro ao atualizar campo:", error);
        }
    }
    
    const handleTogglePaidStatus = async (id: string, currentStatus: boolean) => {
        if (isCurrentMonthClosed) return;
        const transactionRef = doc(db, 'transactions', id);
        try {
            await updateDoc(transactionRef, { paid: !currentStatus });
        } catch (error) {
            console.error("Erro ao atualizar o status:", error);
        }
    };
    
    const handleDelete = useCallback((id: string) => { 
        if (isCurrentMonthClosed) return;
        setTransactionToDelete(id); 
    }, [isCurrentMonthClosed]);
    
    const changeMonth = useCallback((amount: number) => {
        setCurrentMonth(prev => {
            const newDate = new Date(prev);
            newDate.setDate(1);
            newDate.setMonth(newDate.getMonth() + amount);
            return newDate;
        });
    }, []);

    const handleCloseMonthAttempt = useCallback(() => {
        if (isCurrentMonthClosed) {
            alert('Este mês já foi fechado.');
            return;
        }
        if (!allTransactionsPaid) {
            alert('É necessário que todas as transações estejam pagas/recebidas.');
            return;
        }
        if (!canCloseMonth) {
            alert('Feche os meses anteriores primeiro para poder fechar este.');
            return;
        }
        setIsCloseMonthModalOpen(true);
    }, [canCloseMonth, isCurrentMonthClosed, allTransactionsPaid]);

    const performCloseMonth = async () => {
        if (!profile) return;
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
                
                const docRef = doc(transactionsRef);
                batch.set(docRef, newTransactionData);
            });
            await batch.commit();
        }
        
        const updatedClosedMonths = [...(profile.closedMonths || []), currentMonthString];
        await updateDoc(doc(db, "profiles", profile.id), { closedMonths: updatedClosedMonths });
        changeMonth(1);
    };

    const handleCreateSubprofile = async (name: string) => {
        if (!profile) return;
        const newSubprofile: Subprofile = {
            id: name.trim().toLowerCase().replace(/\s+/g, '-'),
            name: name.trim(),
            status: 'active'
        };
        const updatedSubprofiles = [...profile.subprofiles, newSubprofile];
        await updateDoc(doc(db, "profiles", profile.id), { subprofiles: updatedSubprofiles });
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
    
    const handleBulkSave = async (transactions: TransactionFormState[]) => {
        if (!profile) return;
        const batch = writeBatch(db);
        const transactionsRef = collection(db, 'transactions');
        transactions.forEach(transaction => {
            const docRef = doc(transactionsRef);
            batch.set(docRef, { ...transaction, profileId: profile.id });
        });
        await batch.commit();
    };
    
    const performDelete = async () => { 
        if(transactionToDelete) {
            await deleteDoc(doc(db, "transactions", transactionToDelete));
            setTransactionToDelete(null);
        }
    };
    
    if (loading || !profile || monthsLoading) return <div className="flex h-screen items-center justify-center bg-slate-100 dark:bg-slate-900 text-slate-500">A carregar dados do perfil...</div>;

    const activeSubprofiles = profile.subprofiles.filter(s => s.status === 'active');
    const canAddSubprofile = activeSubprofiles.length < 10;
    
    const totalReceitaPrevisto = filteredData.receitas.reduce((acc, r) => acc + r.planned, 0);
    const totalReceitaEfetivo = filteredData.receitas.reduce((acc, r) => acc + r.actual, 0);
    const totalDespesaPrevisto = filteredData.despesas.reduce((acc, d) => acc + d.planned, 0);
    const totalDespesaEfetivo = filteredData.despesas.reduce((acc, d) => acc + d.actual, 0);
    const saldoPrevisto = totalReceitaPrevisto - totalDespesaPrevisto;
    const saldoEfetivo = totalReceitaEfetivo - totalDespesaEfetivo;
    const formattedMonth = currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase());
    const currentSubprofileName = profile.subprofiles.find(s => s.id === activeTab)?.name;

    let closeMonthTitle = 'Fechar o mês e criar recorrências';
    if (!allTransactionsPaid) closeMonthTitle = 'Pague todas as contas antes de fechar o mês';
    else if (!canCloseMonth) closeMonthTitle = 'Feche os meses anteriores primeiro';

    return (
        <>
            <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                            Dashboard: {profile.name}
                            {activeTab !== 'geral' && (
                                <>
                                    <span className="mx-2 font-light text-slate-400 dark:text-slate-500">/</span>
                                    <span className="font-semibold">{currentSubprofileName}</span>
                                </>
                            )}
                        </h2>
                        <div className="flex items-center gap-2 mt-1 whitespace-nowrap">
                            <button 
                                onClick={() => changeMonth(-1)} 
                                className="p-1 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
                                disabled={!canGoToPreviousMonth}
                                title={!canGoToPreviousMonth ? "Não há registos em meses anteriores" : "Mês anterior"}
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <span className="text-slate-500 dark:text-slate-400 font-semibold text-center min-w-[150px]">
                                {formattedMonth}
                            </span>
                            <button 
                                onClick={() => changeMonth(1)} 
                                className="p-1 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
                                disabled={!canGoToNextMonth}
                                title={!canGoToNextMonth ? "Não há registos em meses futuros" : "Mês seguinte"}
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {isCurrentMonthClosed ? (
                            <span className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-500 bg-slate-200 dark:bg-slate-700 dark:text-slate-400 rounded-lg">
                                <ShieldCheck size={16}/> Mês Fechado
                            </span>
                        ) : (
                            <button 
                                onClick={handleCloseMonthAttempt}
                                disabled={!canCloseMonth}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-slate-400 disabled:cursor-not-allowed"
                                title={closeMonthTitle}
                            >
                                <Lock size={16}/> Fechar Mês
                            </button>
                        )}
                        <button onClick={() => setIsExportModalOpen(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600">
                            <Download size={16}/> Exportar
                        </button>
                        {activeTab !== 'geral' && (
                            <button 
                                onClick={() => setIsImportModalOpen(true)} 
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 disabled:bg-slate-400 disabled:cursor-not-allowed"
                                disabled={isCurrentMonthClosed}
                            >
                                <Upload size={16}/> Importar
                            </button>
                        )}
                        <button 
                            onClick={handleOpenModalForNew} 
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed"
                            disabled={isCurrentMonthClosed}
                        >
                            <PlusCircle size={16}/> Nova Transação
                        </button>
                    </div>
                </div>
            
                <div className="border-b border-slate-200 dark:border-slate-700">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                        <button onClick={() => handleTabClick('geral')} className={`${activeTab === 'geral' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                            Visão Geral
                        </button>
                        {activeSubprofiles.map(sub => (
                            <div key={sub.id} className="relative group flex items-center">
                                <button onClick={() => handleTabClick(sub.id)} className={`${activeTab === sub.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                                    {sub.name}
                                </button>
                                <button onClick={() => setSubprofileToArchive(sub)} className="absolute -right-2 -top-1 p-1 text-slate-400 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity">
                                    <Trash2 size={12}/>
                                </button>
                            </div>
                        ))}
                        {canAddSubprofile && (
                            <button onClick={() => setIsSubprofileModalOpen(true)} className="py-4 px-2 text-slate-400 hover:text-blue-600">
                                <Plus size={16} />
                            </button>
                        )}
                    </nav>
                </div>
            
                <div className="grid gap-6">
                    {activeTab === 'geral' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader><CardTitle>Total Previsto (Despesas da Casa)</CardTitle></CardHeader>
                                <CardContent><div className="text-2xl font-bold text-slate-700 dark:text-slate-300">{formatCurrency(totalDespesaPrevisto)}</div></CardContent>
                            </Card>
                            <Card>
                                <CardHeader><CardTitle>Total Efetivo (Despesas da Casa)</CardTitle></CardHeader>
                                <CardContent><div className="text-2xl font-bold text-red-600">{formatCurrency(totalDespesaEfetivo)}</div></CardContent>
                            </Card>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                            <Card className="col-span-2 lg:col-span-1"><CardHeader><CardTitle>Receitas</CardTitle></CardHeader><CardContent><div className="text-xl font-bold text-green-600">{formatCurrency(totalReceitaEfetivo)}</div><p className="text-xs text-slate-500">Previsto: {formatCurrency(totalReceitaPrevisto)}</p></CardContent></Card>
                            <Card className="col-span-2 lg:col-span-1"><CardHeader><CardTitle>Despesas</CardTitle></CardHeader><CardContent><div className="text-xl font-bold text-red-600">{formatCurrency(totalDespesaEfetivo)}</div><p className="text-xs text-slate-500">Previsto: {formatCurrency(totalDespesaPrevisto)}</p></CardContent></Card>
                            <Card className="col-span-2 lg:col-span-1"><CardHeader><CardTitle>Balanço</CardTitle></CardHeader><CardContent><div className={`text-xl font-bold ${saldoEfetivo >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(saldoEfetivo)}</div><p className="text-xs text-slate-500">Previsto: {formatCurrency(saldoPrevisto)}</p></CardContent></Card>
                        </div>
                    )}
                </div>
            
                <div className="grid grid-cols-1 gap-6">
                    <TransactionTable title="Receitas" data={sortedData.receitas} type="income" onEdit={handleOpenModalForEdit} onDelete={handleDelete} requestSort={requestSort} onTogglePaid={handleTogglePaidStatus} onUpdateField={handleFieldUpdate} sortConfig={sortConfig} isClosed={isCurrentMonthClosed} />
                    <TransactionTable title={activeTab === 'geral' ? 'Despesas da Casa' : 'Despesas Individuais'} data={sortedData.despesas} type="expense" onEdit={handleOpenModalForEdit} onDelete={handleDelete} requestSort={requestSort} onTogglePaid={handleTogglePaidStatus} onUpdateField={handleFieldUpdate} sortConfig={sortConfig} isClosed={isCurrentMonthClosed} />
                </div>
            </div>
            
            <TransactionModal isOpen={isTransactionModalOpen} onClose={() => setIsTransactionModalOpen(false)} title={modalInitialValues?.id ? 'Editar Transação' : 'Nova Transação'}>
                <TransactionForm onClose={() => setIsTransactionModalOpen(false)} onSave={handleSaveTransaction} initialValues={modalInitialValues} />
            </TransactionModal>
            <AddSubprofileModal isOpen={isSubprofileModalOpen} onClose={() => setIsSubprofileModalOpen(false)} onSave={handleCreateSubprofile} />
            <DeleteConfirmationModal 
                isOpen={!!subprofileToArchive}
                onClose={() => setSubprofileToArchive(null)}
                onConfirm={handleArchiveSubprofile}
                itemName={subprofileToArchive?.name || ''}
                title={`Arquivar "${subprofileToArchive?.name}"`}
                message={<p>Esta ação não irá apagar os dados. Para confirmar, digite <strong className="dark:text-white">{subprofileToArchive?.name}</strong>.</p>}
                confirmButtonText='Arquivar'
            />
            <ConfirmationModal 
                isOpen={isCloseMonthModalOpen}
                onClose={() => setIsCloseMonthModalOpen(false)}
                onConfirm={performCloseMonth}
                title="Fechar o Mês?"
                message="Esta ação é irreversível e irá criar as transações recorrentes para o próximo mês. Deseja continuar?"
            />
            <ConfirmationModal 
                isOpen={!!transactionToDelete}
                onClose={() => setTransactionToDelete(null)}
                onConfirm={performDelete}
                title="Excluir Transação"
                message="Tem a certeza que quer excluir este item? Esta ação não pode ser desfeita."
            />
            <ImportModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} onSave={handleBulkSave} activeSubprofileId={activeTab} />
            {profile && 
                <ExportModal 
                    isOpen={isExportModalOpen} 
                    onClose={() => setIsExportModalOpen(false)}
                    profile={profile}
                    activeSubprofileId={activeTab}
                    allTransactions={allTransactions}
                />
            }
        </>
    );
};
