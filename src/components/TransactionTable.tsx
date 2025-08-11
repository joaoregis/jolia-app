// src/components/TransactionTable.tsx

import React, { useState, useEffect, useRef, useLayoutEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { MoreVertical, CheckCircle, XCircle, Edit, Trash2, ArrowUpDown, Repeat, Users, Info, SkipForward, RotateCw, ArrowRightLeft, FileText, Landmark, PlusCircle } from 'lucide-react';
import { Transaction, SortConfig, Subprofile, Label } from '../types';
import { formatCurrency, formatShortDate } from '../lib/utils';
import { EditableCell } from './EditableCell';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { NoteModal } from './NoteModal';
import { LabelSelector } from './LabelSelector';

// --- Interfaces & Componentes Internos ---

export interface TransactionActions {
    onEdit: (transaction: Transaction) => void;
    onDelete: (transaction: Transaction) => void;
    onTogglePaid: (transaction: Transaction) => void;
    onUpdateField: (transactionId: string, field: keyof Transaction, value: any) => void;
    onSkip: (transaction: Transaction) => void;
    onUnskip: (transaction: Transaction) => void;
    onTransfer: (transaction: Transaction) => void;
    onSaveNote: (transactionId: string, note: string) => void;
}

const Checkbox: React.FC<{ checked: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; indeterminate?: boolean; title?: string }> = ({ checked, onChange, indeterminate, title }) => {
    const ref = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (ref.current) {
            ref.current.indeterminate = indeterminate || false;
        }
    }, [indeterminate]);

    return (
        <input
            ref={ref}
            type="checkbox"
            title={title}
            checked={checked}
            onChange={onChange}
            className="h-4 w-4 rounded border-border text-accent bg-background focus:ring-accent"
        />
    );
};

const Tooltip: React.FC<{ content: React.ReactNode, children: React.ReactNode }> = ({ content, children }) => {
    const triggerRef = useRef<HTMLDivElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useLayoutEffect(() => {
        if (isVisible && triggerRef.current && tooltipRef.current) {
            const { top, left, width } = triggerRef.current.getBoundingClientRect();
            const { width: tooltipWidth, height: tooltipHeight } = tooltipRef.current.getBoundingClientRect();
            tooltipRef.current.style.left = `${left + window.scrollX + width / 2 - tooltipWidth / 2}px`;
            tooltipRef.current.style.top = `${top + window.scrollY - tooltipHeight - 8}px`;
        }
    }, [isVisible]);

    return (
        <div ref={triggerRef} onMouseEnter={() => setIsVisible(true)} onMouseLeave={() => setIsVisible(false)} className="relative flex items-center">
            {children}
            {isVisible && ReactDOM.createPortal(
                <div ref={tooltipRef} className="fixed bg-card text-text-primary text-xs rounded-md py-1.5 px-2.5 z-50 shadow-lg pointer-events-none animate-fade-in border border-border-color">
                    {content}
                </div>, document.body
            )}
        </div>
    );
};

