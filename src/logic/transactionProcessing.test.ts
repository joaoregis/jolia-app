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
        const result = sortTransactions(mockTransactions, { key: 'labelIds', direction: 'ascending' }, mockLabels);
        const descriptions = result.map(t => t.description);
        expect(descriptions).toEqual(['Groceries', 'Rent', 'Salary', 'Bonus']);
    });

    it('should sort by due date ascending', () => {
        const transactionsWithDueDates: Transaction[] = [
            { ...mockTransactions[0], dueDate: '2023-10-15' },
            { ...mockTransactions[1], dueDate: '2023-10-05' },
            { ...mockTransactions[2], dueDate: undefined }, // Income or missing
        ];
        const result = sortTransactions(transactionsWithDueDates, { key: 'dueDate', direction: 'ascending' }, mockLabels);
        // Expect: 2023-10-05, 2023-10-15, undefined (last)
        expect(result.map(t => t.id)).toEqual(['2', '1', '3']);
    });

    it('should sort by payment date ascending', () => {
        const transactionsWithPaymentDates: Transaction[] = [
            { ...mockTransactions[0], paymentDate: '2023-10-20' },
            { ...mockTransactions[1], paymentDate: undefined }, // Unpaid
            { ...mockTransactions[2], paymentDate: '2023-10-10' },
        ];
        const result = sortTransactions(transactionsWithPaymentDates, { key: 'paymentDate', direction: 'ascending' }, mockLabels);
        // Expect: 2023-10-10, 2023-10-20, undefined (last)
        expect(result.map(t => t.id)).toEqual(['3', '1', '2']);
    });
});
