// src/components/TransactionForm.tsx

import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { Transaction, TransactionFormState } from '../types';
import { CurrencyInput } from './CurrencyInput';
import { ToggleSwitch } from './ToggleSwitch';
import { DateInput } from './DateInput';

interface TransactionFormProps {
    onClose: () => void;
    onSave: (transactionData: TransactionFormState, id?: string) => void;
    initialValues?: Partial<Transaction> | null;
    isSubprofileView: boolean;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ onClose, onSave, initialValues, isSubprofileView }) => {
    const [formData, setFormData] = useState<TransactionFormState>({
        description: '',
        type: 'expense',
        planned: 0,
        actual: 0,
        date: new Date().toISOString().split('T')[0],
        paymentDate: new Date().toISOString().split('T')[0],
        paid: false,
        isShared: false,
        isRecurring: false,
        subprofileId: undefined,
        notes: '',
        ...initialValues
    });

    useEffect(() => {
        if (!initialValues?.id) {
            setFormData(prev => ({ ...prev, paymentDate: prev.date }));
        }
    }, [formData.date, initialValues?.id]);

    useEffect(() => {
        setFormData({
            description: '', type: 'expense', planned: 0, actual: 0, date: new Date().toISOString().split('T')[0],
            paymentDate: new Date().toISOString().split('T')[0], paid: false, isShared: false, isRecurring: false,
            subprofileId: undefined, notes: '', ...initialValues
        });
    }, [initialValues]);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleValueChange = (name: 'planned' | 'actual', value: number) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    }

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onSave(formData, initialValues?.id);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Descrição</label>
                <input type="text" name="description" value={formData.description} onChange={handleChange} required className="mt-1 block w-full rounded-md border-border-color shadow-sm bg-card text-text-primary focus:border-accent focus:ring-accent p-3"/>
            </div>
            
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Valor Previsto</label>
                    <CurrencyInput value={formData.planned} onValueChange={(newValue) => handleValueChange('planned', newValue)} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Valor Efetivo</label>
                    <CurrencyInput value={formData.actual} onValueChange={(newValue) => handleValueChange('actual', newValue)} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Tipo</label>
                    <select name="type" value={formData.type} onChange={handleChange} disabled={!isSubprofileView} className="mt-1 block w-full rounded-md border-border-color shadow-sm bg-card text-text-primary focus:border-accent focus:ring-accent disabled:opacity-50 p-3">
                        <option value="expense">Despesa</option>
                        <option value="income">Receita</option>
                    </select>
                </div>
                 <div>
                    <label htmlFor="date" className="block text-sm font-medium text-text-secondary mb-1">Data de Lançamento</label>
                    <DateInput id="date" name="date" value={formData.date} onChange={handleChange} required />
                </div>
            </div>
            
            <div>
                <label htmlFor="paymentDate" className="block text-sm font-medium text-text-secondary mb-1">{formData.type === 'expense' ? 'Data de Pagamento' : 'Data de Recebimento'}</label>
                <DateInput id="paymentDate" name="paymentDate" value={formData.paymentDate || ''} onChange={handleChange} />
            </div>
            
            <fieldset className="border border-border-color rounded-lg p-4">
                <legend className="px-2 text-sm font-medium text-text-secondary">Opções</legend>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-4">
                    <div className="flex items-center justify-between sm:justify-start sm:gap-4">
                        <label htmlFor="paid" className="block text-sm font-medium text-text-primary">{formData.type === 'expense' ? 'Pago' : 'Recebido'}</label>
                        <ToggleSwitch id="paid" name="paid" checked={formData.paid} onChange={handleChange} />
                    </div>

                    {!isSubprofileView && (
                        <div className="flex items-center justify-between sm:justify-start sm:gap-4">
                            <label htmlFor="isShared" className="block text-sm font-medium text-text-primary">Da Casa</label>
                            <ToggleSwitch id="isShared" name="isShared" checked={formData.isShared} onChange={handleChange} disabled={true} />
                        </div>
                    )}
                    <div className="flex items-center justify-between sm:justify-start sm:gap-4">
                        <label htmlFor="isRecurring" className="block text-sm font-medium text-text-primary">Recorrente</label>
                        <ToggleSwitch id="isRecurring" name="isRecurring" checked={formData.isRecurring} onChange={handleChange} />
                    </div>
                </div>
            </fieldset>
            <div>
                <label htmlFor="notes" className="block text-sm font-medium text-text-secondary mb-1">
                    Observações
                </label>
                <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes || ''}
                    onChange={handleChange}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-border-color shadow-sm bg-card text-text-primary focus:border-accent focus:ring-accent p-3"
                    placeholder="Adicione detalhes, links ou qualquer outra informação relevante..."
                />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border-color mt-6">
                <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-lg bg-background text-text-primary hover:opacity-80 border border-border-color">Cancelar</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white rounded-lg bg-accent hover:bg-accent-hover">Salvar</button>
            </div>
        </form>
    );
};