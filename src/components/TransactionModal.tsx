// src/components/TransactionModal.tsx

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface TransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title: string;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, children, title }) => {
    useEffect(() => {
        const body = document.body;
        if (isOpen) {
            // Impede o scroll da página de fundo quando o modal está aberto
            body.style.overflow = 'hidden';
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
        }

        // Função de limpeza que restaura o scroll quando o modal é fechado
        return () => {
            body.style.overflow = 'unset';
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);


    if (!isOpen) return null;

    return (
        <div 
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 transition-opacity"
        >
            <div 
                onClick={(e) => e.stopPropagation()}
                className="bg-card rounded-lg shadow-xl w-full max-w-lg animate-fade-in-up"
            >
                <div className="flex justify-between items-center p-4 border-b border-border-color">
                    <h3 className="text-xl font-semibold text-text-primary">{title}</h3>
                    <button onClick={onClose} className="text-text-secondary hover:opacity-75">
                        <X size={24} />
                    </button>
                </div>
                {/* O corpo do modal agora usa a cor de fundo do tema */}
                <div className="p-6 bg-background rounded-b-lg">
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
