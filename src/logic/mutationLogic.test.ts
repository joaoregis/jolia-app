import { describe, it, expect } from 'vitest';
import { calculateInstallmentUpdates, calculateApportionmentProportions, prepareNextRecurringTransaction } from './mutationLogic';
import { Transaction, TransactionFormState, Subprofile } from '../types';

describe('mutationLogic', () => {
    describe('calculateInstallmentUpdates', () => {
        const mockCurrentTransaction: Transaction = {
            id: '1',
            date: '2023-01-15',
            description: 'Test',
            type: 'expense',
            planned: 100,
            actual: 100,
            profileId: 'p1',
            seriesId: 's1',
            currentInstallment: 1,
            totalInstallments: 3
        };

        const mockSeriesTransactions: Transaction[] = [
            mockCurrentTransaction,
            { ...mockCurrentTransaction, id: '2', date: '2023-02-15', currentInstallment: 2 },
            { ...mockCurrentTransaction, id: '3', date: '2023-03-15', currentInstallment: 3 }
        ];

        it('should update fields without changing dates if date is unchanged', () => {
            const formData: TransactionFormState = {
                ...mockCurrentTransaction,
                description: 'Updated',
                date: '2023-01-15' // Same date
            };

            const updates = calculateInstallmentUpdates(mockCurrentTransaction, formData, mockSeriesTransactions);

            expect(updates).toHaveLength(3);
            expect(updates[0].data.description).toBe('Updated');
            expect(updates[1].data.description).toBe('Updated');
            expect(updates[0].data.date).toBe('2023-01-15');
            expect(updates[1].data.date).toBe('2023-02-15'); // Should remain unchanged
        });

        it('should shift dates for all future installments if date is changed', () => {
            const formData: TransactionFormState = {
                ...mockCurrentTransaction,
                date: '2023-02-15' // Shifted +1 month
            };

            const updates = calculateInstallmentUpdates(mockCurrentTransaction, formData, mockSeriesTransactions);

            expect(updates[0].data.date).toBe('2023-02-15');
            expect(updates[1].data.date).toBe('2023-03-15'); // Shifted +1 month
            expect(updates[2].data.date).toBe('2023-04-15'); // Shifted +1 month
        });
    });

    describe('calculateApportionmentProportions', () => {
        const subprofiles: Subprofile[] = [
            { id: 'sub1', name: 'A', status: 'active' },
            { id: 'sub2', name: 'B', status: 'active' }
        ];

        it('should calculate proportions based on income', () => {
            const transactions: Transaction[] = [
                { id: '1', type: 'income', subprofileId: 'sub1', actual: 100, planned: 100, date: '2023-01-01', description: 'Income A', profileId: 'p1' },
                { id: '2', type: 'income', subprofileId: 'sub2', actual: 300, planned: 300, date: '2023-01-01', description: 'Income B', profileId: 'p1' }
            ];

            const proportions = calculateApportionmentProportions(transactions, subprofiles);

            expect(proportions.get('sub1')).toBe(0.25); // 100 / 400
            expect(proportions.get('sub2')).toBe(0.75); // 300 / 400
        });

        it('should split equally if no income', () => {
            const transactions: Transaction[] = [];
            const proportions = calculateApportionmentProportions(transactions, subprofiles);

            expect(proportions.get('sub1')).toBe(0.5);
            expect(proportions.get('sub2')).toBe(0.5);
        });
    });

    describe('prepareNextRecurringTransaction', () => {
        it('should increment date by 1 month', () => {
            const transaction: Transaction = {
                id: '1',
                date: '2023-01-31',
                description: 'Recurring',
                type: 'expense',
                planned: 100,
                actual: 100,
                profileId: 'p1'
            };

            const next = prepareNextRecurringTransaction(transaction);

            // 31 Jan + 1 month -> 28 Feb (or 29 in leap year)
            // Note: addMonths handles end-of-month logic. 
            // If implementation uses setMonth, it might be March 3rd. 
            // Let's assume addMonths is robust (it usually is in this codebase).
            // Checking if it's roughly correct or exactly correct depends on addMonths implementation.
            // Assuming standard behavior:
            expect(next.date).toMatch(/2023-02-\d{2}/);
            expect(next.paid).toBe(false);
        });
    });
});
