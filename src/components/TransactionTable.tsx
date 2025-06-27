// src/components/TransactionTable.tsx

import React, { useState, useEffect, useRef, useMemo } from 'react'; // Adicionado useMemo
import { MoreVertical, CheckCircle, XCircle, Edit, Trash2, ArrowUpDown, Repeat, Users, Info, SkipForward, RotateCw } from 'lucide-react'; // Adicionado RotateCw
import { Transaction, SortConfig, Subprofile } from '../types';
import { formatCurrency, formatShortDate } from '../lib/utils';
import { EditableCell } from './EditableCell';
import { Card, CardHeader, CardTitle, CardContent } from './Card';

// Componente Tooltip
const Tooltip: React.FC<{ content: React.ReactNode, children: React.ReactNode }> = ({ content, children }) => {
    return (
        <div className="relative flex items-center group">
            {children}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs bg-slate-900 text-white text-xs rounded py-1 px-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                {content}
                <svg className="absolute text-slate-900 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255">
                    <polygon className="fill-current" points="0,0 127.5,127.5 255,0"/>
                </svg>
            </div>
        </div>
    );
};


// Subcomponente para renderizar cada linha de detalhe no cartão mobile
const DetailRow: React.FC<{ label: string; value: React.ReactNode; valueClassName?: string }> = ({ label, value, valueClassName }) => (
    <div className="flex justify-between items-baseline text-sm">
        <span className="text-text-secondary">{label}</span>
        <span className={valueClassName}>{value}</span>
    </div>
);


// Componente interno para renderizar cada transação como um cartão no mobile
const TransactionItem: React.FC<{
    item: Transaction;
    type: 'income' | 'expense';
    isClosed: boolean;
    isIgnoredTable: boolean; // NOVO: Flag para indicar se está na tabela de ignorados
    onEdit: (transaction: Transaction) => void;
    onDelete: (transaction: Transaction) => void;
    onTogglePaid: (transaction: Transaction) => void;
    onUpdateField: (transactionId: string, field: keyof Transaction, value: any) => void;
    onSkip: (transaction: Transaction) => void; // NOVO
    onUnskip: (transaction: Transaction) => void; // NOVO
}> = ({ item, type, isClosed, isIgnoredTable, onEdit, onDelete, onTogglePaid, onUpdateField, onSkip, onUnskip }) => {
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
                 {!isClosed && !isApportioned && !isIgnoredTable && ( // Não mostrar menu de ações na tabela de ignorados ou para transações rateadas
                    <ActionMenu item={item} onEdit={onEdit} onDelete={onDelete} onSkip={onSkip} />
                )}
                 {isIgnoredTable && ( // Botão Reativar na tabela de ignorados
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


const ActionMenu: React.FC<{
    item: Transaction;
    onEdit: (transaction: Transaction) => void;
    onDelete: (transaction: Transaction) => void;
    onSkip: (transaction: Transaction) => void; // NOVO
}> = ({ item, onEdit, onDelete, onSkip }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);
    const [position, setPosition] = useState('origin-top-right top-full mt-2');

    const handleToggle = () => {
        if (!isOpen && menuRef.current) {
            const rect = menuRef.current.getBoundingClientRect();
            if (window.innerHeight - rect.bottom < 100) {
                setPosition('origin-bottom-right bottom-full mb-1');
            } else {
                setPosition('origin-top-right top-full mt-2');
            }
        }
        setIsOpen(!isOpen);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) setIsOpen(false);
        };
        if (isOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    return (
        <div className="relative inline-block text-left" ref={menuRef}>
            <button onClick={handleToggle} className="p-2 rounded-full text-text-secondary hover:bg-background"><MoreVertical size={18}/></button>
            {isOpen && (
                <div className={`${position} absolute right-0 w-40 rounded-md shadow-lg bg-card ring-1 ring-black ring-opacity-5 z-20 border border-border-color`}>
                    <div className="py-1">
                        <button onClick={() => { onEdit(item); setIsOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:bg-background"><Edit size={16} /> Editar</button>
                        {item.isRecurring && ( // Exibir opção "Ignorar" apenas para transações recorrentes
                            <button onClick={() => { onSkip(item); setIsOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:bg-background"><SkipForward size={16} /> Ignorar neste mês</button>
                        )}
                        <button onClick={() => { onDelete(item); setIsOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-background"><Trash2 size={16} /> Excluir</button>
                    </div>
                </div>
            )}
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
  onSkip?: (transaction: Transaction) => void; // NOVO: Para pular transações recorrentes
  onUnskip?: (transaction: Transaction) => void; // NOVO: Para reativar transações puladas
  isIgnoredTable?: boolean; // NOVO: Flag para a tabela de transações ignoradas
}

export const TransactionTable: React.FC<TransactionTableProps> = (props) => {
    const { title, data, type, isClosed, requestSort, sortConfig, subprofileRevenueProportions, subprofiles, apportionmentMethod, onSkip, onUnskip, isIgnoredTable = false, ...rest } = props;
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
                {/* Mobile View */}
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
                        />
                    ))}
                    {data.length > 0 && (
                        <div className="flex justify-between font-bold text-text-primary bg-background p-4 rounded-lg mt-4">
                            <span>TOTAL</span>
                            <span>{formatCurrency(data.reduce((acc, i) => acc + i.actual, 0))}</span>
                        </div>
                    )}
                </div>

                {/* Desktop View */}
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
                                                <Tooltip content="Esta despesa é um rateio da Visão Geral e não pode ser editada aqui.">
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
                                        {!isClosed && !isApportioned && !isIgnoredTable && <ActionMenu item={item} onEdit={props.onEdit} onDelete={props.onDelete} onSkip={onSkip!} />}
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


// NOVO: Componente para a tabela de Transações Ignoradas
interface IgnoredTransactionsTableProps {
    data: Transaction[];
    onUnskip: (transaction: Transaction) => void;
    currentMonthString: string;
}

export const IgnoredTransactionsTable: React.FC<IgnoredTransactionsTableProps> = ({ data, onUnskip, currentMonthString }) => {
    const filteredData = useMemo(() => {
        return data.filter((t: Transaction) => (t.skippedInMonths || []).includes(currentMonthString)); // Tipagem explícita para 't'
    }, [data, currentMonthString]);

    if (filteredData.length === 0) return null;

    return (
        <Card>
            <CardHeader><CardTitle>Receitas e Despesas Ignoradas neste Mês</CardTitle></CardHeader>
            <CardContent>
                {/* Mobile View */}
                <div className="md:hidden">
                    {filteredData.map((item: Transaction) => ( // Tipagem explícita para 'item'
                        <TransactionItem 
                            key={item.id} 
                            item={item} 
                            type={item.type} 
                            isClosed={false} 
                            isIgnoredTable={true}
                            onTogglePaid={() => {}} // No-op for ignored table
                            onEdit={() => {}} // No-op for ignored table
                            onDelete={() => {}} // No-op for ignored table
                            onUpdateField={() => {}} // No-op for ignored table
                            onSkip={() => {}} // No-op
                            onUnskip={onUnskip}
                        />
                    ))}
                </div>
                {/* Desktop View */}
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
                            {filteredData.map((item: Transaction) => ( // Tipagem explícita para 'item'
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