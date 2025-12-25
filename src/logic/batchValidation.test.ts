import { describe, it, expect } from 'vitest';
import { validateBatchSelection } from './batchValidation';
import { Transaction } from '../types';

describe('validateBatchSelection', () => {
    const validTransaction: Transaction = {
        id: '1',
        description: 'Valid',
        type: 'expense',
        planned: 100,
        actual: 100,
        date: '2023-01-01',
        profileId: 'p1',
        isApportioned: false,
    };

    const apportionedTransaction: Transaction = {
        ...validTransaction,
        id: '2',
        isApportioned: true,
    };

    const installmentTransaction: Transaction = {
        ...validTransaction,
        id: '3',
        seriesId: 'series1',
    };

    it('should return valid if all transactions are valid', () => {
        const result = validateBatchSelection([validTransaction, { ...validTransaction, id: '1b' }]);
        expect(result.valid).toBe(true);
        expect(result.message).toBeUndefined();
    });

    it('should return invalid if contains apportioned transaction', () => {
        const result = validateBatchSelection([validTransaction, apportionedTransaction]);
        expect(result.valid).toBe(false);
        expect(result.message).toContain('transações de rateio');
    });

    it('should return invalid if contains installment transaction', () => {
        const result = validateBatchSelection([validTransaction, installmentTransaction]);
        expect(result.valid).toBe(false);
        expect(result.message).toContain('transações parceladas');
    });

    it('should return invalid with multiple reasons if mixed invalid types', () => {
        const result = validateBatchSelection([apportionedTransaction, installmentTransaction]);
        expect(result.valid).toBe(false);
        expect(result.message).toContain('transações de rateio');
        expect(result.message).toContain('transações parceladas');
    });
});
