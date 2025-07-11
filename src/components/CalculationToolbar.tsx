// src/components/CalculationToolbar.tsx

import React from 'react';
import { formatCurrency } from '../lib/utils';
import { X } from 'lucide-react';

interface CalculationToolbarProps {
    selectedCount: number;
    sumPlanned: number;
    sumActual: number;
    onClearSelection: () => void;
}

export const CalculationToolbar: React.FC<CalculationToolbarProps> = ({
    selectedCount,
    sumPlanned,
    sumActual,
    onClearSelection
}) => {
    if (selectedCount === 0) {
        return null;
    }

    const Stat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
        <div className="text-center">
            <div className="text-xs text-text-secondary">{label}</div>
            <div className="font-bold text-text-primary">{value}</div>
        </div>
    );

    return (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-full max-w-4xl z-50 px-4">
            <div className="bg-card border border-border-color rounded-xl shadow-2xl p-4 flex items-center justify-between animate-fade-in-up">
                <div className="flex items-center gap-4">
                    <div className="text-sm font-bold text-text-primary bg-accent/20 text-accent rounded-full px-3 py-1">
                        {selectedCount} {selectedCount > 1 ? 'itens selecionados' : 'item selecionado'}
                    </div>
                </div>
                <div className="hidden md:flex items-center gap-12">
                    <Stat label="Soma Prevista" value={formatCurrency(sumPlanned)} />
                    <Stat label="Soma Efetiva" value={formatCurrency(sumActual)} />
                </div>
                <button
                    onClick={onClearSelection}
                    className="p-2 rounded-full text-text-secondary hover:bg-background"
                    title="Limpar Seleção"
                >
                    <X size={20} />
                </button>
            </div>
            <style>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translate(-50%, 20px); }
                    to { opacity: 1; transform: translate(-50%, 0); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};