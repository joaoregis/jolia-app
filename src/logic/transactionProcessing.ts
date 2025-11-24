import { Transaction, FilterConfig, SortConfig, Label } from '../types';

export function filterTransactions(transactions: Transaction[], filterConfig: FilterConfig): Transaction[] {
    return transactions.filter(t => {
        if (filterConfig.searchTerm) {
            const term = filterConfig.searchTerm.toLowerCase();
            if (!t.description.toLowerCase().includes(term)) return false;
        }
        if (filterConfig.minAmount !== undefined && t.actual < filterConfig.minAmount) return false;
        if (filterConfig.maxAmount !== undefined && t.actual > filterConfig.maxAmount) return false;
        if (filterConfig.labelIds && filterConfig.labelIds.length > 0) {
            if (!t.labelIds || !t.labelIds.some(id => filterConfig.labelIds!.includes(id))) return false;
        }
        if (filterConfig.startDate && t.date < filterConfig.startDate) return false;
        if (filterConfig.endDate && t.date > filterConfig.endDate) return false;
        return true;
    });
}

export function sortTransactions(transactions: Transaction[], sortConfig: SortConfig | null, allLabels: Label[]): Transaction[] {
    if (!sortConfig) return [...transactions];

    const labelsMap = new Map(allLabels.map(l => [l.id, l]));

    const getPrimaryLabelName = (t: Transaction) => {
        if (!t.labelIds || t.labelIds.length === 0) return null;
        return labelsMap.get(t.labelIds[0])?.name || null;
    };

    const sortFn = (a: Transaction, b: Transaction) => {
        if (sortConfig.key === 'labelIds') {
            const aLabel = getPrimaryLabelName(a);
            const bLabel = getPrimaryLabelName(b);
            if (aLabel === bLabel) return 0;
            if (aLabel === null) return 1;
            if (bLabel === null) return -1;
            return sortConfig.direction === 'ascending'
                ? aLabel.localeCompare(bLabel)
                : bLabel.localeCompare(aLabel);
        }

        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        if (aVal == null && bVal == null) return 0;
        if (aVal == null) return sortConfig.direction === 'ascending' ? 1 : -1;
        if (bVal == null) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (typeof aVal === 'boolean' && typeof bVal === 'boolean') {
            return (sortConfig.direction === 'ascending' ? (aVal ? -1 : 1) : (aVal ? 1 : -1));
        }
        if (typeof aVal === 'number' && typeof bVal === 'number') {
            return sortConfig.direction === 'ascending' ? aVal - bVal : bVal - aVal;
        }
        return sortConfig.direction === 'ascending'
            ? String(aVal).localeCompare(String(bVal))
            : String(bVal).localeCompare(String(aVal));
    };

    return [...transactions].sort(sortFn);
}

export function splitActiveAndIgnoredTransactions(allTransactions: Transaction[], currentMonthString: string) {
    const active: Transaction[] = [];
    const ignored: Transaction[] = [];
    for (const t of allTransactions) {
        if (t.skippedInMonths?.includes(currentMonthString)) {
            ignored.push(t);
        } else {
            active.push(t);
        }
    }
    return { activeTransactions: active, ignoredTransactions: ignored };
}
