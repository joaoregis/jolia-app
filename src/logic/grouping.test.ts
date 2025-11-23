import { describe, it, expect } from 'vitest';
import { groupTransactions } from './grouping';
import { Transaction, Label } from '../types';

const mockTransactions: Transaction[] = [
    { id: '1', description: 'T1', date: '2023-10-01', type: 'expense', labelIds: ['l1'], planned: 100, actual: 100, profileId: 'p1' } as unknown as Transaction,
    { id: '2', description: 'T2', date: '2023-10-01', type: 'income', labelIds: ['l2'], planned: 200, actual: 200, profileId: 'p1' } as unknown as Transaction,
    { id: '3', description: 'T3', date: '2023-10-02', type: 'expense', labelIds: [], planned: 50, actual: 50, profileId: 'p1' } as unknown as Transaction,
];

const mockLabels: Label[] = [
    { id: 'l1', name: 'Food' } as Label,
    { id: 'l2', name: 'Salary' } as Label,
];

describe('groupTransactions', () => {
    it('should return null if groupBy is none', () => {
        expect(groupTransactions(mockTransactions, 'none', mockLabels)).toBeNull();
    });

    it('should group by label', () => {
        const result = groupTransactions(mockTransactions, 'label', mockLabels);
        expect(result).toEqual({
            'Food': [mockTransactions[0]],
            'Salary': [mockTransactions[1]],
            'Sem Rótulo': [mockTransactions[2]],
        });
    });

    it('should group by date', () => {
        const result = groupTransactions(mockTransactions, 'date', mockLabels);
        expect(result).toEqual({
            '01/10/2023': [mockTransactions[0], mockTransactions[1]],
            '02/10/2023': [mockTransactions[2]],
        });
    });

    it('should group by type', () => {
        const result = groupTransactions(mockTransactions, 'type', mockLabels);
        expect(result).toEqual({
            'Despesa': [mockTransactions[0], mockTransactions[2]],
            'Receita': [mockTransactions[1]],
        });
    });
});
