// src/components/CalculationToolbar.tsx

import React from 'react';
import { formatCurrency } from '../lib/utils';
import { X } from 'lucide-react';

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
    onClearSelection: () => void;
}

export const CalculationToolbar: React.FC<CalculationToolbarProps> = ({
    selections,
    onClearSelection
}) => {
    const totalCount = (selections.income?.count || 0) + (selections.expense?.count || 0) + (selections.ignored?.count || 0);

    if (totalCount === 0) {
        return null;
    }

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
        <div className="fixed bottom-4 right-4 z-50 max-w-[90vw]">
            <div className="bg-card border border-border-color rounded-xl shadow-2xl p-2 flex flex-wrap items-center justify-center gap-3 animate-slide-up w-auto">
                <div className="text-sm font-bold text-text-primary bg-accent/20 text-accent rounded-lg px-3 py-1 whitespace-nowrap">
                    {totalCount} {totalCount > 1 ? 'itens' : 'item'}
                </div>

                <div className="flex flex-wrap justify-center items-center gap-2">
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