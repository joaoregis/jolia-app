// src/components/DeleteConfirmationModal.tsx

import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    itemName: string;
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

    useEffect(() => {
        if (isOpen) {
            setConfirmationText('');
        }
    }, [isOpen, itemName]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-[var(--card)] text-[var(--text-primary)] rounded-lg shadow-xl w-full max-w-md animate-zoom-in border border-[var(--border)]">
                <div className="p-6">
                    <div className="text-center">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30">
                            <AlertTriangle className="h-6 w-6 text-red-600" />
                        </div>
                        <h3 className="mt-5 text-lg font-medium">{title}</h3>
                        <div className="mt-2 text-sm text-[var(--text-secondary)]">
                            {message}
                        </div>
                    </div>
                    <input
                        type="text"
                        value={confirmationText}
                        onChange={(e) => setConfirmationText(e.target.value)}
                        className="mt-4 w-full text-center rounded-md border border-[var(--border)] shadow-sm bg-[var(--background)] text-[var(--text-primary)] p-2 focus:ring-[var(--accent)] focus:border-[var(--accent)]"
                        placeholder={`Digite '${itemName}' para confirmar`}
                    />
                </div>
                <div className="bg-[var(--background)] px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg border-t border-[var(--border)]">
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
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-[var(--border)] shadow-sm px-4 py-2 bg-[var(--card)] text-base font-medium text-[var(--text-primary)] hover:bg-[var(--background)] focus:outline-none sm:mt-0 sm:w-auto sm:text-sm"
                        onClick={onClose}
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
};
