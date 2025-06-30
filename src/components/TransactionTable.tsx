// src/components/TransactionTable.tsx

import React, { useState, useEffect, useRef, useLayoutEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { MoreVertical, CheckCircle, XCircle, Edit, Trash2, ArrowUpDown, Repeat, Users, Info, SkipForward, RotateCw, ArrowRightLeft } from 'lucide-react';
import { Transaction, SortConfig, Subprofile } from '../types';
import { formatCurrency, formatShortDate } from '../lib/utils';
import { EditableCell } from './EditableCell';
import { Card, CardHeader, CardTitle, CardContent } from './Card';

// Tooltip com Portal
const Tooltip: React.FC<{ content: React.ReactNode, children: React.ReactNode }> = ({ content, children }) => {
    const triggerRef = useRef<HTMLDivElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useLayoutEffect(() => {
        if (isVisible && triggerRef.current && tooltipRef.current) {
            const { top, left, width } = triggerRef.current.getBoundingClientRect();
            const { width: tooltipWidth, height: tooltipHeight } = tooltipRef.current.getBoundingClientRect();
            
            tooltipRef.current.style.left = `${left + window.scrollX + width / 2 - tooltipWidth / 2}px`;
            tooltipRef.current.style.top = `${top + window.scrollY - tooltipHeight - 8}px`; // 8px de margem
        }
    }, [isVisible]);

    const showTooltip = () => setIsVisible(true);
    const hideTooltip = () => setIsVisible(false);

    return (
        <div ref={triggerRef} onMouseEnter={showTooltip} onMouseLeave={hideTooltip} className="relative flex items-center">
            {children}
            {isVisible && ReactDOM.createPortal(
                <div ref={tooltipRef} className="fixed bg-slate-900 text-white text-xs rounded py-1 px-2 z-50 transition-opacity duration-300 pointer-events-none animate-fade-in">
                    {content}
                </div>,
                document.body
            )}
        </div>
    );
};

// ActionMenu com Portal
const ActionMenu: React.FC<{
    item: Transaction;
    onEdit: (transaction: Transaction) => void;
    onDelete: (transaction: Transaction) => void;
    onSkip: (transaction: Transaction) => void;
    onTransfer: (transaction: Transaction) => void;
}> = ({ item, onEdit, onDelete, onSkip, onTransfer }) => {
    const [isOpen, setIsOpen] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        if (isOpen && buttonRef.current && menuRef.current) {
            const { top, left, height, width } = buttonRef.current.getBoundingClientRect();
            const menuHeight = menuRef.current.offsetHeight;
            const windowHeight = window.innerHeight;

            let topPos = top + height + window.scrollY;
            if (topPos + menuHeight > windowHeight) {
                topPos = top - menuHeight + window.scrollY;
            }

            menuRef.current.style.top = `${topPos}px`;
            menuRef.current.style.left = `${left + window.scrollX + width - menuRef.current.offsetWidth}px`;
        }
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node) && !buttonRef.current?.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    return (
        <>
            <button ref={buttonRef} onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-full text-text-secondary hover:bg-background"><MoreVertical size={18}/></button>
            {isOpen && ReactDOM.createPortal(
                <div ref={menuRef} className="fixed w-48 rounded-md shadow-lg bg-card ring-1 ring-black ring-opacity-5 z-50 border border-border-color animate-fade-in">
                    <div className="py-1">
                        <button onClick={() => { onEdit(item); setIsOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:bg-background"><Edit size={16} /> Editar</button>
                        <button onClick={() => { onTransfer(item); setIsOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:bg-background"><ArrowRightLeft size={16} /> Transferir</button>
                        {item.isRecurring && (
                            <button onClick={() => { onSkip(item); setIsOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:bg-background"><SkipForward size={16} /> Ignorar neste mês</button>
                        )}
                        <button onClick={() => { onDelete(item); setIsOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-background"><Trash2 size={16} /> Excluir</button>
                    </div>
                </div>,
                document.body
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

const TransactionItem: React.FC<{
    item: Transaction;
    type: 'income' | 'expense';
    isClosed: boolean;
    isIgnoredTable: boolean;
    onEdit: (transaction: Transaction) => void;
    onDelete: (transaction: Transaction) => void;
    onTogglePaid: (transaction: Transaction) => void;
    onUpdateField: (transactionId: string, field: keyof Transaction, value: any) => void;
    onSkip: (transaction: Transaction) => void;
    onUnskip: (transaction: Transaction) => void;
    onTransfer: (transaction: Transaction) => void;
}> = ({ item, type, isClosed, isIgnoredTable, onEdit, onDelete, onTogglePaid, onUpdateField, onSkip, onUnskip, onTransfer }) => {
    const difference = item.actual - item.planned;
    let differenceColor = 'text-text-secondary';
    if (difference !== 0) {
        const isNegative = type === 'expense' ? difference > 0 : difference < 0;
        differenceColor = isNegative ? 'text-red-500' : 'text-green-500';
    }
    const isApportioned = item.isApportioned === true;

    return (
        <div className="md:hidden border border-border-color rounded-lg mb-4 p-4 space-y-4 bg-card hover:bg-background/50">
            <div className="flex justify-between items-start">
                 <div className="font-medium text-text-primary flex items-center gap-2 pr-2 overflow-hidden">
                     {item.isRecurring && <span title="Transação Recorrente"><Repeat size={12} className="text-accent flex-shrink-0" /></span>}
                     {isApportioned && <span title="Rateio da Casa"><Users size={12} className="text-teal-400 flex-shrink-0" /></span>}
                     <EditableCell value={item.description} onSave={(v) => onUpdateField(item.id, 'description', String(v))} disabled={isClosed || isApportioned || isIgnoredTable} />
                </div>
                 {!isClosed && !isApportioned && !isIgnoredTable && (
                    <ActionMenu item={item} onEdit={onEdit} onDelete={onDelete} onSkip={onSkip} onTransfer={onTransfer} />
                )}
                 {isIgnoredTable && (
                    <button onClick={() => onUnskip(item)} className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-1">
                        <RotateCw size={14} /> Reativar
                    </button>
                )}
            </div>
            <div className="space-y-2">
                <DetailRow label="Efetivo" value={formatCurrency(item.actual)} valueClassName="font-bold text-lg text-text-primary" />
                <DetailRow label="Previsto" value={formatCurrency(item.planned)} valueClassName="text-sm text-text-secondary" />
                <DetailRow label="Diferença" value={formatCurrency(difference)} valueClassName={`text-sm font-medium ${differenceColor}`} />
            </div>
            <div className="border-t border-border-color !mt-3 !mb-2"></div>
            <div className="flex justify-between items-center text-sm">
                <div className="text-text-secondary">
                    <span>{type === 'expense' ? 'Pago em' : 'Recebido em'}: </span>
                    <span className="font-medium text-text-primary">{formatShortDate(item.paymentDate)}</span>
                </div>
                 <button onClick={() => onTogglePaid(item)} className="inline-flex items-center transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-70" disabled={isClosed || isApportioned || isIgnoredTable}>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium flex items-center ${item.paid ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'}`}>
                         {item.paid ? <CheckCircle className="w-4 h-4 mr-1"/> : <XCircle className="w-4 h-4 mr-1"/>}
                         {item.paid ? 'Sim' : 'Não'}
                    </span>
                </button>
            </div>
        </div>
    );
};

interface TransactionTableProps {
  title: string;
  data: Transaction[];
  type: 'income' | 'expense';
  isClosed: boolean;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
  requestSort: (key: keyof Transaction) => void;
  onTogglePaid: (transaction: Transaction) => void;
  onUpdateField: (transactionId: string, field: keyof Transaction, value: any) => void;
  sortConfig?: SortConfig | null;
  subprofileRevenueProportions?: Map<string, number>;
  subprofiles?: Subprofile[];
  apportionmentMethod?: 'proportional' | 'manual';
  onSkip?: (transaction: Transaction) => void;
  onUnskip?: (transaction: Transaction) => void;
  onTransfer: (transaction: Transaction) => void;
  isIgnoredTable?: boolean;
}

export const TransactionTable: React.FC<TransactionTableProps> = (props) => {
    const { title, data, type, isClosed, requestSort, sortConfig, subprofileRevenueProportions, subprofiles, apportionmentMethod, onSkip, onUnskip, isIgnoredTable = false, onTransfer, ...rest } = props;
    const [editingDateId, setEditingDateId] = useState<string | null>(null);

    const getSortIndicator = (key: keyof Transaction) => {
        if (!sortConfig || sortConfig.key !== key) return <ArrowUpDown size={14} className="ml-2 opacity-30 group-hover:opacity-100" />;
        if (sortConfig.direction === 'ascending') return <ArrowUpDown size={14} className="text-accent" />;
        return <ArrowUpDown size={14} className="text-accent transform rotate-180" />;
    };

    const SortableHeader: React.FC<{ sortKey: keyof Transaction; children: React.ReactNode; className?: string }> = ({ sortKey, children, className }) => (
        <th scope="col" className={`px-4 py-3 ${className}`}>
            <button onClick={() => requestSort(sortKey)} className="flex items-center w-full group">{children} {getSortIndicator(sortKey)}</button>
        </th>
    );
    
    const getApportionmentTooltipContent = (transaction: Transaction) => {
        if (!subprofiles || !subprofileRevenueProportions) return null;
        const activeSubprofiles = subprofiles.filter(s => s.status === 'active');
        if (apportionmentMethod === 'proportional' && subprofileRevenueProportions.size > 0) {
            return (
                <div className="p-1 space-y-1">
                    <p className="font-bold border-b border-slate-600 pb-1 mb-1">Rateio Proporcional</p>
                    {activeSubprofiles.map(sub => {
                        const proportion = subprofileRevenueProportions.get(sub.id) || 0;
                        const value = transaction.actual * proportion;
                        return (
                            <div key={sub.id} className="flex justify-between gap-4">
                                <span>{sub.name}:</span>
                                <span className="font-mono">{formatCurrency(value)} ({ (proportion * 100).toFixed(1) }%)</span>
                            </div>
                        );
                    })}
                </div>
            )
        }
        return <div className="p-1">Rateio Manual Ativado</div>;
    }

    return (
        <Card>
            <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
            <CardContent>
                 <style>{`
                    @keyframes fade-in {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                    .animate-fade-in {
                        animation: fade-in 0.2s ease-out forwards;
                    }
                `}</style>
                <div className="md:hidden">
                    {data.length > 0 && data.map(item => (
                        <TransactionItem 
                            key={item.id} 
                            item={item} 
                            type={type} 
                            isClosed={isClosed} 
                            isIgnoredTable={isIgnoredTable}
                            onTogglePaid={() => rest.onTogglePaid(item)}
                            onEdit={rest.onEdit}
                            onDelete={rest.onDelete}
                            onUpdateField={rest.onUpdateField}
                            onSkip={onSkip!}
                            onUnskip={onUnskip!}
                            onTransfer={onTransfer}
                        />
                    ))}
                    {data.length > 0 && (
                        <div className="flex justify-between font-bold text-text-primary bg-background p-4 rounded-lg mt-4">
                            <span>TOTAL</span>
                            <span>{formatCurrency(data.reduce((acc, i) => acc + i.actual, 0))}</span>
                        </div>
                    )}
                </div>
                <div className="w-full overflow-x-auto hidden md:block">
                    <table className="w-full text-sm text-left text-text-secondary table-auto">
                        <thead className="text-xs text-text-primary uppercase bg-background">
                            <tr>
                                <SortableHeader sortKey="description" className="w-[28%]">Descrição</SortableHeader>
                                <SortableHeader sortKey="paymentDate" className="w-[12%]">{type === 'expense' ? 'Pagamento' : 'Recebimento'}</SortableHeader>
                                <SortableHeader sortKey="planned" className="w-[15%]">Previsto</SortableHeader>
                                <SortableHeader sortKey="actual" className="w-[15%]">Efetivo</SortableHeader>
                                <th scope="col" className="w-[15%] px-4 py-3 text-right">Diferença</th>
                                <SortableHeader sortKey="paid" className="w-[10%] text-center justify-center">{type === 'expense' ? 'Pago?' : 'Recebido?'}</SortableHeader>
                                <th scope="col" className="w-[5%] px-4 py-3 text-center">Ações</th>
                            </tr>
                        </thead>
                       {data.length > 0 && (
                         <tbody className="divide-y divide-border-color">
                            {data.map(item => {
                                const difference = item.actual - item.planned;
                                let differenceColor = 'text-text-secondary';
                                if (difference !== 0) {
                                    const isNegative = type === 'expense' ? difference > 0 : difference < 0;
                                    differenceColor = isNegative ? 'text-red-500' : 'text-green-500';
                                }
                                const isApportioned = item.isApportioned === true;
                                return (
                                <tr key={item.id} className={`bg-card ${!isApportioned && !isIgnoredTable && 'hover:bg-background'}`}>
                                    <td className="px-4 py-3 align-middle font-medium text-text-primary">
                                        <div className="flex items-center gap-2">
                                            {item.isShared && (
                                                 <Tooltip content={getApportionmentTooltipContent(item)}>
                                                     <Users size={14} className="text-cyan-400 flex-shrink-0 cursor-pointer"/>
                                                 </Tooltip>
                                            )}
                                            {item.isRecurring && <span title="Transação Recorrente"><Repeat size={12} className="text-accent flex-shrink-0"/></span>}
                                            {isApportioned && (
                                                <Tooltip content={<>Esta despesa é um rateio da Visão Geral<br />e não pode ser editada aqui.</>}>
                                                    <Info size={14} className="text-teal-400 flex-shrink-0 cursor-help" />
                                                </Tooltip>
                                            )}
                                            <EditableCell value={item.description} onSave={(newValue) => props.onUpdateField(item.id, 'description', String(newValue))} disabled={isClosed || isApportioned || isIgnoredTable} />
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 align-middle">
                                        {editingDateId === item.id && !isClosed && !isApportioned && !isIgnoredTable ? (
                                            <div className="flex items-center gap-1">
                                                 <input
                                                    type="date"
                                                    defaultValue={item.paymentDate}
                                                    autoFocus
                                                    onBlur={(e) => {
                                                        props.onUpdateField(item.id, 'paymentDate', e.target.value);
                                                        setEditingDateId(null);
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' || e.key === 'Escape') {
                                                            if (e.key === 'Enter') {
                                                                props.onUpdateField(item.id, 'paymentDate', e.currentTarget.value);
                                                            }
                                                            setEditingDateId(null);
                                                            e.currentTarget.blur();
                                                        }
                                                    }}
                                                    className="w-full bg-background text-text-primary p-2 rounded border border-accent"
                                                />
                                            </div>
                                        ) : (
                                            <div className="group relative w-full h-full flex items-center cursor-pointer" onClick={() => !isClosed && !isApportioned && !isIgnoredTable && setEditingDateId(item.id)}>
                                                <span>{formatShortDate(item.paymentDate)}</span>
                                                {!isClosed && !isApportioned && !isIgnoredTable && (
                                                    <button className="absolute right-0 top-1/2 -translate-y-1/2 p-1 rounded-full bg-background text-text-secondary opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity">
                                                        <Edit size={12} />
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 align-middle"><EditableCell value={item.planned} type="number" formatAsCurrency onSave={(newValue) => props.onUpdateField(item.id, 'planned', newValue as number)} disabled={isClosed || isApportioned || isIgnoredTable}/></td>
                                    <td className="px-4 py-3 align-middle"><EditableCell value={item.actual} type="number" formatAsCurrency onSave={(newValue) => props.onUpdateField(item.id, 'actual', newValue as number)} disabled={isClosed || isApportioned || isIgnoredTable}/></td>
                                    <td className={`px-4 py-3 text-right font-bold align-middle ${differenceColor}`}>{formatCurrency(difference)}</td>
                                    <td className="px-4 py-3 text-center align-middle">
                                        <button 
                                            onClick={() => props.onTogglePaid(item)}
                                            className="inline-flex items-center transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-70" 
                                            disabled={isClosed || (isApportioned && type !== 'income') || isIgnoredTable}
                                        >
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium flex items-center ${item.paid ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'}`}>
                                                {item.paid ? <CheckCircle className="w-4 h-4 mr-1"/> : <XCircle className="w-4 h-4 mr-1"/>}
                                                {item.paid ? 'Sim' : 'Não'}
                                            </span>
                                        </button>
                                    </td>
                                    <td className="px-4 py-3 text-center align-middle">
                                        {!isClosed && !isApportioned && !isIgnoredTable && <ActionMenu item={item} onEdit={props.onEdit} onDelete={props.onDelete} onSkip={onSkip!} onTransfer={onTransfer} />}
                                        {isIgnoredTable && (
                                            <button onClick={() => onUnskip!(item)} className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-1 mx-auto">
                                                <RotateCw size={14} /> Reativar
                                            </button>
                                        )}
                                    </td>
                                </tr>
                                )})}
                        </tbody>
                       )}
                       {data.length > 0 && (
                         <tfoot className="font-bold text-text-primary bg-background">
                            <tr>
                                <td className="px-4 py-3">TOTAL</td><td></td>
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
        </Card>
    );
};

interface IgnoredTransactionsTableProps {
    data: Transaction[];
    onUnskip: (transaction: Transaction) => void;
    currentMonthString: string;
    activeTab: string;
}

export const IgnoredTransactionsTable: React.FC<IgnoredTransactionsTableProps> = ({ data, onUnskip, currentMonthString, activeTab }) => {
    const filteredData = useMemo(() => {
        const ignoredInCurrentMonth = data.filter((t: Transaction) => (t.skippedInMonths || []).includes(currentMonthString));
        if (activeTab === 'geral') {
            return ignoredInCurrentMonth.filter(t => t.isShared);
        } else {
            return ignoredInCurrentMonth.filter(t => t.subprofileId === activeTab);
        }
    }, [data, currentMonthString, activeTab]);

    if (filteredData.length === 0) return null;

    return (
        <Card>
            <CardHeader><CardTitle>Receitas e Despesas Ignoradas neste Mês</CardTitle></CardHeader>
            <CardContent>
                <div className="md:hidden">
                    {filteredData.map((item: Transaction) => (
                        <TransactionItem 
                            key={item.id} 
                            item={item} 
                            type={item.type} 
                            isClosed={false} 
                            isIgnoredTable={true}
                            onTogglePaid={() => {}}
                            onEdit={() => {}}
                            onDelete={() => {}}
                            onUpdateField={() => {}}
                            onSkip={() => {}}
                            onUnskip={onUnskip}
                            onTransfer={() => {}}
                        />
                    ))}
                </div>
                <div className="w-full overflow-x-auto hidden md:block">
                    <table className="w-full text-sm text-left text-text-secondary table-auto">
                        <thead className="text-xs text-text-primary uppercase bg-background">
                            <tr>
                                <th scope="col" className="px-4 py-3 w-[40%]">Descrição</th>
                                <th scope="col" className="px-4 py-3 w-[20%]">Tipo</th>
                                <th scope="col" className="px-4 py-3 w-[20%]">Valor Previsto</th>
                                <th scope="col" className="px-4 py-3 w-[20%] text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-color">
                            {filteredData.map((item: Transaction) => (
                                <tr key={item.id} className="bg-card hover:bg-background">
                                    <td className="px-4 py-3 align-middle font-medium text-text-primary">
                                        <div className="flex items-center gap-2">
                                            <Repeat size={14} className="text-accent flex-shrink-0" />
                                            <span>{item.description}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 align-middle">
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${item.type === 'income' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'}`}>
                                            {item.type === 'income' ? 'Receita' : 'Despesa'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 align-middle text-text-primary">{formatCurrency(item.planned)}</td>
                                    <td className="px-4 py-3 text-center align-middle">
                                        <button onClick={() => onUnskip(item)} className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-1 mx-auto">
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