// src/components/EditSubprofileModal.tsx

import React, { useState, useEffect } from 'react';
import { X, Check, Save, Trash2 } from 'lucide-react';
import { themes, Theme } from '../lib/themes';
import { Profile, Subprofile, CustomTheme } from '../types';
import { ThemeCustomizer } from './ThemeCustomizer';
import { SaveThemeModal } from './SaveThemeModal';
import { useToast } from '../contexts/ToastContext';

interface EditSubprofileModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (id: string, newName: string, newThemeId: string, customTheme?: Theme['variables']) => void;
    subprofile: Subprofile | null;
    profile: Profile | null;
    onSaveTheme: (name: string, variables: Theme['variables']) => void;
    onDeleteTheme: (themeId: string) => void;
}

const ThemeSelector: React.FC<{
    selectedThemeId: string,
    onSelect: (themeId: string) => void,
    savedThemes: CustomTheme[],
    onDeleteTheme: (themeId: string) => void
}> = ({ selectedThemeId, onSelect, savedThemes, onDeleteTheme }) => {

    const handleDelete = (e: React.MouseEvent, themeId: string) => {
        e.stopPropagation();
        onDeleteTheme(themeId);
    };

    return (
        <div>
            {savedThemes.length > 0 && (
                <div className="mb-6">
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                        Temas Salvos
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
                        {savedThemes.map((theme) => (
                            <div key={theme.id} onClick={() => onSelect(theme.id)} className="cursor-pointer text-center group relative">
                                <div className={`w-full h-16 rounded-lg flex items-center justify-center border-4 ${selectedThemeId === theme.id ? 'border-accent' : 'border-transparent'}`} style={{ background: theme.variables['--card'] }}>
                                    <div className="flex gap-1">
                                        <div className="w-4 h-8 rounded" style={{ background: theme.variables['--accent'] }}></div>
                                        <div className="w-4 h-8 rounded" style={{ background: theme.variables['--text-primary'] }}></div>
                                        <div className="w-4 h-8 rounded" style={{ background: theme.variables['--text-secondary'] }}></div>
                                    </div>
                                </div>
                                <span className="text-xs mt-1 block text-text-secondary">{theme.name}</span>
                                <button
                                    type="button"
                                    onClick={(e) => handleDelete(e, theme.id)}
                                    className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 -mt-2 -mr-2"
                                    title={`Excluir tema "${theme.name}"`}
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <label className="block text-sm font-medium text-text-secondary mb-2">
                Temas Padrão
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
};

export const EditSubprofileModal: React.FC<EditSubprofileModalProps> = ({ isOpen, onClose, onSave, subprofile, profile, onSaveTheme, onDeleteTheme }) => {
    const [name, setName] = useState('');
    const [selectedThemeId, setSelectedThemeId] = useState('default');
    const [customTheme, setCustomTheme] = useState<Theme['variables'] | undefined>(undefined);
    const [isSaveThemeModalOpen, setIsSaveThemeModalOpen] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        if (subprofile && isOpen) {
            setName(subprofile.name);
            setSelectedThemeId(subprofile.themeId || 'default');
            setCustomTheme(subprofile.customTheme);
        }
    }, [subprofile, isOpen]);

    useEffect(() => {
        if (selectedThemeId !== 'custom') {
            setCustomTheme(undefined);
        }
    }, [selectedThemeId]);

    const handleSelectCustomTheme = () => {
        if (selectedThemeId === 'custom') return;

        let baseThemeVariables = themes.default.variables;
        const savedTheme = profile?.savedThemes?.find(t => t.id === selectedThemeId);

        if (savedTheme) {
            baseThemeVariables = savedTheme.variables;
        } else if (themes[selectedThemeId]) {
            baseThemeVariables = themes[selectedThemeId].variables;
        }

        setCustomTheme(baseThemeVariables);
        setSelectedThemeId('custom');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim() && subprofile) {
            onSave(subprofile.id, name.trim(), selectedThemeId, customTheme);
            onClose();
        }
    };

    const handleSaveTheme = (themeName: string) => {
        if (customTheme) {
            onSaveTheme(themeName, customTheme);
            showToast(`Tema "${themeName}" salvo com sucesso!`, 'success');
            setIsSaveThemeModalOpen(false);
        }
    };

    const handleDeleteTheme = (themeId: string) => {
        onDeleteTheme(themeId);
        showToast(`Tema excluído.`, 'info');
        if (selectedThemeId === themeId) {
            setSelectedThemeId('default');
        }
    };

    if (!isOpen || !subprofile) return null;

    let previewTheme = themes.default;
    const savedTheme = profile?.savedThemes?.find(t => t.id === selectedThemeId);

    if (savedTheme) {
        previewTheme = { name: savedTheme.name, variables: savedTheme.variables };
    } else if (themes[selectedThemeId]) {
        previewTheme = themes[selectedThemeId];
    }

    if (selectedThemeId === 'custom' && customTheme) {
        previewTheme = { name: 'Custom', variables: customTheme };
    }

    const modalStyle = { ...previewTheme.variables as React.CSSProperties };

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
                <div
                    onClick={(e) => e.stopPropagation()}
                    className="bg-card rounded-lg shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh] animate-zoom-in"
                    style={modalStyle}
                >
                    <div className="flex-shrink-0 flex justify-between items-center p-4 border-b border-border-color">
                        <h3 className="text-xl font-semibold text-text-primary">Editar Subperfil</h3>
                        <button onClick={onClose} className="text-text-secondary hover:opacity-75">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="flex-grow overflow-y-auto p-6 space-y-6">
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

                        <ThemeSelector
                            selectedThemeId={selectedThemeId}
                            onSelect={setSelectedThemeId}
                            savedThemes={profile?.savedThemes || []}
                            onDeleteTheme={handleDeleteTheme}
                        />

                        <div className="border-t border-border-color my-4"></div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <input
                                    type="radio"
                                    id="theme-custom"
                                    name="themeSelection"
                                    value="custom"
                                    checked={selectedThemeId === 'custom'}
                                    onChange={handleSelectCustomTheme}
                                    className="h-4 w-4 text-accent focus:ring-accent"
                                />
                                <label htmlFor="theme-custom" className="text-sm font-medium text-text-secondary">
                                    Personalizar Cores
                                </label>
                            </div>
                            {selectedThemeId === 'custom' && customTheme && (
                                <button type="button" onClick={() => setIsSaveThemeModalOpen(true)} className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-white bg-accent rounded-lg hover:bg-accent-hover">
                                    <Save size={14} /> Salvar Tema
                                </button>
                            )}
                        </div>

                        {selectedThemeId === 'custom' && customTheme && (
                            <ThemeCustomizer customTheme={customTheme} onThemeChange={setCustomTheme} />
                        )}
                    </div>

                    <div className="flex-shrink-0 flex justify-end gap-3 p-4 border-t border-border-color">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-lg bg-background text-text-primary hover:opacity-80">
                            Cancelar
                        </button>
                        <button type="button" onClick={handleSubmit} className="px-4 py-2 text-sm font-medium text-white rounded-lg flex items-center gap-2 bg-accent hover:bg-accent-hover">
                            <Check size={16} /> Salvar Alterações
                        </button>
                    </div>
                </div>
            </div>
            <SaveThemeModal
                isOpen={isSaveThemeModalOpen}
                onClose={() => setIsSaveThemeModalOpen(false)}
                onSave={handleSaveTheme}
            />
        </>
    );
};