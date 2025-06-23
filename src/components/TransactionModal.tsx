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
    // Utiliza-se o useLayoutEffect para prevenir o "piscar" da interface,
    // executando as alterações do DOM de forma síncrona.
    useLayoutEffect(() => {
        const body = document.body;
        const mainContent = document.getElementById('main-content');

        if (isOpen) {
            // Guarda os estilos originais para os restaurar na limpeza
            const originalBodyOverflow = window.getComputedStyle(body).overflow;
            const originalMainContentPaddingRight = mainContent ? window.getComputedStyle(mainContent).paddingRight : '';
            
            // Calcula a largura da barra de rolagem a partir do contentor principal
            const scrollbarWidth = mainContent ? mainContent.offsetWidth - mainContent.clientWidth : 0;
            
            // Aplica os estilos para bloquear a rolagem e prevenir a mudança de layout
            body.style.overflow = 'hidden';
            if (mainContent && scrollbarWidth > 0) {
                mainContent.style.paddingRight = `${scrollbarWidth}px`;
            }

            // Adiciona o listener de teclado para a tecla 'Escape'
            const handleKeyDown = (event: KeyboardEvent) => {
                if (event.key === 'Escape') {
                    onClose();
                }
            };
            document.addEventListener('keydown', handleKeyDown);

            // Função de limpeza para restaurar os estilos originais e remover o listener
            return () => {
                body.style.overflow = originalBodyOverflow;
                if (mainContent) {
                    mainContent.style.paddingRight = originalMainContentPaddingRight;
                }
                document.removeEventListener('keydown', handleKeyDown);
            };
        }
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
