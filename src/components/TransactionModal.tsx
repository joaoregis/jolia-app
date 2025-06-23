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
    // Este hook continua útil para travar o scroll do body
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
        <div 
            onClick={onClose}
            // Container principal do modal com fundo escuro
            className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
        >
            <div 
                onClick={(e) => e.stopPropagation()}
                // CORREÇÃO: Estrutura flexível, altura máxima e cantos arredondados
                className="bg-card rounded-lg shadow-xl w-full max-w-lg flex flex-col max-h-[90vh] animate-fade-in-up"
            >
                {/* Cabeçalho Fixo */}
                <div className="flex-shrink-0 flex justify-between items-center p-4 border-b border-border-color">
                    <h3 className="text-xl font-semibold text-text-primary">{title}</h3>
                    <button onClick={onClose} className="text-text-secondary hover:opacity-75">
                        <X size={24} />
                    </button>
                </div>

                {/* CORREÇÃO: Área de conteúdo rolável */}
                <div className="flex-grow overflow-y-auto p-6 bg-background">
                    {children}
                </div>
            </div>
            <style>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};
