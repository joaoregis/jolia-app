// src/components/TransactionForm.tsx

import React, { useState, ChangeEvent, FormEvent, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Transaction, TransactionFormState, Label } from '../types';
import { useLabels } from '../hooks/useLabels';
import { CurrencyInput } from './CurrencyInput';
import { ToggleSwitch } from './ToggleSwitch';
import { DateInput } from './DateInput';
import { LabelSelector } from './LabelSelector';
import { PlusCircle } from 'lucide-react';
import { getLocalDateISOString } from '../lib/utils';

interface TransactionFormProps {
    onClose: () => void;
    onSave: (transactionData: TransactionFormState, id?: string) => void;
    initialValues?: Partial<Transaction> | null;
    isSubprofileView: boolean;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ onClose, onSave, initialValues, isSubprofileView }) => {
    const { profileId } = useParams<{ profileId: string }>();
    const { labels } = useLabels(profileId);
    const [formData, setFormData] = useState<TransactionFormState>({
        description: '',
        type: 'expense',
        planned: 0,
        actual: 0,
        date: getLocalDateISOString(),
        paymentDate: '',
        dueDate: undefined,
        paid: false,
        isShared: false,
        isRecurring: false,
        isInstallmentPurchase: false,
        totalInstallments: 2,
        subprofileId: undefined,
        labelIds: [],
        notes: '',
        ...initialValues
    });

    const [isLabelSelectorOpen, setLabelSelectorOpen] = useState(false);
    const labelSelectorAnchor = useRef<HTMLButtonElement>(null);

    const isEditingInstallment = !!initialValues?.seriesId;

    const activeLabels = labels.filter(l => l.status === 'active');
    const selectedLabels = (formData.labelIds || [])
        .map(id => labels.find(l => l.id === id))
        .filter((l): l is Label => l !== undefined);

    useEffect(() => {
        setFormData({
            description: '', type: 'expense', planned: 0, actual: 0, date: getLocalDateISOString(),
            paymentDate: '', dueDate: undefined, paid: false, isShared: false, isRecurring: false,
            isInstallmentPurchase: !!initialValues?.seriesId,
            totalInstallments: initialValues?.totalInstallments || 2,
            subprofileId: undefined, labelIds: [], notes: '', ...initialValues
        });
    }, [initialValues]);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => {
                const newState = { ...prev, [name]: checked };
                if (name === 'isRecurring' && checked) {
                    newState.isInstallmentPurchase = false;
                }
                if (name === 'isInstallmentPurchase' && checked) {
                    newState.isRecurring = false;
                }
                return newState;
            });
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleValueChange = (name: 'planned' | 'actual', value: number) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    }

    const handleToggleLabel = (labelId: string) => {
        setFormData(prev => {
            const currentLabels = prev.labelIds || [];
            const newLabels = currentLabels.includes(labelId)
                ? currentLabels.filter(id => id !== labelId)
                : [...currentLabels, labelId];
            return { ...prev, labelIds: newLabels };
        });
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onSave(formData, initialValues?.id);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Descrição</label>
                <input type="text" name="description" value={formData.description} onChange={handleChange} required className="mt-1 block w-full rounded-md border-border-color shadow-sm bg-card text-text-primary focus:border-accent focus:ring-accent p-3" />
            </div>

            <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Rótulos</label>
                <div className="mt-1 flex items-center gap-2 flex-wrap">
                    {selectedLabels.map(label => (
                        <span key={label.id} style={{ backgroundColor: label.color }} className="px-2 py-0.5 text-xs font-medium text-white rounded-full">
                            {label.name}
                        </span>
                    ))}
                    <button
                        ref={labelSelectorAnchor}
                        type="button"
                        onClick={() => setLabelSelectorOpen(true)}
                        className="flex items-center justify-center w-6 h-6 bg-background rounded-full hover:bg-border-color"
                    >
                        <PlusCircle size={16} className="text-text-secondary" />
                    </button>
                    <LabelSelector
                        isOpen={isLabelSelectorOpen}
                        onClose={() => setLabelSelectorOpen(false)}
                        availableLabels={activeLabels}
                        selectedLabelIds={formData.labelIds || []}
                        onToggleLabel={handleToggleLabel}
                        anchorEl={labelSelectorAnchor.current}
                    />
                </div>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="paymentDate" className="block text-sm font-medium text-text-secondary mb-1">{formData.type === 'expense' ? 'Data de Pagamento' : 'Data de Recebimento'}</label>
                    <DateInput id="paymentDate" name="paymentDate" value={formData.paymentDate || ''} onChange={handleChange} />
                </div>
                {formData.type === 'expense' && (
                    <div>
                        <label htmlFor="dueDate" className="block text-sm font-medium text-text-secondary mb-1">Data de Vencimento</label>
                        <DateInput id="dueDate" name="dueDate" value={formData.dueDate || ''} onChange={handleChange} />
                    </div>
                )}
            </div>

            <fieldset className="border border-border-color rounded-lg p-4">
                <legend className="px-2 text-sm font-medium text-text-secondary">Opções</legend>
                <div className="space-y-4">
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
                        {!formData.isInstallmentPurchase && (
                            <div className="flex items-center justify-between sm:justify-start sm:gap-4">
                                <label htmlFor="isRecurring" className="block text-sm font-medium text-text-primary">Recorrente</label>
                                <ToggleSwitch id="isRecurring" name="isRecurring" checked={formData.isRecurring} onChange={handleChange} disabled={isEditingInstallment} />
                            </div>
                        )}
                    </div>

                    {!formData.isRecurring && formData.type === 'expense' && (
                        <div className="border-t border-border-color pt-4">
                            <div className="flex items-center justify-between sm:justify-start sm:gap-4">
                                <label htmlFor="isInstallmentPurchase" className="block text-sm font-medium text-text-primary">É uma compra parcelada?</label>
                                <ToggleSwitch id="isInstallmentPurchase" name="isInstallmentPurchase" checked={formData.isInstallmentPurchase} onChange={handleChange} disabled={isEditingInstallment} />
                            </div>
                            {formData.isInstallmentPurchase && !isEditingInstallment && (
                                <div className="mt-4 pl-8">
                                    <label htmlFor="totalInstallments" className="block text-sm font-medium text-text-secondary">Número de Parcelas</label>
                                    <input type="number" id="totalInstallments" name="totalInstallments" value={formData.totalInstallments} onChange={handleChange} min="2" className="mt-1 w-full max-w-xs rounded-md border-border-color shadow-sm bg-card text-text-primary focus:border-accent focus:ring-accent p-2" />
                                </div>
                            )}
                            {isEditingInstallment && (
                                <p className="text-xs text-amber-500 mt-2 pl-8">Não é possível alterar as opções de parcelamento de uma transação já criada. Para isso, exclua e crie novamente.</p>
                            )}
                        </div>
                    )}
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