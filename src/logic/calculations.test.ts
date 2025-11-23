import { describe, it, expect } from 'vitest';
import { calculateTotals, calculateBalance, calculateDiff } from './calculations';
import { Transaction } from '../types';

describe('calculateTotals', () => {
    it('should calculate totals correctly for mixed transactions', () => {
        const transactions: Transaction[] = [
            { id: '1', planned: 100, actual: 90 } as Transaction,
            { id: '2', planned: 200, actual: 210 } as Transaction,
        ];
        const result = calculateTotals(transactions);
        expect(result).toEqual({
            count: 2,
            sumPlanned: 300,
            sumActual: 300,
        });
    });

    it('should return zeros for empty list', () => {
        const result = calculateTotals([]);
        expect(result).toEqual({
            count: 0,
            sumPlanned: 0,
            sumActual: 0,
        });
    });
});

describe('calculateBalance', () => {
    it('should calculate positive balance', () => {
        expect(calculateBalance(1000, 800)).toBe(200);
    });

    it('should calculate negative balance', () => {
        expect(calculateBalance(500, 800)).toBe(-300);
    });
});

describe('calculateDiff', () => {
    it('should calculate positive diff (overspent/earned more)', () => {
        expect(calculateDiff(120, 100)).toBe(20);
    });

    it('should calculate negative diff (underspent/earned less)', () => {
        expect(calculateDiff(80, 100)).toBe(-20);
    });
});