const ActionMenu: React.FC<{ item: Transaction; actions: Pick<TransactionActions, 'onEdit' | 'onDelete' | 'onSkip' | 'onTransfer'>; }> = ({ item, actions }) => {
    const [isOpen, setIsOpen] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        if (isOpen && buttonRef.current && menuRef.current) {
            const { top, left, height, width } = buttonRef.current.getBoundingClientRect();
            const menuHeight = menuRef.current.offsetHeight;
            const windowHeight = window.innerHeight;
            let topPos = top + height + window.scrollY;
            if (topPos + menuHeight > windowHeight) topPos = top - menuHeight + window.scrollY;
            menuRef.current.style.top = `${topPos}px`;
            menuRef.current.style.left = `${left + window.scrollX + width - menuRef.current.offsetWidth}px`;
        }
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node) && !buttonRef.current?.contains(event.target as Node)) setIsOpen(false);
        };
        if (isOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    return (
        <>
            <button ref={buttonRef} onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-full text-text-secondary hover:bg-background"><MoreVertical size={18}/></button>
            {isOpen && ReactDOM.createPortal(
                <div ref={menuRef} className="fixed w-48 rounded-md shadow-lg bg-card ring-1 ring-black ring-opacity-5 z-50 border border-border animate-fade-in">
                    <div className="py-1">
                        <button onClick={() => { actions.onEdit(item); setIsOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:bg-background"><Edit size={16} /> Editar</button>
                        <button onClick={() => { actions.onTransfer(item); setIsOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:bg-background"><ArrowRightLeft size={16} /> Transferir</button>
                        {(item.isRecurring || !!item.seriesId) && <button onClick={() => { actions.onSkip(item); setIsOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:bg-background"><SkipForward size={16} /> Ignorar neste mês</button>}
                        <button onClick={() => { actions.onDelete(item); setIsOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-background"><Trash2 size={16} /> Excluir</button>
                    </div>
                </div>, document.body
            )}
        </>
    );
};

const DetailRow: React.FC<{ label: string; value: React.ReactNode; valueClassName?: string }> = ({ label, value, valueClassName }) => (
    <div className="flex justify-between items-baseline text-sm">
        <span className="text-text-secondary">{label}</span>
        <span className={valueClassName}>{value}</span>
    </div>
);

const TransactionItem: React.FC<{ item: Transaction; type: 'income' | 'expense'; isClosed: boolean; isIgnoredTable: boolean; actions: TransactionActions; onOpenNoteModal: (transaction: Transaction) => void; isSelected: boolean; onSelectionChange: (id: string, checked: boolean) => void; }> = ({ item, type, isClosed, isIgnoredTable, actions, onOpenNoteModal, isSelected, onSelectionChange }) => {
    const difference = item.actual - item.planned;
    const isNegativeDiff = type === 'expense' ? difference > 0 : difference < 0;
    const differenceColor = difference === 0 ? 'text-text-secondary' : isNegativeDiff ? 'text-red-500' : 'text-green-500';
    const isApportioned = item.isApportioned === true;
    const isInstallment = !!item.seriesId;

    return (
        <div className={`border border-border rounded-lg mb-4 p-4 space-y-4 bg-card hover:bg-background/50 transition-colors ${isSelected ? 'bg-accent/10 border-accent' : ''}`}>
            <div className="flex justify-between items-start">
                 <div className="font-medium text-text-primary flex items-center gap-2 pr-2 overflow-hidden">
                     {!isIgnoredTable && <Checkbox checked={isSelected} onChange={(e) => onSelectionChange(item.id, e.target.checked)} />}
                     {item.isRecurring && <span title="Transação Recorrente"><Repeat size={12} className="text-accent flex-shrink-0" /></span>}
                     {isApportioned && <span title="Rateio da Casa"><Users size={12} className="text-teal-400 flex-shrink-0" /></span>}
                     {item.notes && <button onClick={() => onOpenNoteModal(item)} title="Ver nota"><FileText size={12} className="text-yellow-400 flex-shrink-0" /></button>}
                     <EditableCell value={item.description.replace('[Rateio] ', '')} onSave={(v) => actions.onUpdateField(item.id, 'description', String(v))} disabled={isClosed || isApportioned || isIgnoredTable || isInstallment} />
                     {item.seriesId && (
                         <span className="text-xs text-text-secondary whitespace-nowrap">
                             ({item.currentInstallment}/{item.totalInstallments})
                         </span>
                     )}
                </div>
                 {!isClosed && !isApportioned && !isIgnoredTable && <ActionMenu item={item} actions={actions} />}
                 {isIgnoredTable && <button onClick={() => actions.onUnskip(item)} className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-1"><RotateCw size={14} /> Reativar</button>}
            </div>
            <div className="space-y-2">
                <DetailRow label="Efetivo" value={formatCurrency(item.actual)} valueClassName="font-bold text-lg text-text-primary" />
                <DetailRow label="Previsto" value={formatCurrency(item.planned)} valueClassName="text-sm text-text-secondary" />
                <DetailRow label="Diferença" value={formatCurrency(difference)} valueClassName={`text-sm font-medium ${differenceColor}`} />
                {type === 'expense' && item.dueDate && <DetailRow label="Vencimento" value={formatShortDate(item.dueDate)} />}
            </div>
            <div className="border-t border-border !mt-3 !mb-2"></div>
            <div className="flex justify-between items-center text-sm">
                <div className="text-text-secondary">
                    <span>{type === 'expense' ? 'Pago em' : 'Recebido em'}: </span>
                    <span className="font-medium text-text-primary">{formatShortDate(item.paymentDate)}</span>
                </div>
                 <button onClick={() => actions.onTogglePaid(item)} className="inline-flex items-center transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-70" disabled={isClosed || isApportioned || isIgnoredTable}>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium flex items-center ${item.paid ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'}`}>
                         {item.paid ? <CheckCircle className="w-4 h-4 mr-1"/> : <XCircle className="w-4 h-4 mr-1"/>}
                         {item.paid ? 'Sim' : 'Não'}
                    </span>
                </button>
            </div>
        </div>
    );
};


// --- Componentes Principais Exportados ---

interface TransactionTableProps {
  title: string;
  data: Transaction[];
  labels: Label[];
  type: 'income' | 'expense';
  isClosed: boolean;
  requestSort: (key: keyof Transaction) => void;
  sortConfig: SortConfig | null;
  actions: TransactionActions;
  subprofileRevenueProportions?: Map<string, number>;
  subprofiles?: Subprofile[];
  apportionmentMethod?: 'proportional' | 'manual';
  selectedIds: Set<string>;
  onSelectionChange: (id: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
}

export const TransactionTable: React.FC<TransactionTableProps> = (props) => {
    const { title, data, labels, type, isClosed, requestSort, sortConfig, subprofileRevenueProportions, subprofiles, apportionmentMethod, actions, selectedIds, onSelectionChange, onSelectAll } = props;
    const [editingDateId, setEditingDateId] = useState<string | null>(null);
    const [noteModalState, setNoteModalState] = useState<{ isOpen: boolean; transaction: Transaction | null }>({ isOpen: false, transaction: null });
    const [labelSelectorState, setLabelSelectorState] = useState<{ isOpen: boolean; transactionId: string | null, anchorEl: HTMLElement | null }>({ isOpen: false, transactionId: null, anchorEl: null });
    
    const labelsMap = useMemo(() => new Map(labels.map(l => [l.id, l])), [labels]);
    const activeLabels = useMemo(() => labels.filter(l => l.status === 'active'), [labels]);

    const handleOpenNoteModal = (transaction: Transaction) => setNoteModalState({ isOpen: true, transaction });
    const handleCloseNoteModal = () => setNoteModalState({ isOpen: false, transaction: null });
    const handleSaveNote = (note: string) => { if (noteModalState.transaction) actions.onSaveNote(noteModalState.transaction.id, note); };
    
    const handleToggleLabel = (transactionId: string, labelId: string) => {
        const transaction = data.find(t => t.id === transactionId);
        if (!transaction) return;
        const currentLabels = transaction.labelIds || [];
        const newLabels = currentLabels.includes(labelId)
            ? currentLabels.filter(id => id !== labelId)
            : [...currentLabels, labelId];
        actions.onUpdateField(transactionId, 'labelIds', newLabels);
    };
    
    const getSortIndicator = (key: keyof Transaction) => {
        if (!sortConfig || sortConfig.key !== key) return <ArrowUpDown size={14} className="ml-2 opacity-30 group-hover:opacity-100" />;
        const rotationClass = sortConfig.direction === 'descending' ? 'transform rotate-180' : '';
        return <ArrowUpDown size={14} className={`text-accent ${rotationClass}`} />;
    };

    const SortableHeader: React.FC<{ sortKey: keyof Transaction; children: React.ReactNode; className?: string }> = ({ sortKey, children, className }) => (
        <th scope="col" className={`px-4 py-3 ${className}`}>
            <button onClick={() => requestSort(sortKey)} className="flex items-center w-full group">{children} {getSortIndicator(sortKey)}</button>
        </th>
    );
    
    const getApportionmentTooltipContent = (transaction: Transaction) => {
        if (!subprofiles || !subprofileRevenueProportions || !apportionmentMethod) return null;
        const activeSubprofiles = subprofiles.filter(s => s.status === 'active');
        if (apportionmentMethod === 'proportional' && subprofileRevenueProportions.size > 0) {
            return (
                <div className="p-1 space-y-1">
                    <p className="font-bold border-b border-slate-600 pb-1 mb-1">Rateio Proporcional</p>
                    {activeSubprofiles.map(sub => {
                        const proportion = subprofileRevenueProportions.get(sub.id) || 0;
                        return (
                            <div key={sub.id} className="flex justify-between gap-4">
                                <span>{sub.name}:</span>
                                <span className="font-mono">{formatCurrency(transaction.actual * proportion)} ({(proportion * 100).toFixed(1)}%)</span>
                            </div>
                        );
                    })}
                </div>
            );
        }
        return <div className="p-1">Rateio Manual Ativado</div>;
    }

    const getInstallmentTooltipContent = (item: Transaction) => {
        const totalValue = item.actual * (item.totalInstallments || 0);
        return (
            <div className="p-1 text-center">
                <p>Parcela {item.currentInstallment} de {item.totalInstallments}</p>
                <p className="border-t border-slate-600 mt-1 pt-1">Total: <span className="font-bold">{formatCurrency(totalValue)}</span></p>
            </div>
        )
    };

    const isAllSelected = data.length > 0 && data.every(item => selectedIds.has(item.id));
    const isSomeSelected = data.some(item => selectedIds.has(item.id));
    
    return (
        <Card>
            <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
            <CardContent>
                 <style>{` @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } } .animate-fade-in { animation: fade-in 0.2s ease-out forwards; } `}</style>
                <div className="md:hidden">
                    {data.length > 0 ? data.map(item => <TransactionItem key={item.id} item={item} type={type} isClosed={isClosed} isIgnoredTable={false} actions={actions} onOpenNoteModal={handleOpenNoteModal} isSelected={selectedIds.has(item.id)} onSelectionChange={onSelectionChange} />) : null}
                    {data.length > 0 && <div className="flex justify-between font-bold text-table-footer-text bg-table-footer p-4 rounded-lg mt-4"><span>TOTAL</span><span>{formatCurrency(data.reduce((acc, i) => acc + i.actual, 0))}</span></div>}
                </div>
                <div className="w-full overflow-x-auto hidden md:block">
                    <table className="w-full text-sm text-left text-text-secondary table-auto">
                        <thead className="text-xs text-table-header-text uppercase bg-table-header">
                            <tr>
                                <th className="px-4 py-3 w-px">
                                    <Checkbox
                                        title="Selecionar Tudo"
                                        checked={isAllSelected}
                                        indeterminate={isSomeSelected && !isAllSelected}
                                        onChange={(e) => onSelectAll(e.target.checked)}
                                    />
                                </th>
                                <th scope="col" className="px-1 py-3 w-[40px]"></th>
                                <SortableHeader sortKey="description" className="w-[25%]">Descrição</SortableHeader>
                                <SortableHeader sortKey="labelIds" className="w-[12%]">Rótulos</SortableHeader>
                                {type === 'expense' && <SortableHeader sortKey="dueDate" className="w-[10%]">Vencimento</SortableHeader>}
                                <SortableHeader sortKey="paymentDate" className="w-[10%]">{type === 'expense' ? 'Pagamento' : 'Recebimento'}</SortableHeader>
                                <SortableHeader sortKey="planned" className="w-[14%]">Previsto</SortableHeader>
                                <SortableHeader sortKey="actual" className="w-[14%]">Efetivo</SortableHeader>
                                <th scope="col" className="w-[10%] px-4 py-3 text-right">Diferença</th>
                                <SortableHeader sortKey="paid" className="w-[8%] text-center justify-center">{type === 'expense' ? 'Pago?' : 'Recebido?'}</SortableHeader>
                                <th scope="col" className="w-[5%] px-4 py-3 text-center">Ações</th>
                            </tr>
                        </thead>
                       {data.length > 0 && (
                         <tbody className="divide-y divide-border">
                            {data.map(item => {
                                const difference = item.actual - item.planned;
                                const isNegativeDiff = type === 'expense' ? difference > 0 : difference < 0;
                                const differenceColor = difference === 0 ? 'text-text-secondary' : isNegativeDiff ? 'text-red-500' : 'text-green-500';
                                const isApportioned = item.isApportioned === true;
                                const isInstallment = !!item.seriesId;
                                const isSelected = selectedIds.has(item.id);
                                const itemLabels = (item.labelIds || []).map(id => labelsMap.get(id)).filter((l): l is Label => l !== undefined);
                                return (
                                <tr key={item.id} className={`transition-colors ${isSelected ? 'bg-accent/10' : 'bg-card'} ${!isApportioned && 'hover:bg-background'}`}>
                                    <td className="px-4 py-3 align-middle">
                                        <Checkbox checked={isSelected} onChange={(e) => onSelectionChange(item.id, e.target.checked)} />
                                    </td>
                                    <td className="px-1 py-3 align-middle">
                                         <div className="flex items-center justify-center gap-2">
                                            {item.notes && <button onClick={() => handleOpenNoteModal(item)} title="Ver nota" className="flex-shrink-0"><FileText size={14} className="text-yellow-400 hover:text-yellow-300" /></button>}
                                            {item.isShared && <Tooltip content={getApportionmentTooltipContent(item)}><Users size={14} className="text-cyan-400 flex-shrink-0 cursor-pointer"/></Tooltip>}
                                            {item.isRecurring && !item.seriesId && <span title="Transação Recorrente"><Repeat size={12} className="text-accent flex-shrink-0"/></span>}
                                            {isInstallment && (
                                                <Tooltip content={getInstallmentTooltipContent(item)}>
                                                    <Landmark size={14} className="text-purple-400 flex-shrink-0 cursor-pointer" />
                                                </Tooltip>
                                            )}
                                            {isApportioned && <Tooltip content={<>Esta despesa é um rateio da Visão Geral<br />e não pode ser editada aqui.</>}><Info size={14} className="text-teal-400 flex-shrink-0 cursor-help" /></Tooltip>}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 align-middle font-medium text-text-primary">
                                        <Tooltip content={item.description.replace('[Rateio] ', '')}>
                                            <div className="flex items-center gap-2">
                                                <EditableCell value={item.description.replace('[Rateio] ', '')} onSave={(newValue) => actions.onUpdateField(item.id, 'description', String(newValue))} disabled={isClosed || isApportioned || isInstallment} className="max-w-[20ch] truncate" />
                                                {item.seriesId && (
                                                    <span className="text-xs text-text-secondary whitespace-nowrap">
                                                        ({item.currentInstallment}/{item.totalInstallments})
                                                    </span>
                                                )}
                                            </div>
                                        </Tooltip>
                                    </td>
                                    <td className="px-4 py-3 align-middle">
                                        <div className="flex items-center gap-1.5">
                                            {isApportioned && <span className="px-2 py-0.5 text-xs font-medium text-white rounded-full whitespace-nowrap" style={{backgroundColor: '#0d9488'}}>Rateio</span>}
                                            {itemLabels.slice(0, 1).map(label => (
                                                <span key={label.id} style={{backgroundColor: label.color}} className="px-2 py-0.5 text-xs font-medium text-white rounded-full whitespace-nowrap">{label.name}</span>
                                            ))}
                                            {itemLabels.length > 1 && (
                                                <Tooltip content={<div className="flex flex-col items-start gap-1.5 p-1">{itemLabels.map(l => <span key={l.id} style={{backgroundColor: l.color}} className="px-2 py-0.5 text-xs font-medium text-white rounded-full whitespace-nowrap">{l.name}</span>)}</div>}>
                                                     <span className="px-2 py-0.5 text-xs font-medium bg-gray-500 text-white rounded-full cursor-pointer whitespace-nowrap">...</span>
                                                </Tooltip>
                                            )}
                                            {!isClosed && !isApportioned && <button onClick={(e) => setLabelSelectorState({ isOpen: true, transactionId: item.id, anchorEl: e.currentTarget })} className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full bg-background hover:bg-border-color"><PlusCircle size={14} className="text-text-secondary"/></button>}
                                        </div>
                                    </td>
                                    {type === 'expense' && (
                                        <td className="px-4 py-3 align-middle">
                                            {editingDateId === `${item.id}-due` && !isClosed && !isApportioned ? (
                                                <input type="date" defaultValue={item.dueDate} autoFocus onBlur={(e) => { actions.onUpdateField(item.id, 'dueDate', e.target.value); setEditingDateId(null); }} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === 'Escape') { if (e.key === 'Enter') actions.onUpdateField(item.id, 'dueDate', e.currentTarget.value); setEditingDateId(null); e.currentTarget.blur(); }}} className="w-full bg-background text-text-primary p-2 rounded border border-accent"/>
                                            ) : (
                                                <div className="group relative w-full h-full flex items-center cursor-pointer" onClick={() => !isClosed && !isApportioned && item.type === 'expense' && !isInstallment && setEditingDateId(`${item.id}-due`)}>
                                                    <span>{formatShortDate(item.dueDate)}</span>
                                                    {!isClosed && !isApportioned && item.type === 'expense' && !isInstallment && <button className="absolute right-0 top-1/2 -translate-y-1/2 p-1 rounded-full bg-background text-text-secondary opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"><Edit size={12} /></button>}
                                                </div>
                                            )}
                                        </td>
                                    )}
                                    <td className="px-4 py-3 align-middle">
                                        {editingDateId === `${item.id}-payment` && !isClosed && !isApportioned ? (
                                            <input type="date" defaultValue={item.paymentDate} autoFocus onBlur={(e) => { actions.onUpdateField(item.id, 'paymentDate', e.target.value); setEditingDateId(null); }} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === 'Escape') { if (e.key === 'Enter') actions.onUpdateField(item.id, 'paymentDate', e.currentTarget.value); setEditingDateId(null); e.currentTarget.blur(); }}} className="w-full bg-background text-text-primary p-2 rounded border border-accent"/>
                                        ) : (
                                            <div className="group relative w-full h-full flex items-center cursor-pointer" onClick={() => !isClosed && !isApportioned && !isInstallment && setEditingDateId(`${item.id}-payment`)}>
                                                <span>{formatShortDate(item.paymentDate)}</span>
                                                {!isClosed && !isApportioned && !isInstallment && <button className="absolute right-0 top-1/2 -translate-y-1/2 p-1 rounded-full bg-background text-text-secondary opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"><Edit size={12} /></button>}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 align-middle"><EditableCell value={item.planned} type="number" formatAsCurrency onSave={(newValue) => actions.onUpdateField(item.id, 'planned', newValue as number)} disabled={isClosed || isApportioned || isInstallment}/></td>
                                    <td className="px-4 py-3 align-middle"><EditableCell value={item.actual} type="number" formatAsCurrency onSave={(newValue) => actions.onUpdateField(item.id, 'actual', newValue as number)} disabled={isClosed || isApportioned || isInstallment}/></td>
                                    <td className={`px-4 py-3 text-right font-bold align-middle ${differenceColor}`}>{formatCurrency(difference)}</td>
                                    <td className="px-4 py-3 text-center align-middle">
                                        <button onClick={() => actions.onTogglePaid(item)} className="inline-flex items-center transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-70" disabled={isClosed || (isApportioned && type !== 'income')}>
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium flex items-center ${item.paid ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'}`}>
                                                {item.paid ? <CheckCircle className="w-4 h-4 mr-1"/> : <XCircle className="w-4 h-4 mr-1"/>}
                                                {item.paid ? 'Sim' : 'Não'}
                                            </span>
                                        </button>
                                    </td>
                                    <td className="px-4 py-3 text-center align-middle">{!isClosed && !isApportioned && <ActionMenu item={item} actions={actions} />}</td>
                                </tr>
                                )})}
                        </tbody>
                       )}
                       {data.length > 0 && (
                         <tfoot className="font-bold text-table-footer-text bg-table-footer">
                            <tr>
                                <td colSpan={type === 'expense' ? 5 : 4} className="px-4 py-3">TOTAL</td>
                                <td />
                                <td className="px-4 py-3">{formatCurrency(data.reduce((acc, i) => acc + i.planned, 0))}</td>
                                <td className="px-4 py-3">{formatCurrency(data.reduce((acc, i) => acc + i.actual, 0))}</td>
                                <td colSpan={3}></td>
                            </tr>
                        </tfoot>
                       )}
                    </table>
                </div>
                {data.length === 0 && <div className="text-center py-10 text-text-secondary">Nenhuma transação encontrada nesta categoria.</div>}
            </CardContent>
            {noteModalState.isOpen && <NoteModal isOpen={noteModalState.isOpen} onClose={handleCloseNoteModal} onSave={handleSaveNote} initialNote={noteModalState.transaction?.notes} />}
            <LabelSelector
                isOpen={labelSelectorState.isOpen}
                onClose={() => setLabelSelectorState({ isOpen: false, transactionId: null, anchorEl: null })}
                availableLabels={activeLabels}
                selectedLabelIds={data.find(t => t.id === labelSelectorState.transactionId)?.labelIds || []}
                onToggleLabel={(labelId) => {
                    if (labelSelectorState.transactionId) {
                        handleToggleLabel(labelSelectorState.transactionId, labelId);
                    }
                }}
                anchorEl={labelSelectorState.anchorEl}
            />
        </Card>
    );
};

interface IgnoredTransactionsTableProps {
    data: Transaction[];
    onUnskip: (transaction: Transaction) => void;
    currentMonthString: string;
    activeTab: string;
    isCurrentMonthClosed: boolean;
    selectedIds: Set<string>;
    onSelectionChange: (id: string, checked: boolean) => void;
    onSelectAll: (checked: boolean) => void;
}

export const IgnoredTransactionsTable: React.FC<IgnoredTransactionsTableProps> = ({ data, onUnskip, currentMonthString, activeTab, isCurrentMonthClosed, selectedIds, onSelectionChange, onSelectAll }) => {
    const filteredData = useMemo(() => {
        const ignoredInCurrentMonth = data.filter((t) => (t.skippedInMonths || []).includes(currentMonthString));
        if (activeTab === 'geral') return ignoredInCurrentMonth.filter(t => t.isShared);
        return ignoredInCurrentMonth.filter(t => t.subprofileId === activeTab);
    }, [data, currentMonthString, activeTab]);

    const isAllSelected = filteredData.length > 0 && filteredData.every(item => selectedIds.has(item.id));
    const isSomeSelected = filteredData.some(item => selectedIds.has(item.id));

    if (filteredData.length === 0) return null;

    return (
        <Card>
            <CardHeader><CardTitle>Itens Ignorados neste Mês</CardTitle></CardHeader>
            <CardContent>
                <div className="w-full overflow-x-auto">
                    <table className="w-full text-sm text-left text-text-secondary table-auto">
                        <thead className="text-xs text-table-header-text uppercase bg-table-header">
                            <tr>
                                <th className="px-4 py-3 w-px">
                                     <Checkbox
                                        title="Selecionar Tudo"
                                        checked={isAllSelected}
                                        indeterminate={isSomeSelected && !isAllSelected}
                                        onChange={(e) => onSelectAll(e.target.checked)}
                                    />
                                </th>
                                <th scope="col" className="px-4 py-3 w-[40%]">Descrição</th>
                                <th scope="col" className="px-4 py-3 w-[20%]">Tipo</th>
                                <th scope="col" className="px-4 py-3 w-[20%]">Valor Previsto</th>
                                <th scope="col" className="px-4 py-3 w-[20%] text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredData.map((item) => (
                                <tr key={item.id} className={`transition-colors ${selectedIds.has(item.id) ? 'bg-accent/10' : 'bg-card'} hover:bg-background`}>
                                     <td className="px-4 py-3 align-middle">
                                        <Checkbox checked={selectedIds.has(item.id)} onChange={(e) => onSelectionChange(item.id, e.target.checked)} />
                                    </td>
                                    <td className="px-4 py-3 align-middle font-medium text-text-primary">
                                        <div className="flex items-center gap-2">
                                            {item.seriesId ? <Landmark size={14} className="text-purple-400 flex-shrink-0" /> : <Repeat size={14} className="text-accent flex-shrink-0" />}
                                            <span>{item.description}</span>
                                            {item.seriesId && (
                                                <span className="text-xs text-text-secondary whitespace-nowrap">
                                                    ({item.currentInstallment}/{item.totalInstallments})
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 align-middle"><span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${item.type === 'income' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'}`}>{item.type === 'income' ? 'Receita' : 'Despesa'}</span></td>
                                    <td className="px-4 py-3 align-middle text-text-primary">{formatCurrency(item.planned)}</td>
                                    <td className="px-4 py-3 text-center align-middle">
                                        <button 
                                            onClick={() => onUnskip(item)} 
                                            disabled={isCurrentMonthClosed}
                                            className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-1 mx-auto disabled:bg-slate-400 disabled:cursor-not-allowed"
                                            title={isCurrentMonthClosed ? "Não é possível reativar em meses fechados" : "Reativar transação para este mês"}
                                        >
                                            <RotateCw size={14} /> Reativar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
};