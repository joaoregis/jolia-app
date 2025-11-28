// src/components/AddSubprofileModal.tsx

import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { themes } from '../lib/themes';

interface AddSubprofileModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (name: string, themeId: string) => void;
}

const ThemeSelector: React.FC<{ selectedThemeId: string, onSelect: (themeId: string) => void }> = ({ selectedThemeId, onSelect }) => (
    <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">
            Escolha um Tema
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
            {Object.entries(themes).map(([id, theme]) => (
                <div key={id} onClick={() => onSelect(id)} className="cursor-pointer text-center">
                    <div className={`w-full h-16 rounded-lg flex items-center justify-center border-4 ${selectedThemeId === id ? 'border-accent' : 'border-transparent'}`} style={{ background: theme.variables['--card'] }}>
                        <div className="flex gap-1">
                            <div className="w-4 h-8 rounded" style={{ background: theme.variables['--accent'] }}></div>
                            <div className="w-4 h-8 rounded" style={{ background: theme.variables['--text-primary'] }}></div>
                            <div className="w-4 h-8 rounded" style={{ background: theme.variables['--text-secondary'] }}></div>
                        </div>
                    </div>
                    <span className="text-xs mt-1 block text-text-secondary">{theme.name}</span>
                </div>
            ))}
        </div>
    </div>
);

export const AddSubprofileModal: React.FC<AddSubprofileModalProps> = ({ isOpen, onClose, onSave }) => {
    const [name, setName] = useState('');
    const [selectedThemeId, setSelectedThemeId] = useState('default');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onSave(name.trim(), selectedThemeId);
            setName('');
            setSelectedThemeId('default');
            onClose();
        }
    };

    if (!isOpen) return null;

    const previewTheme = themes[selectedThemeId] || themes.default;
    const modalStyle = { ...previewTheme.variables as React.CSSProperties };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div
                onClick={(e) => e.stopPropagation()}
                // CORREÇÃO: Estrutura flexível com altura máxima
                className="bg-card rounded-lg shadow-xl w-full max-w-md flex flex-col max-h-[90vh] animate-zoom-in"
                style={modalStyle}
            >
                {/* Cabeçalho Fixo */}
                <div className="flex-shrink-0 flex justify-between items-center p-4 border-b border-border-color">
                    <h3 className="text-xl font-semibold text-text-primary">Adicionar Novo Subperfil</h3>
                    <button onClick={onClose} className="text-text-secondary hover:opacity-75">
                        <X size={24} />
                    </button>
                </div>

                {/* Formulário com conteúdo rolável */}
                <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 space-y-6">
                    <div>
                        <label htmlFor="subprofileName" className="block text-sm font-medium text-text-secondary">
                            Nome do Subperfil
                        </label>
                        <input
                            id="subprofileName"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="mt-1 block w-full rounded-md shadow-sm p-2 bg-background text-text-primary border border-border-color focus:ring-accent focus:border-accent"
                            placeholder="ex: Júlia"
                        />
                    </div>
                    <ThemeSelector selectedThemeId={selectedThemeId} onSelect={setSelectedThemeId} />
                </form>

                {/* Rodapé Fixo */}
                <div className="flex-shrink-0 flex justify-end gap-3 p-4 border-t border-border-color">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-lg bg-background text-text-primary hover:opacity-80">
                        Cancelar
                    </button>
                    <button type="submit" onClick={handleSubmit} className="px-4 py-2 text-sm font-medium text-white rounded-lg flex items-center gap-2 bg-accent hover:bg-accent-hover">
                        <Check size={16} /> Salvar
                    </button>
                </div>
            </div>
        </div>
    );
};
