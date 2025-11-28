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
            <div className="bg-card rounded-lg shadow-xl w-full max-w-md animate-zoom-in">
                <div className="p-6 text-center">
                    <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${isEdit ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                        <Icon className={`h-6 w-6 ${primaryColorClass}`} />
                    </div>
                    <h3 className="mt-5 text-lg font-medium text-text-primary">{title}</h3>
                    <div className="mt-2">
                        <p className="text-sm text-text-secondary">
                            Esta transação faz parte de uma série recorrente. Como você deseja aplicar as alterações?
                        </p>
                    </div>
                </div>
                <div className="bg-background px-4 py-3 sm:px-6 flex flex-col gap-2 rounded-b-lg">
                    <button
                        type="button"
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-accent text-base font-medium text-white hover:bg-accent-hover focus:outline-none sm:text-sm"
                        onClick={() => onConfirm('one')}
                    >
                        Apenas esta (Mês atual)
                    </button>
                    <button
                        type="button"
                        className="w-full inline-flex justify-center rounded-md border border-border-color shadow-sm px-4 py-2 bg-card text-base font-medium text-text-primary hover:opacity-80 focus:outline-none sm:text-sm"
                        onClick={() => onConfirm('future')}
                    >
                        Todas as futuras (Incluindo esta)
                    </button>
                    <button
                        type="button"
                        className="mt-2 w-full inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-base font-medium text-text-secondary hover:text-text-primary focus:outline-none sm:text-sm"
                        onClick={onClose}
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
};