// src/components/SettingsModal.tsx

import React, { useState, useEffect } from 'react';
import { Profile } from '../types';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (settings: Partial<Profile>) => void;
    profile: Profile;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave, profile }) => {
    const [apportionmentMethod, setApportionmentMethod] = useState(profile.apportionmentMethod || 'manual');

    useEffect(() => {
        setApportionmentMethod(profile.apportionmentMethod || 'manual');
    }, [profile, isOpen]);

    const handleSave = () => {
        onSave({ apportionmentMethod });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div
                className="bg-card rounded-lg shadow-xl w-full max-w-lg"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-4 border-b border-border-color">
                    <h3 className="text-xl font-semibold text-text-primary">Configurações do Perfil</h3>
                </div>
                <div className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary">Método de Rateio de Contas da Casa</label>
                        <p className="text-xs text-text-secondary mb-2">Define como as despesas marcadas como "Da Casa" são divididas entre os subperfis.</p>
                        <div className="flex flex-col gap-2">
                            <label className={`flex items-center p-3 rounded-lg cursor-pointer border-2 ${apportionmentMethod === 'manual' ? 'border-accent bg-accent/10' : 'border-border-color'}`}>
                                <input type="radio" name="apportionment" value="manual" checked={apportionmentMethod === 'manual'} onChange={(e) => setApportionmentMethod(e.target.value as any)} className="h-4 w-4 text-accent focus:ring-accent" />
                                <span className="ml-3 text-sm text-text-primary">Manual (Padrão)</span>
                            </label>
                            <label className={`flex items-center p-3 rounded-lg cursor-pointer border-2 ${apportionmentMethod === 'proportional' ? 'border-accent bg-accent/10' : 'border-border-color'}`}>
                                <input type="radio" name="apportionment" value="proportional" checked={apportionmentMethod === 'proportional'} onChange={(e) => setApportionmentMethod(e.target.value as any)} className="h-4 w-4 text-accent focus:ring-accent" />
                                <span className="ml-3 text-sm text-text-primary">Proporcional à Receita</span>
                            </label>
                        </div>
                    </div>
                </div>
                <div className="p-4 bg-background/50 flex justify-end gap-3 rounded-b-lg">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-text-primary bg-card rounded-lg hover:opacity-80 border border-border-color">
                        Cancelar
                    </button>
                    <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent-hover">
                        Salvar
                    </button>
                </div>
            </div>
        </div>
    );
};