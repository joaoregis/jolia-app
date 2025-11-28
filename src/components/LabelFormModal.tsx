// src/components/LabelFormModal.tsx

import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Label } from '../types';
import { ColorPicker } from './ColorPicker';

type LabelFormData = Omit<Label, 'id' | 'profileId' | 'createdAt' | 'status'>;

interface LabelFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (labelData: LabelFormData, id?: string) => void;
    label?: Label | null;
}

export const LabelFormModal: React.FC<LabelFormModalProps> = ({ isOpen, onClose, onSave, label }) => {
    const [formData, setFormData] = useState<LabelFormData>({
        name: '',
        color: '#3b82f6', // Cor padrão
    });

    useEffect(() => {
        if (isOpen) {
            setFormData({
                name: label?.name || '',
                color: label?.color || '#3b82f6',
            });
        }
    }, [isOpen, label]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.name.trim()) {
            onSave(formData, label?.id);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-card rounded-lg shadow-xl w-full max-w-md animate-zoom-in" onClick={(e) => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="flex-shrink-0 flex justify-between items-center p-4 border-b border-border-color">
                        <h3 className="text-xl font-semibold text-text-primary">
                            {label ? 'Editar Rótulo' : 'Novo Rótulo'}
                        </h3>
                        <button type="button" onClick={onClose} className="text-text-secondary hover:opacity-75">
                            <X size={24} />
                        </button>
                    </div>
                    <div className="flex-grow overflow-y-auto p-6 bg-background space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Nome</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                required
                                className="mt-1 block w-full rounded-md border-border-color shadow-sm bg-card text-text-primary focus:border-accent focus:ring-accent p-3"
                                placeholder="Ex: Supermercado"
                                autoFocus
                            />
                        </div>
                        <ColorPicker
                            selectedColor={formData.color}
                            onSelect={(color) => setFormData(prev => ({ ...prev, color }))}
                        />
                    </div>
                    <div className="flex-shrink-0 flex justify-end gap-3 p-4 border-t border-border-color">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-lg bg-background text-text-primary hover:opacity-80">Cancelar</button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white rounded-lg flex items-center gap-2 bg-accent hover:bg-accent-hover">
                            <Save size={16} /> Salvar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};