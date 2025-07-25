// src/components/SaveThemeModal.tsx

import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

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
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex justify-center items-center p-4">
            <div className="bg-card rounded-lg shadow-xl w-full max-w-sm animate-fade-in-up">
                <form onSubmit={handleSubmit}>
                    <div className="flex justify-between items-center p-4 border-b border-border-color">
                        <h3 className="text-xl font-semibold text-text-primary">Salvar Tema Personalizado</h3>
                        <button type="button" onClick={onClose} className="text-text-secondary hover:opacity-75">
                            <X size={24} />
                        </button>
                    </div>
                    <div className="p-6">
                        <label htmlFor="themeName" className="block text-sm font-medium text-text-secondary mb-1">
                            Nome do Tema
                        </label>
                        <input
                            id="themeName"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="mt-1 block w-full rounded-md border-border-color shadow-sm bg-background text-text-primary focus:border-accent focus:ring-accent p-3"
                            placeholder="Ex: Meu Tema Azul"
                            autoFocus
                        />
                    </div>
                    <div className="flex justify-end gap-3 p-4 bg-background/50 rounded-b-lg">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-lg bg-card text-text-primary hover:opacity-80 border border-border-color">
                            Cancelar
                        </button>
                        <button type="submit" className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg bg-accent hover:bg-accent-hover">
                            <Save size={16} /> Salvar Tema
                        </button>
                    </div>
                </form>
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