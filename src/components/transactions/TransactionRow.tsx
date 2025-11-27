import React, { useState } from 'react';
import { Repeat, Users, FileText, RotateCw, CheckCircle, XCircle, Info } from 'lucide-react';
import { Transaction, TransactionActions, Label, Subprofile } from '../../types';
import { formatCurrency, formatShortDate } from '../../lib/utils';
import { EditableCell } from '../EditableCell';
import { Checkbox } from '../Checkbox';
import { Tooltip } from '../Tooltip';
import { ActionMenu } from './ActionMenu';

interface TransactionRowProps {
    item: Transaction;
    type: 'income' | 'expense';
    isClosed: boolean;
    isIgnoredTable: boolean;
    actions: TransactionActions;
    onOpenNoteModal: (transaction: Transaction) => void;
    isSelected: boolean;
    onSelectionChange: (id: string, checked: boolean) => void;
    labels: Label[];
    onRemoveLabel: (transactionId: string, labelId: string) => void;
    onOpenLabelSelector: (transactionId: string, anchorEl: HTMLElement) => void;
    subprofiles?: Subprofile[];
    subprofileRevenueProportions?: Map<string, number>;
}

export const TransactionRow: React.FC<TransactionRowProps> = ({ item, type, isClosed, isIgnoredTable, actions, onOpenNoteModal, isSelected, onSelectionChange, labels, onRemoveLabel, onOpenLabelSelector, subprofiles, subprofileRevenueProportions }) => {
    const difference = item.actual - item.planned;
    const isNegativeDiff = type === 'expense' ? difference > 0 : difference < 0;
    const differenceColor = difference === 0 ? 'text-text-secondary' : isNegativeDiff ? 'text-red-500' : 'text-green-500';
    const isApportioned = item.isApportioned === true;
    const isInstallment = !!item.seriesId;
    const [isEditingDate, setIsEditingDate] = useState<string | null>(null);

    return (
        <tr className={`group hover:bg-background/50 transition-colors ${isSelected ? 'bg-accent/5' : ''}`}>
            <td className="px-4 py-3 w-10">
                {!isIgnoredTable && <Checkbox checked={isSelected} onChange={(e) => onSelectionChange(item.id, e.target.checked)} />}
            </td>
            <td className="px-1 py-3 text-center">
                <div className="flex items-center justify-center gap-1">
                    {item.isRecurring && (
                        <Tooltip content="Transação Recorrente">
                            <Repeat size={14} className="text-accent flex-shrink-0" />
                        </Tooltip>
                    )}
                    {isApportioned && (
                        <Tooltip content="Rateio da Casa">
                            <Users size={14} className="text-teal-400 flex-shrink-0" />
                        </Tooltip>
                    )}
                    {item.isShared && subprofiles && subprofileRevenueProportions && (
                        <Tooltip content={
                            <div className="space-y-1">
                                <div className="font-bold border-b border-border-color pb-1 mb-1">Divisão Proporcional</div>
                                {subprofiles.map(sub => {
                                    const proportion = subprofileRevenueProportions.get(sub.id) || 0;
                                    const share = item.actual * proportion;
                                    return (
                                        <div key={sub.id} className="flex justify-between gap-4">
                                            <span>{sub.name} ({(proportion * 100).toFixed(0)}%):</span>
                                            <span className="font-medium">{formatCurrency(share)}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        }>
                            <Info size={14} className="text-blue-400 flex-shrink-0 cursor-help" />
                        </Tooltip>
                    )}
                    {item.notes && (
                        <button onClick={() => onOpenNoteModal(item)} title="Ver nota">
                            <FileText size={14} className="text-yellow-400 flex-shrink-0" />
                        </button>
                    )}
                </div>
            </td>
            <td className="px-4 py-3">
                <div className="flex flex-col min-w-0">
                    <EditableCell
                        value={item.description.replace('[Rateio] ', '')}
                        onSave={(v) => actions.onUpdateField(item.id, 'description', String(v))}
                        disabled={isClosed || isApportioned || isIgnoredTable || isInstallment}
                        className="font-medium text-text-primary truncate max-w-[200px] lg:max-w-[300px]"
                    />
                    {item.seriesId && (
                        <span className="text-xs text-text-secondary">
                            ({item.currentInstallment}/{item.totalInstallments})
                        </span>
                    )}
                </div>
            </td>
            <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1 relative">
                    {item.labelIds?.map(labelId => {
                        const label = labels.find(l => l.id === labelId);
                        if (!label) return null;
                        return (
                            <span key={label.id} className="px-2 py-0.5 rounded-full text-xs text-white flex items-center gap-1" style={{ backgroundColor: label.color }}>
                                {label.name}
                                {!isClosed && !isIgnoredTable && (
                                    <button onClick={() => onRemoveLabel(item.id, label.id)} className="hover:text-red-200"><XCircle size={10} /></button>
                                )}
                            </span>
                        );
                    })}
                    {!isClosed && !isIgnoredTable && (
                        <button
                            onClick={(e) => onOpenLabelSelector(item.id, e.currentTarget)}
                            className="w-5 h-5 rounded-full border border-dashed border-text-secondary flex items-center justify-center text-text-secondary hover:border-accent hover:text-accent text-xs"
                        >
                            +
                        </button>
                    )}
                </div>
            </td>
            {type === 'expense' && (
                <td className="px-4 py-3 text-center">
                    {isEditingDate === 'due' && !isClosed && !isApportioned ? (
                        <input
                            type="date"
                            defaultValue={item.dueDate}
                            autoFocus
                            className="bg-background border border-accent rounded px-2 py-1 text-sm text-text-primary w-32"
                            onBlur={(e) => { actions.onUpdateField(item.id, 'dueDate', e.target.value); setIsEditingDate(null); }}
                            onKeyDown={(e) => { if (e.key === 'Enter') { actions.onUpdateField(item.id, 'dueDate', e.currentTarget.value); setIsEditingDate(null); } }}
                        />
                    ) : (
                        <span
                            onClick={() => !isClosed && !isApportioned && !isInstallment && setIsEditingDate('due')}
                            className={`text-sm ${!isClosed && !isApportioned && !isInstallment ? "cursor-pointer border-b border-dashed border-text-secondary hover:text-text-primary" : "text-text-secondary"}`}
                        >
                            {formatShortDate(item.dueDate)}
                        </span>
                    )}
                </td>
            )}
            <td className="px-4 py-3 text-center">
                {isEditingDate === 'payment' && !isClosed && !isApportioned ? (
                    <input
                        type="date"
                        defaultValue={item.paymentDate}
                        autoFocus
                        className="bg-background border border-accent rounded px-2 py-1 text-sm text-text-primary w-32"
                        onBlur={(e) => { actions.onUpdateField(item.id, 'paymentDate', e.target.value); setIsEditingDate(null); }}
                        onKeyDown={(e) => { if (e.key === 'Enter') { actions.onUpdateField(item.id, 'paymentDate', e.currentTarget.value); setIsEditingDate(null); } }}
                    />
                ) : (
                    <span
                        onClick={() => !isClosed && !isApportioned && !isInstallment && setIsEditingDate('payment')}
                        className={`text-sm ${!isClosed && !isApportioned && !isInstallment ? "cursor-pointer border-b border-dashed border-text-secondary hover:text-text-primary" : "text-text-secondary"}`}
                    >
                        {formatShortDate(item.paymentDate)}
                    </span>
                )}
            </td>
            <td className="px-4 py-3">
                <EditableCell
                    value={item.planned}
                    onSave={(v) => actions.onUpdateField(item.id, 'planned', Number(v))}
                    type="number"
                    formatAsCurrency={true}
                    disabled={isClosed || isApportioned || isIgnoredTable}
                    className="text-text-secondary"
                />
            </td>
            <td className="px-4 py-3">
                <EditableCell
                    value={item.actual}
                    onSave={(v) => actions.onUpdateField(item.id, 'actual', Number(v))}
                    type="number"
                    formatAsCurrency={true}
                    disabled={isClosed || isApportioned || isIgnoredTable}
                    className="font-medium text-text-primary"
                />
            </td>
            <td className={`px-4 py-3 text-right font-medium ${differenceColor}`}>
                {formatCurrency(difference)}
            </td>
            <td className="px-4 py-3 text-center">
                <button onClick={() => actions.onTogglePaid(item)} className="inline-flex items-center transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-70" disabled={isClosed || isApportioned || isIgnoredTable}>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${item.paid ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'}`}>
                        {item.paid ? <CheckCircle size={12} /> : <XCircle size={12} />}
                        {item.paid ? 'Sim' : 'Não'}
                    </span>
                </button>
            </td>
            <td className="px-4 py-3 text-right w-10">
                {!isClosed && !isApportioned && !isIgnoredTable && <ActionMenu item={item} actions={actions} />}
                {isIgnoredTable && <button onClick={() => actions.onUnskip(item)} className="p-1 text-blue-600 hover:bg-blue-50 rounded"><RotateCw size={16} /></button>}
            </td>
        </tr>
    );
};
