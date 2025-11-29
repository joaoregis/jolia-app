// src/components/TransactionForm.tsx

import React, { useState, ChangeEvent, FormEvent, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Transaction, TransactionFormState, Label } from '../types';
import { useLabels } from '../hooks/useLabels';
import { CurrencyInput } from './CurrencyInput';
import { ToggleSwitch } from './ToggleSwitch';
import { DateInput } from './DateInput';
import { LabelSelector } from './LabelSelector';
import { InstallmentSelector } from './InstallmentSelector';
import { PlusCircle, Calendar, Tag, FileText, CreditCard, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
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
    const isExpense = formData.type === 'expense';

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

    const handleInstallmentsChange = (value: number) => {
        setFormData(prev => ({ ...prev, totalInstallments: value }));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onSave(formData, initialValues?.id);
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
            {/* Header / Type Indicator */}
            <div className={`flex items-center gap-3 p-4 rounded-lg mb-6 ${isExpense ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                {isExpense ? <ArrowDownCircle size={24} /> : <ArrowUpCircle size={24} />}
                <span className="text-lg font-semibold">
                    {initialValues?.id ? 'Editar ' : 'Nova '}
                    {isExpense ? 'Despesa' : 'Receita'}
                </span>
            </div>

            <div className="space-y-8 flex-grow">
                {/* Main Info Section */}
                <section className="space-y-4">
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-text-secondary mb-1.5">Descrição</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FileText size={18} className="text-text-secondary" />
                            </div>
                            <input
                                id="description"
                                type="text"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                placeholder="Ex: Supermercado, Salário..."
                                className="block w-full rounded-lg border-border-color bg-card text-text-primary pl-10 pr-4 py-2.5 focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1.5">Valor Previsto</label>
                            <div className="relative">
                                <div>
                                    <CurrencyInput value={formData.planned} onValueChange={(newValue) => handleValueChange('planned', newValue)} max={999999999.99} />
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1.5">Valor Efetivo</label>
                            <div className="relative">
                                <div>
                                    <CurrencyInput value={formData.actual} onValueChange={(newValue) => handleValueChange('actual', newValue)} max={999999999.99} />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <hr className="border-border-color/50" />

                {/* Dates Section */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label htmlFor="date" className="block text-sm font-medium text-text-secondary mb-1.5">Data de Competência</label>
                        <div className="relative">
                            <DateInput id="date" name="date" value={formData.date} onChange={handleChange} />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="paymentDate" className="block text-sm font-medium text-text-secondary mb-1.5">{isExpense ? 'Data de Pagamento' : 'Data de Recebimento'}</label>
                        <DateInput id="paymentDate" name="paymentDate" value={formData.paymentDate || ''} onChange={handleChange} />
                    </div>
                    {isExpense && (
                        <div>
                            <label htmlFor="dueDate" className="block text-sm font-medium text-text-secondary mb-1.5">Data de Vencimento</label>
                            <DateInput id="dueDate" name="dueDate" value={formData.dueDate || ''} onChange={handleChange} />
                        </div>
                    )}
                </section>

                <hr className="border-border-color/50" />

                {/* Options Section */}
                <section className="space-y-4">
                    <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wider">Configurações</h3>

                    <div className="bg-card/50 rounded-xl border border-border-color/50 p-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${formData.paid ? 'bg-green-500/20 text-green-500' : 'bg-text-secondary/10 text-text-secondary'}`}>
                                    <CreditCard size={20} />
                                </div>
                                <div>
                                    <label htmlFor="paid" className="block text-sm font-medium text-text-primary cursor-pointer">{isExpense ? 'Pago' : 'Recebido'}</label>
                                    <p className="text-xs text-text-secondary">Marcar como {isExpense ? 'pago' : 'recebido'}</p>
                                </div>
                            </div>
                            <ToggleSwitch id="paid" name="paid" checked={formData.paid} onChange={handleChange} />
                        </div>

                        {!isSubprofileView && (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${formData.isShared ? 'bg-blue-500/20 text-blue-500' : 'bg-text-secondary/10 text-text-secondary'}`}>
                                        <Tag size={20} />
                                    </div>
                                    <div>
                                        <label htmlFor="isShared" className="block text-sm font-medium text-text-primary cursor-pointer">Da Casa</label>
                                        <p className="text-xs text-text-secondary">Despesa compartilhada</p>
                                    </div>
                                </div>
                                <ToggleSwitch id="isShared" name="isShared" checked={formData.isShared} onChange={handleChange} disabled={true} />
                            </div>
                        )}

                        {!formData.isInstallmentPurchase && (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${formData.isRecurring ? 'bg-purple-500/20 text-purple-500' : 'bg-text-secondary/10 text-text-secondary'}`}>
                                        <Calendar size={20} />
                                    </div>
                                    <div>
                                        <label htmlFor="isRecurring" className="block text-sm font-medium text-text-primary cursor-pointer">Recorrente</label>
                                        <p className="text-xs text-text-secondary">Repete todos os meses</p>
                                    </div>
                                </div>
                                <ToggleSwitch id="isRecurring" name="isRecurring" checked={formData.isRecurring} onChange={handleChange} disabled={isEditingInstallment} />
                            </div>
                        )}

                        {!formData.isRecurring && isExpense && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${formData.isInstallmentPurchase ? 'bg-orange-500/20 text-orange-500' : 'bg-text-secondary/10 text-text-secondary'}`}>
                                            <CreditCard size={20} />
                                        </div>
                                        <div>
                                            <label htmlFor="isInstallmentPurchase" className="block text-sm font-medium text-text-primary cursor-pointer">Parcelado</label>
                                            <p className="text-xs text-text-secondary">Compra parcelada</p>
                                        </div>
                                    </div>
                                    <ToggleSwitch id="isInstallmentPurchase" name="isInstallmentPurchase" checked={formData.isInstallmentPurchase} onChange={handleChange} disabled={isEditingInstallment} />
                                </div>

                                {formData.isInstallmentPurchase && !isEditingInstallment && (
                                    <div className="ml-12 p-3 bg-background rounded-lg border border-border-color/50 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                                        <span className="text-sm text-text-secondary">Número de Parcelas</span>
                                        <InstallmentSelector
                                            value={formData.totalInstallments || 2}
                                            onChange={handleInstallmentsChange}
                                        />
                                    </div>
                                )}
                                {isEditingInstallment && (
                                    <p className="text-xs text-amber-500 ml-12">Não é possível alterar as opções de parcelamento de uma transação já criada.</p>
                                )}
                            </div>
                        )}
                    </div>
                </section>

                {/* Labels & Notes */}
                <section className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Rótulos</label>
                        <div className="flex items-center gap-2 flex-wrap min-h-[32px]">
                            {selectedLabels.map(label => (
                                <span key={label.id} style={{ backgroundColor: label.color }} className="px-2.5 py-1 text-xs font-medium text-white rounded-full shadow-sm">
                                    {label.name}
                                </span>
                            ))}
                            <button
                                ref={labelSelectorAnchor}
                                type="button"
                                onClick={() => setLabelSelectorOpen(true)}
                                className="flex items-center justify-center w-8 h-8 bg-card border border-border-color rounded-full hover:bg-border-color hover:text-accent transition-colors"
                                title="Adicionar Rótulo"
                            >
                                <PlusCircle size={18} className="text-text-secondary" />
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

                    <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-text-secondary mb-1.5">Observações</label>
                        <textarea
                            id="notes"
                            name="notes"
                            value={formData.notes || ''}
                            onChange={handleChange}
                            rows={3}
                            className="block w-full rounded-lg border-border-color bg-card text-text-primary p-3 focus:border-accent focus:ring-1 focus:ring-accent transition-all resize-none"
                            placeholder="Adicione detalhes, links ou qualquer outra informação relevante..."
                        />
                    </div>
                </section>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-border-color mt-8">
                <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium rounded-lg bg-background text-text-primary hover:bg-card border border-border-color transition-colors">Cancelar</button>
                <button type="submit" className="px-5 py-2.5 text-sm font-medium text-white rounded-lg bg-accent hover:bg-accent-hover shadow-lg shadow-accent/20 transition-all transform active:scale-95">Salvar</button>
            </div>
        </form>
    );
};