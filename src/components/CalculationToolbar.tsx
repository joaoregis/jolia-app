// src/components/CalculationToolbar.tsx

import React from 'react';
import { formatCurrency } from '../lib/utils';
import { X, Trash2, ArrowRightLeft, Ban, RefreshCw, AlertTriangle } from 'lucide-react';
import { Transaction } from '../types';
import { validateBatchSelection } from '../logic/batchValidation';

interface CalculationData {
    count: number;
    sumPlanned: number;
    sumActual: number;
}

interface CalculationToolbarProps {
    selections: {
        income?: CalculationData;
        expense?: CalculationData;
        ignored?: CalculationData;
    };
    selectedTransactions: Transaction[];
    onClearSelection: () => void;
    onBatchTransfer: (transactions: Transaction[]) => void;
    onBatchDelete: (transactions: Transaction[]) => void;
    onBatchSkip: (transactions: Transaction[]) => void;
    onBatchUnskip: (transactions: Transaction[]) => void;
}

export const CalculationToolbar: React.FC<CalculationToolbarProps> = ({
    selections,
    selectedTransactions,
    onClearSelection,
    onBatchTransfer,
    onBatchDelete,
    onBatchSkip,
    onBatchUnskip
}) => {
    const totalCount = (selections.income?.count || 0) + (selections.expense?.count || 0) + (selections.ignored?.count || 0);

    if (totalCount === 0) {
        return null;
    }

    const hasActive = (selections.income?.count || 0) + (selections.expense?.count || 0) > 0;
    const hasIgnored = (selections.ignored?.count || 0) > 0;
    const isMixed = hasActive && hasIgnored;

    const handleAction = (action: 'transfer' | 'delete' | 'skip' | 'unskip') => {
        if (isMixed) {
            alert('Não é possível realizar ações em massa com tipos de itens misturados (ativos e ignorados).\nPor favor, selecione apenas um tipo.');
            return;
        }

        // For active items, run the standard validation
        if (hasActive) {
            const validation = validateBatchSelection(selectedTransactions);
            if (!validation.valid) {
                alert(validation.message);
                return;
            }
        }

        switch (action) {
            case 'transfer':
                onBatchTransfer(selectedTransactions);
                break;
            case 'delete':
                if (confirm(`Tem certeza que deseja excluir ${totalCount} itens?`)) {
                    onBatchDelete(selectedTransactions);
                }
                break;
            case 'skip':
                onBatchSkip(selectedTransactions);
                break;
            case 'unskip':
                if (confirm(`Deseja reativar ${totalCount} itens?`)) {
                    onBatchUnskip(selectedTransactions);
                }
                break;
        }
    };

    const Stat: React.FC<{ title: string; planned: number; actual?: number; className?: string }> = ({ title, planned, actual, className }) => (
        <div className={`text-center px-3 py-1.5 rounded-lg ${className}`}>
            <div className="text-xs font-bold">{title}</div>
            <div className="text-sm">
                {typeof actual === 'number' ? (
                    <span className="font-semibold" title="Efetivo">{formatCurrency(actual)}</span>
                ) : (
                    <span className="font-semibold" title="Previsto">{formatCurrency(planned)}</span>
                )}
                {typeof actual === 'number' && planned !== actual && (
                    <span className="text-xs opacity-70 ml-1" title="Previsto">({formatCurrency(planned)})</span>
                )}
            </div>
        </div>
    );

    return (
        <div className="fixed bottom-4 right-4 z-50 max-w-[95vw] md:max-w-[80vw]">
            <div className="bg-card border border-border-color rounded-xl shadow-2xl p-3 flex flex-col md:flex-row items-center gap-4 animate-slide-up w-auto">

                {/* Stats Section */}
                <div className="flex items-center gap-3 border-b md:border-b-0 md:border-r border-border-color pb-2 md:pb-0 md:pr-4">
                    <div className="text-sm font-bold text-text-primary bg-accent/20 text-accent rounded-lg px-3 py-1 whitespace-nowrap">
                        {totalCount} {totalCount > 1 ? 'itens' : 'item'}
                    </div>

                    <div className="flex gap-2">
                        {selections.income?.count && (
                            <Stat title="Receitas" planned={selections.income.sumPlanned} actual={selections.income.sumActual} className="bg-green-500/10 text-green-400" />
                        )}
                        {selections.expense?.count && (
                            <Stat title="Despesas" planned={selections.expense.sumPlanned} actual={selections.expense.sumActual} className="bg-red-500/10 text-red-400" />
                        )}
                        {selections.ignored?.count && (
                            <Stat title="Ignorados" planned={selections.ignored.sumPlanned} className="bg-amber-500/10 text-amber-400" />
                        )}
                    </div>
                </div>

                {/* Actions Section */}
                <div className="flex items-center gap-2">
                    {isMixed ? (
                        <div className="flex items-center gap-2 text-amber-400 text-sm px-2 font-medium bg-amber-500/10 rounded-lg py-1.5">
                            <AlertTriangle size={16} />
                            <span className="hidden sm:inline">Seleção mista detectada</span>
                        </div>
                    ) : hasIgnored ? (
                        <button
                            onClick={() => handleAction('unskip')}
                            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-text-primary bg-muted/50 hover:bg-muted rounded-lg transition-colors border border-transparent hover:border-border-color"
                            title="Reativar selecionados"
                        >
                            <RefreshCw size={16} className="text-green-400" />
                            <span className="hidden sm:inline">Reativar</span>
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={() => handleAction('transfer')}
                                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-text-primary bg-muted/50 hover:bg-muted rounded-lg transition-colors border border-transparent hover:border-border-color"
                                title="Transferir Selecionados"
                            >
                                <ArrowRightLeft size={16} className="text-blue-400" />
                                <span className="hidden sm:inline">Transferir</span>
                            </button>

                            <button
                                onClick={() => handleAction('skip')}
                                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-text-primary bg-muted/50 hover:bg-muted rounded-lg transition-colors border border-transparent hover:border-border-color"
                                title="Ignorar neste mês"
                            >
                                <Ban size={16} className="text-amber-400" />
                                <span className="hidden sm:inline">Ignorar</span>
                            </button>

                            <button
                                onClick={() => handleAction('delete')}
                                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-text-primary bg-muted/50 hover:bg-red-900/20 rounded-lg transition-colors border border-transparent hover:border-red-900/30 group"
                                title="Excluir Selecionados"
                            >
                                <Trash2 size={16} className="text-red-400 group-hover:text-red-500" />
                                <span className="hidden sm:inline group-hover:text-red-400">Excluir</span>
                            </button>
                        </>
                    )}
                </div>

                <div className="w-px h-8 bg-border-color hidden md:block"></div>

                <button
                    onClick={onClearSelection}
                    className="p-2 rounded-full text-text-secondary hover:bg-background"
                    title="Limpar Seleção"
                >
                    <X size={20} />
                </button>
            </div>
        </div>
    );
};