// src/components/TransactionTable.tsx

import React, { useState, useMemo } from 'react';
import { ArrowUpDown, Landmark, Repeat, RotateCw } from 'lucide-react';
import { Transaction, SortConfig, Subprofile, Label, TransactionActions, GroupBy } from '../types';
import { formatCurrency } from '../lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { NoteModal } from './NoteModal';
import { LabelSelector } from './LabelSelector';
import { TransactionItem } from './transactions/TransactionItem';
import { TransactionRow } from './transactions/TransactionRow';
import { Checkbox } from './Checkbox';
import { groupTransactions } from '../logic/grouping';

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
    apportionmentMethod?: 'proportional' | 'manual' | 'percentage';
    selectedIds: Set<string>;
    onSelectionChange: (id: string, checked: boolean) => void;
    onSelectAll: (checked: boolean) => void;
    groupBy?: GroupBy;
}

export const TransactionTable: React.FC<TransactionTableProps> = (props) => {
    const { title, data, labels, type, isClosed, requestSort, sortConfig, actions, selectedIds, onSelectionChange, onSelectAll, groupBy = 'none', subprofiles, subprofileRevenueProportions } = props;
    const [noteModalState, setNoteModalState] = useState<{ isOpen: boolean; transaction: Transaction | null }>({ isOpen: false, transaction: null });
    const [labelSelectorState, setLabelSelectorState] = useState<{ isOpen: boolean; transactionId: string | null, anchorEl: HTMLElement | null }>({ isOpen: false, transactionId: null, anchorEl: null });

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

    const handleRemoveLabel = (transactionId: string, labelId: string) => {
        const transaction = data.find(t => t.id === transactionId);
        if (!transaction) return;
        const currentLabels = transaction.labelIds || [];
        const newLabels = currentLabels.filter(id => id !== labelId);
        actions.onUpdateField(transactionId, 'labelIds', newLabels);
    };

    const handleOpenLabelSelector = (transactionId: string, anchorEl: HTMLElement) => {
        setLabelSelectorState({ isOpen: true, transactionId, anchorEl });
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

    const isAllSelected = data.length > 0 && data.every(item => selectedIds.has(item.id));
    const isSomeSelected = data.some(item => selectedIds.has(item.id));

    const groupedData = useMemo(() => {
        if (groupBy === 'none') return null;
        return groupTransactions(data, groupBy, labels);
    }, [data, groupBy, labels]);

    return (
        <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{title}</CardTitle>
                <div className="text-sm text-text-secondary">
                    {data.length} transações
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {/* Mobile View */}
                <div className="md:hidden p-4">
                    <div className="flex items-center justify-between mb-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <Checkbox
                                title="Selecionar Tudo"
                                checked={isAllSelected}
                                indeterminate={isSomeSelected && !isAllSelected}
                                onChange={(e) => onSelectAll(e.target.checked)}
                            />
                            <span className="text-sm font-medium text-text-secondary">Selecionar Tudo</span>
                        </label>
                    </div>

                    {data.length > 0 ? (
                        groupedData ? (
                            Object.entries(groupedData).map(([groupName, transactions]) => (
                                <div key={groupName} className="mb-6">
                                    <div className="bg-muted/50 px-4 py-2 font-medium rounded-t-lg text-sm text-text-secondary mb-2">
                                        {groupName} ({transactions.length})
                                    </div>
                                    {transactions.map(item => (
                                        <TransactionItem
                                            key={item.id}
                                            item={item}
                                            type={type}
                                            isClosed={isClosed}
                                            isIgnoredTable={false}
                                            actions={actions}
                                            onOpenNoteModal={handleOpenNoteModal}
                                            isSelected={selectedIds.has(item.id)}
                                            onSelectionChange={onSelectionChange}
                                            subprofiles={subprofiles}
                                            subprofileRevenueProportions={subprofileRevenueProportions}
                                        />
                                    ))}
                                </div>
                            ))
                        ) : (
                            data.map(item => (
                                <TransactionItem
                                    key={item.id}
                                    item={item}
                                    type={type}
                                    isClosed={isClosed}
                                    isIgnoredTable={false}
                                    actions={actions}
                                    onOpenNoteModal={handleOpenNoteModal}
                                    isSelected={selectedIds.has(item.id)}
                                    onSelectionChange={onSelectionChange}
                                    subprofiles={subprofiles}
                                    subprofileRevenueProportions={subprofileRevenueProportions}
                                />
                            ))
                        )
                    ) : (
                        <div className="text-center py-10 text-text-secondary">Nenhuma transação encontrada nesta categoria.</div>
                    )}

                    {data.length > 0 && (
                        <div className="flex justify-between font-bold text-table-footer-text bg-table-footer p-4 rounded-lg mt-4">
                            <span>TOTAL</span>
                            <span>{formatCurrency(data.reduce((acc, i) => acc + i.actual, 0))}</span>
                        </div>
                    )}
                </div>

                {/* Desktop View */}
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
                                {groupedData ? (
                                    Object.entries(groupedData).map(([groupName, transactions]) => (
                                        <React.Fragment key={groupName}>
                                            <tr className="bg-muted/30 font-medium">
                                                <td colSpan={type === 'expense' ? 11 : 10} className="px-4 py-2 text-left text-xs text-text-secondary uppercase tracking-wider">
                                                    {groupName} ({transactions.length})
                                                </td>
                                            </tr>
                                            {transactions.map(item => (
                                                <TransactionRow
                                                    key={item.id}
                                                    item={item}
                                                    type={type}
                                                    isClosed={isClosed}
                                                    isIgnoredTable={false}
                                                    actions={actions}
                                                    onOpenNoteModal={handleOpenNoteModal}
                                                    isSelected={selectedIds.has(item.id)}
                                                    onSelectionChange={onSelectionChange}
                                                    labels={labels}
                                                    onRemoveLabel={handleRemoveLabel}
                                                    onOpenLabelSelector={handleOpenLabelSelector}
                                                    subprofiles={subprofiles}
                                                    subprofileRevenueProportions={subprofileRevenueProportions}
                                                />
                                            ))}
                                        </React.Fragment>
                                    ))
                                ) : (
                                    data.map(item => (
                                        <TransactionRow
                                            key={item.id}
                                            item={item}
                                            type={type}
                                            isClosed={isClosed}
                                            isIgnoredTable={false}
                                            actions={actions}
                                            onOpenNoteModal={handleOpenNoteModal}
                                            isSelected={selectedIds.has(item.id)}
                                            onSelectionChange={onSelectionChange}
                                            labels={labels}
                                            onRemoveLabel={handleRemoveLabel}
                                            onOpenLabelSelector={handleOpenLabelSelector}
                                            subprofiles={subprofiles}
                                            subprofileRevenueProportions={subprofileRevenueProportions}
                                        />
                                    ))
                                )}
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
                                            disabled={isCurrentMonthClosed || !!item.isApportioned || !!item.parentId}
                                            className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-1 mx-auto disabled:bg-slate-400 disabled:cursor-not-allowed"
                                            title={isCurrentMonthClosed ? "Não é possível reativar em meses fechados" : (item.isApportioned || item.parentId ? "Gerenciado na Visão Geral" : "Reativar transação para este mês")}
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