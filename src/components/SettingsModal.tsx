// src/components/SettingsModal.tsx

import React, { useState, useEffect } from 'react';
import { Profile } from '../types';
import { PercentageInput } from './PercentageInput';
import { AlertCircle } from 'lucide-react';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (settings: Partial<Profile>) => void;
    profile: Profile;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave, profile }) => {
    const [apportionmentMethod, setApportionmentMethod] = useState(profile.apportionmentMethod || 'manual');
    const [percentages, setPercentages] = useState<Record<string, number>>(profile.subprofileApportionmentPercentages || {});

    const activeSubprofiles = profile.subprofiles.filter(s => s.status === 'active');

    useEffect(() => {
        setApportionmentMethod(profile.apportionmentMethod || 'manual');

        // Initialize percentages if not set
        if (profile.subprofileApportionmentPercentages) {
            setPercentages(profile.subprofileApportionmentPercentages);
        } else {
            const initialPercentages: Record<string, number> = {};
            // Default split: equal shares
            const share = Math.floor(100 / activeSubprofiles.length);
            const remainder = 100 - (share * activeSubprofiles.length);

            activeSubprofiles.forEach((sub, index) => {
                initialPercentages[sub.id] = share + (index === 0 ? remainder : 0);
            });
            setPercentages(initialPercentages);
        }
    }, [profile, isOpen]);

    const handlePercentageChange = (subId: string, val: number) => {
        setPercentages(prev => ({
            ...prev,
            [subId]: val
        }));
    };

    const totalPercentage = Object.values(percentages).reduce((a, b) => a + b, 0);
    const isPercentageValid = totalPercentage === 100;

    const handleSave = () => {
        if (apportionmentMethod === 'percentage' && !isPercentageValid) {
            // Can prevent save or just warn. Let's prevent for safety.
            return;
        }
        onSave({
            apportionmentMethod,
            subprofileApportionmentPercentages: apportionmentMethod === 'percentage' ? percentages : undefined
        });
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

                        <div className="flex flex-col gap-2 mt-2">
                            <label className={`flex items-center p-3 rounded-lg cursor-pointer border-2 ${apportionmentMethod === 'percentage' ? 'border-accent bg-accent/10' : 'border-border-color'}`}>
                                <input type="radio" name="apportionment" value="percentage" checked={apportionmentMethod === 'percentage'} onChange={(e) => setApportionmentMethod(e.target.value as any)} className="h-4 w-4 text-accent focus:ring-accent" />
                                <span className="ml-3 text-sm text-text-primary">Percentual Fixo</span>
                            </label>

                            {apportionmentMethod === 'percentage' && (
                                <div className="mt-2 ml-7 pl-4 border-l-2 border-border-color space-y-3 animate-in fade-in slide-in-from-top-2">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-sm font-medium text-text-primary">Distribuição (%)</p>
                                        <div className={`text-sm font-bold ${isPercentageValid ? 'text-green-500' : 'text-red-500'}`}>
                                            Total: {totalPercentage}%
                                        </div>
                                    </div>

                                    {!isPercentageValid && (
                                        <div className="flex items-center gap-2 p-2 rounded bg-red-500/10 text-red-500 text-xs mb-3">
                                            <AlertCircle size={14} />
                                            <span>O total deve ser exatamente 100%</span>
                                        </div>
                                    )}

                                    {activeSubprofiles.map(sub => (
                                        <div key={sub.id} className="flex items-center justify-between">
                                            <span className="text-sm text-text-secondary">{sub.name}</span>
                                            <PercentageInput
                                                value={percentages[sub.id] || 0}
                                                onChange={(val) => handlePercentageChange(sub.id, val)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="p-4 bg-background/50 flex justify-end gap-3 rounded-b-lg">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-text-primary bg-card rounded-lg hover:opacity-80 border border-border-color">
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={apportionmentMethod === 'percentage' && !isPercentageValid}
                        className="px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Salvar
                    </button>
                </div>
            </div>
        </div>
    );
};