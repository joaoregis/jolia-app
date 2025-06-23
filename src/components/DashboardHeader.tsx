// src/components/DashboardHeader.tsx
import React from 'react';
import { Profile } from '../types';
import { ChevronLeft, ChevronRight, Lock, ShieldCheck, Download, Upload, PlusCircle, MoreVertical } from 'lucide-react';

interface DashboardHeaderProps {
    profile: Profile;
    activeTab: string;
    currentMonth: Date;
    formattedMonth: string;
    isCurrentMonthClosed: boolean;
    canCloseMonth: boolean;
    allTransactionsPaid: boolean;
    canGoToPreviousMonth: boolean;
    canGoToNextMonth: boolean;
    changeMonth: (amount: number) => void;
    handleCloseMonthAttempt: () => void;
    onExport: () => void;
    onImport: () => void;
    onNewTransaction: () => void;
}

// Menu de ações para telas menores
const ActionMenu: React.FC<Pick<DashboardHeaderProps, 'onExport' | 'onImport' | 'isCurrentMonthClosed' | 'activeTab'>> =
({ onExport, onImport, isCurrentMonthClosed, activeTab }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const menuRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    return (
        <div className="relative" ref={menuRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-lg bg-card text-text-primary hover:opacity-80 border border-border-color">
                <MoreVertical size={16}/>
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-card ring-1 ring-black ring-opacity-5 z-20 border border-border-color">
                    <div className="py-1">
                        <button onClick={() => { onExport(); setIsOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:bg-background">
                           <Download size={16}/> Exportar
                        </button>
                         <button onClick={() => { onImport(); setIsOpen(false); }} disabled={isCurrentMonthClosed || activeTab === 'geral'} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:bg-background disabled:opacity-50">
                           <Upload size={16}/> Importar
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}


export const DashboardHeader: React.FC<DashboardHeaderProps> = (props) => {
    const {
        profile,
        activeTab,
        formattedMonth,
        isCurrentMonthClosed,
        canCloseMonth,
        allTransactionsPaid,
        canGoToPreviousMonth,
        canGoToNextMonth,
        changeMonth,
        handleCloseMonthAttempt,
        onExport,
        onImport,
        onNewTransaction
    } = props;

    const currentSubprofileName = profile.subprofiles.find(s => s.id === activeTab)?.name;

    let closeMonthTitle = 'Fechar o mês e criar recorrências';
    if (!allTransactionsPaid) closeMonthTitle = 'Pague todas as contas antes de fechar o mês';
    else if (!canCloseMonth) closeMonthTitle = 'Feche os meses anteriores primeiro';

    return (
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-text-primary">
                    Dashboard: {profile.name}
                    {activeTab !== 'geral' && (
                        <>
                            <span className="mx-2 font-light text-text-secondary">/</span>
                            <span className="font-semibold">{currentSubprofileName}</span>
                        </>
                    )}
                </h2>
                <div className="flex items-center gap-2 mt-2 md:mt-1 whitespace-nowrap">
                    <button
                        onClick={() => changeMonth(-1)}
                        className="p-1 rounded-full text-text-secondary hover:bg-accent hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                        disabled={!canGoToPreviousMonth}
                        title={!canGoToPreviousMonth ? "Não há registos em meses anteriores" : "Mês anterior"}
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <span className="font-semibold text-center min-w-[150px] text-text-secondary">
                        {formattedMonth}
                    </span>
                    <button
                        onClick={() => changeMonth(1)}
                        className="p-1 rounded-full text-text-secondary hover:bg-accent hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                        disabled={!canGoToNextMonth}
                        title={!canGoToNextMonth ? "Não há registos em meses futuros" : "Mês seguinte"}
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
                 {isCurrentMonthClosed ? (
                    <span className="flex-grow md:flex-grow-0 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-background text-text-secondary border border-border-color">
                        <ShieldCheck size={16}/> Mês Fechado
                    </span>
                ) : (
                    <button
                        onClick={handleCloseMonthAttempt}
                        disabled={!canCloseMonth}
                        className="flex-grow md:flex-grow-0 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-slate-400 disabled:cursor-not-allowed"
                        title={closeMonthTitle}
                    >
                        <Lock size={16}/> Fechar Mês
                    </button>
                )}
                 <div className="hidden md:flex items-center gap-2">
                     <button onClick={onExport} className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-card text-text-primary hover:opacity-80 border border-border-color">
                        <Download size={16}/> Exportar
                    </button>
                     <button
                        onClick={onImport}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-card text-text-primary hover:opacity-80 border border-border-color disabled:opacity-50"
                        disabled={isCurrentMonthClosed || activeTab === 'geral'}
                    >
                        <Upload size={16}/> Importar
                    </button>
                 </div>
                 <div className="md:hidden">
                    <ActionMenu onExport={onExport} onImport={onImport} isCurrentMonthClosed={isCurrentMonthClosed} activeTab={activeTab} />
                 </div>

                <button
                    onClick={onNewTransaction}
                    className="flex-grow md:flex-grow-0 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent-hover disabled:opacity-50"
                    disabled={isCurrentMonthClosed}
                >
                    <PlusCircle size={16}/>
                    <span className="hidden lg:inline">Nova Transação</span>
                </button>
            </div>
        </div>
    );
};
