// src/components/SeriesEditConfirmationModal.tsx

import React from 'react';
import { Edit, Trash2 } from 'lucide-react';

type ActionType = 'edit' | 'delete';
type ScopeType = 'one' | 'future';

interface SeriesEditConfirmationModalProps {
    isOpen: boolean;
    actionType: ActionType;
    onClose: () => void;
    onConfirm: (scope: ScopeType) => void;
}

export const SeriesEditConfirmationModal: React.FC<SeriesEditConfirmationModalProps> = ({
    isOpen,
    actionType,
    onClose,
    onConfirm,
}) => {
    if (!isOpen) return null;

    const isEdit = actionType === 'edit';
    const title = isEdit ? 'Editar transação parcelada' : 'Excluir transação parcelada';
    const Icon = isEdit ? Edit : Trash2;
    const primaryColorClass = isEdit ? 'text-blue-500' : 'text-red-500';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-card rounded-lg shadow-xl w-full max-w-md animate-fade-in-up">
                <div className="p-6 text-center">
                    <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${isEdit ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                        <Icon className={`h-6 w-6 ${primaryColorClass}`} />
                    </div>
                    <h3 className="mt-5 text-lg font-medium text-text-primary">{title}</h3>
                    <p className="mt-2 text-sm text-text-secondary">
                        Esta transação faz parte de uma série. Escolha o que deseja {isEdit ? 'editar' : 'excluir'}:
                    </p>
                </div>
                <div className="px-6 pb-6 space-y-3">
                    <button
                        onClick={() => onConfirm('one')}
                        className="w-full text-left p-3 rounded-lg border-2 border-border-color hover:border-accent hover:bg-accent/10 transition-colors"
                    >
                        <p className="font-semibold text-text-primary">Apenas esta transação</p>
                        <p className="text-xs text-text-secondary">Altera somente esta ocorrência.</p>
                    </button>
                    <button
                        onClick={() => onConfirm('future')}
                        className="w-full text-left p-3 rounded-lg border-2 border-border-color hover:border-accent hover:bg-accent/10 transition-colors"
                    >
                        <p className="font-semibold text-text-primary">Esta e as futuras transações</p>
                        <p className="text-xs text-text-secondary">Altera esta e todas as ocorrências futuras da série.</p>
                    </button>
                </div>
                 <div className="bg-background/50 px-4 py-3 sm:px-6 flex flex-row-reverse rounded-b-lg">
                    <button
                        type="button"
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-border-color shadow-sm px-4 py-2 bg-card text-base font-medium text-text-primary hover:opacity-80 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm"
                        onClick={onClose}
                    >
                        Cancelar
                    </button>
                </div>
            </div>
             <style>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.2s ease-out forwards;
                }
            `}</style>
        </div>
    );
};