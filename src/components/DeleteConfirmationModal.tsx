// src/components/DeleteConfirmationModal.tsx

import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    itemName: string;
    // Novas props para customização
    title: string;
    message: React.ReactNode;
    confirmButtonText: string;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    itemName,
    title,
    message,
    confirmButtonText
}) => {
    const [confirmationText, setConfirmationText] = useState('');
    const isMatch = confirmationText === itemName;

    // Limpa o campo de texto sempre que o modal é aberto ou o item muda
    useEffect(() => {
        if (isOpen) {
            setConfirmationText('');
        }
    }, [isOpen, itemName]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md animate-fade-in-up">
                <div className="p-6">
                    <div className="text-center">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30">
                            <AlertTriangle className="h-6 w-6 text-red-600" />
                        </div>
                        <h3 className="mt-5 text-lg font-medium text-slate-900 dark:text-white">{title}</h3>
                        <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                           {message}
                        </div>
                    </div>
                    <input
                        type="text"
                        value={confirmationText}
                        onChange={(e) => setConfirmationText(e.target.value)}
                        className="mt-4 w-full text-center rounded-md border-slate-300 shadow-sm dark:bg-slate-700 dark:text-white p-2"
                        placeholder={`Digite '${itemName}' para confirmar`}
                    />
                </div>
                <div className="bg-slate-50 dark:bg-slate-700/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg">
                    <button
                        type="button"
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm disabled:bg-red-400 disabled:cursor-not-allowed"
                        onClick={() => {
                            if (isMatch) {
                                onConfirm();
                                onClose();
                            }
                        }}
                        disabled={!isMatch}
                    >
                        {confirmButtonText}
                    </button>
                    <button
                        type="button"
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-slate-300 dark:border-slate-500 shadow-sm px-4 py-2 bg-white dark:bg-slate-800 text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm"
                        onClick={onClose}
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
};
