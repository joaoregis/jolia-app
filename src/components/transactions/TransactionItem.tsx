import React, { useState } from 'react';
import { Repeat, Users, FileText, RotateCw, CheckCircle, XCircle } from 'lucide-react';
import { Transaction, TransactionActions } from '../../types';
import { formatCurrency, formatShortDate } from '../../lib/utils';
import { EditableCell } from '../EditableCell';
import { Checkbox } from '../Checkbox';
import { ActionMenu } from './ActionMenu';

interface TransactionItemProps {
    item: Transaction;
    type: 'income' | 'expense';
    isClosed: boolean;
    isIgnoredTable: boolean;
    actions: TransactionActions;
    onOpenNoteModal: (transaction: Transaction) => void;
    isSelected: boolean;
    onSelectionChange: (id: string, checked: boolean) => void;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({ item, type, isClosed, isIgnoredTable, actions, onOpenNoteModal, isSelected, onSelectionChange }) => {
    const difference = item.actual - item.planned;
    const isNegativeDiff = type === 'expense' ? difference > 0 : difference < 0;
    const differenceColor = difference === 0 ? 'text-text-secondary' : isNegativeDiff ? 'text-red-500' : 'text-green-500';
    const isApportioned = item.isApportioned === true;
    const isInstallment = !!item.seriesId;
    const [isEditingDate, setIsEditingDate] = useState<string | null>(null);

    return (
        <div className={`border border-border rounded-lg mb-3 p-3 bg-card hover:bg-background/50 transition-colors ${isSelected ? 'bg-accent/10 border-accent' : ''}`}>
            {/* Linha 1: Checkbox, Descrição e Menu de Ações */}
            <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 overflow-hidden flex-1">
                    {!isIgnoredTable && <Checkbox checked={isSelected} onChange={(e) => onSelectionChange(item.id, e.target.checked)} />}
                    <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1">
                            {item.isRecurring && <span title="Transação Recorrente"><Repeat size={12} className="text-accent flex-shrink-0" /></span>}
                            {isApportioned && <span title="Rateio da Casa"><Users size={12} className="text-teal-400 flex-shrink-0" /></span>}
                            {item.notes && <button onClick={() => onOpenNoteModal(item)} title="Ver nota"><FileText size={12} className="text-yellow-400 flex-shrink-0" /></button>}
                            <EditableCell value={item.description.replace('[Rateio] ', '')} onSave={(v) => actions.onUpdateField(item.id, 'description', String(v))} disabled={isClosed || isApportioned || isIgnoredTable || isInstallment} className="font-medium text-text-primary truncate" />
                        </div>
                        {item.seriesId && (
                            <span className="text-xs text-text-secondary">
                                ({item.currentInstallment}/{item.totalInstallments})
                            </span>
                        )}
                    </div>
                </div>
                {!isClosed && !isApportioned && !isIgnoredTable && <ActionMenu item={item} actions={actions} />}
                {isIgnoredTable && <button onClick={() => actions.onUnskip(item)} className="p-1 text-blue-600 hover:bg-blue-50 rounded"><RotateCw size={16} /></button>}
            </div >

            {/* Linha 2: Valores */}
            < div className="flex items-baseline justify-between mb-2 text-sm" >
                <div className="flex flex-col">
                    <span className="text-xs text-text-secondary">Efetivo</span>
                    <span className="font-bold text-text-primary text-base">{formatCurrency(item.actual)}</span>
                </div>
                <div className="flex flex-col text-right">
                    <span className="text-xs text-text-secondary">Previsto</span>
                    <span className="text-text-secondary">{formatCurrency(item.planned)}</span>
                </div>
                <div className="flex flex-col text-right">
                    <span className="text-xs text-text-secondary">Diferença</span>
                    <span className={`font-medium ${differenceColor}`}>{formatCurrency(difference)}</span>
                </div>
            </div >

            <div className="border-t border-border my-2"></div>

            {/* Linha 3: Datas e Status */}
            <div className="flex items-center justify-between text-xs text-text-secondary">
                <div className="flex flex-col gap-1">
                    {type === 'expense' && item.dueDate && (
                        <div className="flex items-center gap-1">
                            <span>Venc:</span>
                            {isEditingDate === 'due' && !isClosed && !isApportioned ? (
                                <input
                                    type="date"
                                    defaultValue={item.dueDate}
                                    autoFocus
                                    className="bg-background border border-accent rounded px-1 py-0.5 text-text-primary w-28"
                                    onBlur={(e) => { actions.onUpdateField(item.id, 'dueDate', e.target.value); setIsEditingDate(null); }}
                                    onKeyDown={(e) => { if (e.key === 'Enter') { actions.onUpdateField(item.id, 'dueDate', e.currentTarget.value); setIsEditingDate(null); } }}
                                />
                            ) : (
                                <span onClick={() => !isClosed && !isApportioned && !isInstallment && setIsEditingDate('due')} className={!isClosed && !isApportioned && !isInstallment ? "cursor-pointer border-b border-dashed border-text-secondary hover:text-text-primary" : ""}>
                                    {formatShortDate(item.dueDate)}
                                </span>
                            )}
                        </div>
                    )}
                    <div className="flex items-center gap-1">
                        <span>{type === 'expense' ? 'Pgto:' : 'Recb:'}</span>
                        {isEditingDate === 'payment' && !isClosed && !isApportioned ? (
                            <input
                                type="date"
                                defaultValue={item.paymentDate}
                                autoFocus
                                className="bg-background border border-accent rounded px-1 py-0.5 text-text-primary w-28"
                                onBlur={(e) => { actions.onUpdateField(item.id, 'paymentDate', e.target.value); setIsEditingDate(null); }}
                                onKeyDown={(e) => { if (e.key === 'Enter') { actions.onUpdateField(item.id, 'paymentDate', e.currentTarget.value); setIsEditingDate(null); } }}
                            />
                        ) : (
                            <span onClick={() => !isClosed && !isApportioned && !isInstallment && setIsEditingDate('payment')} className={!isClosed && !isApportioned && !isInstallment ? "cursor-pointer border-b border-dashed border-text-secondary hover:text-text-primary" : ""}>
                                {formatShortDate(item.paymentDate)}
                            </span>
                        )}
                    </div>
                </div>

                <button onClick={() => actions.onTogglePaid(item)} className="inline-flex items-center transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-70" disabled={isClosed || isApportioned || isIgnoredTable}>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${item.paid ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'}`}>
                        {item.paid ? <CheckCircle size={12} /> : <XCircle size={12} />}
                        {item.paid ? 'Sim' : 'Não'}
                    </span>
                </button>
            </div>
        </div >
    );
};
