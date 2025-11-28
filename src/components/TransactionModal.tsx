// src/components/TransactionModal.tsx

import React, { useLayoutEffect } from 'react';
import { X } from 'lucide-react';

interface TransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title: string;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, children, title }) => {
    useLayoutEffect(() => {
        if (isOpen) {
            const originalStyle = window.getComputedStyle(document.body).overflow;
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = originalStyle;
            };
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-card rounded-lg shadow-xl w-full max-w-4xl flex flex-col max-h-[90vh] animate-zoom-in">
                <div className="flex-shrink-0 flex justify-between items-center p-6 border-b border-border-color">
                    <h2 className="text-2xl font-bold text-text-primary">{title}</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-text-secondary hover:bg-background transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto p-6 bg-background">
                    {children}
                </div>
            </div>
        </div>
    );
};