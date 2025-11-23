import { describe, it, expect } from 'vitest';
import { filterTransactions, sortTransactions } from './transactionProcessing';
import { Transaction, Label } from '../types';

const mockTransactions: Transaction[] = [
    { id: '1', description: 'Salary', actual: 5000, date: '2023-10-01', type: 'income', labelIds: ['l1'], paid: true, planned: 5000, isShared: false, isRecurring: false, createdAt: {} as any, profileId: 'p1' },
    { id: '2', description: 'Groceries', actual: 200, date: '2023-10-05', type: 'expense', labelIds: ['l2'], paid: true, planned: 200, isShared: true, isRecurring: false, createdAt: {} as any, profileId: 'p1' },
    { id: '3', description: 'Rent', actual: 1500, date: '2023-10-02', type: 'expense', labelIds: ['l3'], paid: false, planned: 1500, isShared: true, isRecurring: true, createdAt: {} as any, profileId: 'p1' },
    { id: '4', description: 'Bonus', actual: 1000, date: '2023-10-10', type: 'income', labelIds: [], paid: true, planned: 1000, isShared: false, isRecurring: false, createdAt: {} as any, profileId: 'p1' },
];

const mockLabels: Label[] = [
    { id: 'l1', name: 'Work', color: 'blue', status: 'active', profileId: 'p1', createdAt: {} as any },
    { id: 'l2', name: 'Food', color: 'green', status: 'active', profileId: 'p1', createdAt: {} as any },
    { id: 'l3', name: 'Housing', color: 'red', status: 'active', profileId: 'p1', createdAt: {} as any },
];

describe('filterTransactions', () => {
    it('should filter by search term', () => {
        const result = filterTransactions(mockTransactions, { searchTerm: 'sal' });
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('1');
    });

    it('should filter by min amount', () => {
        const result = filterTransactions(mockTransactions, { minAmount: 1000 });
        expect(result).toHaveLength(3); // Salary, Rent, Bonus
    });

    it('should filter by max amount', () => {
        const result = filterTransactions(mockTransactions, { maxAmount: 500 });
        expect(result).toHaveLength(1); // Groceries
    });

    it('should filter by date range', () => {
        const result = filterTransactions(mockTransactions, { startDate: '2023-10-02', endDate: '2023-10-05' });
        expect(result).toHaveLength(2); // Rent, Groceries
    });

    it('should filter by labels', () => {
        const result = filterTransactions(mockTransactions, { labelIds: ['l2'] });
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('2');
    });

    it('should return all if no filters', () => {
        const result = filterTransactions(mockTransactions, {});
        expect(result).toHaveLength(4);
    });
});

describe('sortTransactions', () => {
    it('should sort by amount ascending', () => {
        const result = sortTransactions(mockTransactions, { key: 'actual', direction: 'ascending' }, mockLabels);
        expect(result.map(t => t.actual)).toEqual([200, 1000, 1500, 5000]);
    });

    it('should sort by amount descending', () => {
        const result = sortTransactions(mockTransactions, { key: 'actual', direction: 'descending' }, mockLabels);
        expect(result.map(t => t.actual)).toEqual([5000, 1500, 1000, 200]);
    });

    it('should sort by date ascending', () => {
        const result = sortTransactions(mockTransactions, { key: 'date', direction: 'ascending' }, mockLabels);
        expect(result.map(t => t.date)).toEqual(['2023-10-01', '2023-10-02', '2023-10-05', '2023-10-10']);
    });

    it('should sort by label name ascending', () => {
        // Labels: Food (l2), Housing (l3), Work (l1). No label (Bonus).
        // Expected: No label (Bonus), Food (Groceries), Housing (Rent), Work (Salary)
        // Logic: nulls last in ascending? Let's check implementation.
        // Implementation: if aLabel === null return 1 (so nulls last).
        const result = sortTransactions(mockTransactions, { key: 'labelIds', direction: 'ascending' }, mockLabels);
        const descriptions = result.map(t => t.description);
        // Food < Housing < Work. Bonus is null.
        expect(descriptions).toEqual(['Groceries', 'Rent', 'Salary', 'Bonus']);
    });
});
