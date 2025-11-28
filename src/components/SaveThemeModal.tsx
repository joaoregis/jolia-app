// src/components/SaveThemeModal.tsx

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface SaveThemeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (name: string) => void;
    currentThemeName?: string;
}

export const SaveThemeModal: React.FC<SaveThemeModalProps> = ({ isOpen, onClose, onSave, currentThemeName }) => {
    const [name, setName] = useState('');

    useEffect(() => {
        if (isOpen) {
            setName(currentThemeName || '');
        }
    }, [isOpen, currentThemeName]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onSave(name.trim());
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-card rounded-lg shadow-xl w-full max-w-md animate-zoom-in">
                <div className="flex justify-between items-center p-4 border-b border-border-color">
                    <h3 className="text-lg font-medium text-text-primary">Salvar Tema</h3>
                    <button onClick={onClose} className="text-text-secondary hover:opacity-75">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-4 space-y-4">
                        <div>
                            <label htmlFor="themeName" className="block text-sm font-medium text-text-secondary mb-1">Nome do Tema</label>
                            <input
                                id="themeName"
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-background border border-border-color rounded px-3 py-2 text-text-primary focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
                                placeholder="Ex: Meu Tema Escuro"
                                autoFocus
                            />
                        </div>
                    </div>
                    <div className="bg-background px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg border-t border-border-color">
                        <button
                            type="submit"
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-accent text-base font-medium text-white hover:bg-accent-hover focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                        >
                            Salvar
                        </button>
                        <button
                            type="button"
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-border-color shadow-sm px-4 py-2 bg-card text-base font-medium text-text-primary hover:opacity-80 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm"
                            onClick={onClose}
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};