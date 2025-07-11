// src/components/WishlistItemFormModal.tsx

import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { WishlistItem } from '../types';
import { CurrencyInput } from './CurrencyInput';

type ItemFormData = Omit<WishlistItem, 'id' | 'createdAt' | 'isDone'>;

interface WishlistItemFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (itemData: ItemFormData) => void;
    item?: WishlistItem | null;
}

export const WishlistItemFormModal: React.FC<WishlistItemFormModalProps> = ({ isOpen, onClose, onSave, item }) => {
    const [formData, setFormData] = useState<ItemFormData>({
        title: '',
        description: '',
        notes: '',
        budget: 0,
    });

    useEffect(() => {
        if (isOpen) {
            setFormData({
                title: item?.title || '',
                description: item?.description || '',
                notes: item?.notes || '',
                budget: item?.budget || 0,
            });
        }
    }, [isOpen, item]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleBudgetChange = (value: number) => {
        setFormData(prev => ({ ...prev, budget: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.title.trim()) {
            onSave(formData);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-card rounded-lg shadow-xl w-full max-w-lg flex flex-col max-h-[90vh] animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="flex-shrink-0 flex justify-between items-center p-4 border-b border-border-color">
                        <h3 className="text-xl font-semibold text-text-primary">
                            {item ? 'Editar Item de Desejo' : 'Adicionar Item de Desejo'}
                        </h3>
                        <button type="button" onClick={onClose} className="text-text-secondary hover:opacity-75">
                            <X size={24} />
                        </button>
                    </div>
                    <div className="flex-grow overflow-y-auto p-6 bg-background space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Título</label>
                            <input type="text" name="title" value={formData.title} onChange={handleChange} required className="mt-1 block w-full rounded-md border-border-color shadow-sm bg-card text-text-primary focus:border-accent focus:ring-accent p-3" placeholder="Ex: Monitor Novo" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Descrição (Opcional)</label>
                            <input type="text" name="description" value={formData.description} onChange={handleChange} className="mt-1 block w-full rounded-md border-border-color shadow-sm bg-card text-text-primary focus:border-accent focus:ring-accent p-3" placeholder="Ex: Ultrawide, 144Hz, 34 polegadas" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Orçamento (Opcional)</label>
                            <CurrencyInput value={formData.budget || 0} onValueChange={handleBudgetChange} />
                        </div>
                        <div>
                            <label htmlFor="notes" className="block text-sm font-medium text-text-secondary mb-1">Observações (Opcional)</label>
                            <textarea id="notes" name="notes" value={formData.notes || ''} onChange={handleChange} rows={3} className="mt-1 block w-full rounded-md border-border-color shadow-sm bg-card text-text-primary focus:border-accent focus:ring-accent p-3" placeholder="Link do produto, loja, etc." />
                        </div>
                    </div>
                    <div className="flex-shrink-0 flex justify-end gap-3 p-4 border-t border-border-color">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-lg bg-background text-text-primary hover:opacity-80">Cancelar</button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white rounded-lg flex items-center gap-2 bg-accent hover:bg-accent-hover">
                            <Save size={16} /> Salvar Item
                        </button>
                    </div>
                </form>
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