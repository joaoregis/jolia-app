// src/components/WishlistItemFormModal.tsx

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
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
            <div className="bg-card rounded-lg shadow-xl w-full max-w-md animate-zoom-in">
                <div className="flex justify-between items-center p-4 border-b border-border-color">
                    <h3 className="text-lg font-medium text-text-primary">{item ? 'Editar Item' : 'Novo Item'}</h3>
                    <button onClick={onClose} className="text-text-secondary hover:opacity-75">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-4 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Título</label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => handleChange(e)}
                                name="title"
                                className="w-full bg-background border border-border-color rounded px-3 py-2 text-text-primary focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
                                placeholder="Ex: Monitor Novo"
                                autoFocus
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Descrição (Opcional)</label>
                            <input
                                type="text"
                                value={formData.description}
                                onChange={(e) => handleChange(e)}
                                name="description"
                                className="w-full bg-background border border-border-color rounded px-3 py-2 text-text-primary focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
                                placeholder="Ex: Ultrawide, 144Hz, 34 polegadas"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Orçamento (Opcional)</label>
                            <CurrencyInput
                                value={formData.budget || 0}
                                onValueChange={handleBudgetChange}
                                className="w-full bg-background border border-border-color rounded px-3 py-2 text-text-primary focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
                                placeholder="R$ 0,00"
                            />
                        </div>
                        <div>
                            <label htmlFor="notes" className="block text-sm font-medium text-text-secondary mb-1">Observações (Opcional)</label>
                            <textarea
                                id="notes"
                                name="notes"
                                value={formData.notes || ''}
                                onChange={handleChange}
                                rows={3}
                                className="w-full bg-background border border-border-color rounded px-3 py-2 text-text-primary focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
                                placeholder="Link do produto, loja, etc."
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