import { Transaction, Label, GroupBy } from '../types';

export const groupTransactions = (
    transactions: Transaction[],
    groupBy: GroupBy,
    labels: Label[]
): Record<string, Transaction[]> | null => {
    if (groupBy === 'none') return null;

    const groups: Record<string, Transaction[]> = {};

    transactions.forEach(t => {
        let key = '';
        if (groupBy === 'label') {
            const label = labels.find(l => t.labelIds?.includes(l.id));
            key = label ? label.name : 'Sem Rótulo';
        } else if (groupBy === 'date') {
            const [year, month, day] = t.date.split('-');
            key = `${day}/${month}/${year}`;
        } else if (groupBy === 'type') {
            key = t.type === 'income' ? 'Receita' : 'Despesa';
        }

        if (!groups[key]) groups[key] = [];
        groups[key].push(t);
    });

    return groups;
};
