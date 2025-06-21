// src/components/TransactionTable.tsx

import React, { useState, useEffect, useRef } from 'react';
import { MoreVertical, CheckCircle, XCircle, Edit, Trash2, ArrowUpDown, Repeat } from 'lucide-react';
import { Transaction, SortConfig } from '../types';
import { formatCurrency, formatShortDate } from '../lib/utils.ts';
import { EditableCell } from './EditableCell.tsx';

const ActionMenu: React.FC<{
    item: Transaction;
    onEdit: (transaction: Transaction) => void;
    onDelete: (id: string) => void;
}> = ({ item, onEdit, onDelete }) => {
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
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    return (
        <div className="relative inline-block text-left" ref={menuRef}>
            <button onClick={handleToggle} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
                <MoreVertical size={18}/>
            </button>
            {isOpen && (
                <div className={`${position} absolute right-0 w-40 rounded-md shadow-lg bg-white dark:bg-slate-800 ring-1 ring-black ring-opacity-5 z-20`}>
                    <div className="py-1">
                        <button onClick={() => { onEdit(item); setIsOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700">
                            <Edit size={16} /> Editar
                        </button>
                        <button onClick={() => { onDelete(item.id); setIsOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-slate-100 dark:hover:bg-slate-700">
                            <Trash2 size={16} /> Excluir
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const Card: React.FC<{ children: React.ReactNode }> = ({ children }) => (<div className="bg-white dark:bg-slate-800 rounded-xl shadow-md">{children}</div>);
const CardHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (<div className="p-4 border-b border-slate-200 dark:border-slate-700">{children}</div>);
const CardTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (<h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">{children}</h3>);
const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (<div className={`${className}`}>{children}</div>);

interface TransactionTableProps {
  title: string;
  data: Transaction[];
  type: 'income' | 'expense';
  isClosed: boolean;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  requestSort: (key: keyof Transaction) => void;
  onTogglePaid: (id: string, currentStatus: boolean) => void;
  onUpdateField: (transactionId: string, field: keyof Transaction, value: any) => void;
  sortConfig?: SortConfig | null;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({ title, data, type, isClosed, onEdit, onDelete, requestSort, onTogglePaid, onUpdateField, sortConfig }) => {
    
    const [editingDateId, setEditingDateId] = useState<string | null>(null);

    const getSortIndicator = (key: keyof Transaction) => {
        if (!sortConfig || sortConfig.key !== key) return <ArrowUpDown size={14} className="ml-2 opacity-30 group-hover:opacity-100" />;
        if (sortConfig.direction === 'ascending') return <ArrowUpDown size={14} className="ml-2 text-blue-500" />;
        return <ArrowUpDown size={14} className="ml-2 text-blue-500 transform rotate-180" />;
    };

    const SortableHeader: React.FC<{ sortKey: keyof Transaction; children: React.ReactNode; className?: string }> = ({ sortKey, children, className }) => (
        <th scope="col" className={`px-4 py-3 ${className}`}>
            <button onClick={() => requestSort(sortKey)} className="flex items-center w-full group">
                {children} {getSortIndicator(sortKey)}
            </button>
        </th>
    );

    return (
        <Card>
            <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
            <CardContent>
                <div className="w-full overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400 table-auto">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
                            <tr>
                                <SortableHeader sortKey="description" className="w-[28%]">Descrição</SortableHeader>
                                {/* --- COLUNA AGORA VISÍVEL PARA AMBOS OS TIPOS --- */}
                                <SortableHeader sortKey="paymentDate" className="w-[12%]">
                                    {/* --- CABEÇALHO DINÂMICO --- */}
                                    {type === 'expense' ? 'Pagamento' : 'Recebimento'}
                                </SortableHeader>
                                <SortableHeader sortKey="planned" className="w-[15%]">Previsto</SortableHeader>
                                <SortableHeader sortKey="actual" className="w-[15%]">Efetivo</SortableHeader>
                                <th scope="col" className="w-[15%] px-4 py-3 text-right">Diferença</th>
                                <SortableHeader sortKey="paid" className="w-[10%] text-center justify-center">
                                    {type === 'expense' ? 'Pago?' : 'Recebido?'}
                                </SortableHeader>
                                <th scope="col" className="w-[5%] px-4 py-3 text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {data.map(item => {
                                const difference = item.actual - item.planned;
                                let differenceColor = 'text-slate-500 dark:text-slate-400';
                                if (difference !== 0) {
                                    const isNegative = type === 'expense' ? difference > 0 : difference < 0;
                                    differenceColor = isNegative ? 'text-red-500' : 'text-green-500';
                                }
                                
                                return (
                                <tr key={item.id} className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                    <td className="px-4 py-3 align-middle font-medium text-slate-900 dark:text-white">
                                        <div className="flex items-center gap-2">
                                            {item.isRecurring && (
                                                <span title="Transação Recorrente">
                                                    <Repeat size={12} className="text-blue-500 flex-shrink-0"/>
                                                </span>
                                            )}
                                            <EditableCell value={item.description} onSave={(newValue) => onUpdateField(item.id, 'description', String(newValue))} disabled={isClosed} />
                                        </div>
                                    </td>
                                    {/* --- CÉLULA AGORA VISÍVEL PARA AMBOS OS TIPOS --- */}
                                    <td className="px-4 py-3 align-middle">
                                        {editingDateId === item.id && !isClosed ? (
                                            <div className="flex items-center gap-1">
                                                 <input
                                                    type="date"
                                                    defaultValue={item.paymentDate}
                                                    autoFocus
                                                    onBlur={(e) => {
                                                        onUpdateField(item.id, 'paymentDate', e.target.value);
                                                        setEditingDateId(null);
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            onUpdateField(item.id, 'paymentDate', e.currentTarget.value);
                                                            setEditingDateId(null);
                                                        }
                                                        if (e.key === 'Escape') {
                                                            setEditingDateId(null);
                                                        }
                                                    }}
                                                    className="w-full bg-slate-100 dark:bg-slate-700 p-2 rounded border border-blue-500"
                                                />
                                            </div>
                                        ) : (
                                            <div className="group relative w-full h-full flex items-center cursor-pointer" onClick={() => !isClosed && setEditingDateId(item.id)}>
                                                <span>{formatShortDate(item.paymentDate)}</span>
                                                {!isClosed && (
                                                    <button className="absolute right-0 top-1/2 -translate-y-1/2 p-1 rounded-full bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity">
                                                        <Edit size={12} />
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 align-middle">
                                        <EditableCell value={item.planned} type="number" formatAsCurrency onSave={(newValue) => onUpdateField(item.id, 'planned', newValue as number)} disabled={isClosed}/>
                                    </td>
                                    <td className="px-4 py-3 align-middle">
                                        <EditableCell value={item.actual} type="number" formatAsCurrency onSave={(newValue) => onUpdateField(item.id, 'actual', newValue as number)} disabled={isClosed}/>
                                    </td>

                                    <td className={`px-4 py-3 text-right font-bold align-middle ${differenceColor}`}>
                                        {formatCurrency(difference)}
                                    </td>
                                    <td className="px-4 py-3 text-center align-middle">
                                        <button 
                                            onClick={() => onTogglePaid(item.id, item.paid || false)}
                                            className="inline-flex items-center transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-70"
                                            disabled={isClosed}
                                        >
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium flex items-center ${item.paid ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'}`}>
                                                {item.paid ? <CheckCircle className="w-4 h-4 mr-1"/> : <XCircle className="w-4 h-4 mr-1"/>}
                                                {item.paid ? 'Sim' : 'Não'}
                                            </span>
                                        </button>
                                    </td>
                                    <td className="px-4 py-3 text-center align-middle">
                                        {!isClosed && <ActionMenu item={item} onEdit={onEdit} onDelete={onDelete} />}
                                    </td>
                                </tr>
                                )})}
                        </tbody>
                        <tfoot className="font-bold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-700">
                            <tr>
                                <td className="px-4 py-3">TOTAL</td>
                                <td className="px-4 py-3"></td>
                                <td className="px-4 py-3">{formatCurrency(data.reduce((acc, i) => acc + i.planned, 0))}</td>
                                <td className="px-4 py-3">{formatCurrency(data.reduce((acc, i) => acc + i.actual, 0))}</td>
                                <td colSpan={3}></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
};
