import { describe, it, expect } from 'vitest';
import { addMonths, formatCurrency, formatShortDate, formatFullDate } from './utils';

describe('addMonths', () => {
    it('should add months correctly', () => {
        const date = new Date('2023-01-15T00:00:00');
        const result = addMonths(date, 1);
        expect(result.toISOString().split('T')[0]).toBe('2023-02-15');
    });

    it('should handle end of month correctly (Jan 31 + 1 month = Feb 28)', () => {
        const date = new Date('2023-01-31T00:00:00');
        const result = addMonths(date, 1);
        expect(result.toISOString().split('T')[0]).toBe('2023-02-28');
    });

    it('should handle leap year (Jan 31 2024 + 1 month = Feb 29)', () => {
        const date = new Date('2024-01-31T00:00:00');
        const result = addMonths(date, 1);
        expect(result.toISOString().split('T')[0]).toBe('2024-02-29');
    });

    it('should handle year rollover (Dec 15 + 1 month = Jan 15 next year)', () => {
        const date = new Date('2023-12-15T00:00:00');
        const result = addMonths(date, 1);
        expect(result.toISOString().split('T')[0]).toBe('2024-01-15');
    });
});

describe('formatCurrency', () => {
    it('should format currency correctly', () => {
        const result = formatCurrency(1234.56);
        // Matches "R$ 1.234,56" allowing for different space characters (nbsp vs space)
        expect(result.replace(/\s/g, ' ')).toMatch(/R\$\s1\.234,56/);
    });
});

describe('formatShortDate', () => {
    it('should format short date correctly', () => {
        expect(formatShortDate('2023-10-25')).toBe('25/10');
    });
    it('should return - for undefined', () => {
        expect(formatShortDate(undefined)).toBe('-');
    });
});

describe('formatFullDate', () => {
    it('should format full date correctly', () => {
        expect(formatFullDate('2023-10-25')).toBe('25/10/2023');
    });
});
