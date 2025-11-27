import { describe, it, expect, vi } from 'vitest';
import { prepareMonthClosingUpdates } from './monthClosingLogic';
import { Transaction, Profile } from '../types';

// Mock serverTimestamp to return a string or null for testing
vi.mock('firebase/firestore', () => ({
    serverTimestamp: () => 'MOCK_TIMESTAMP'
}));

vi.stubGlobal('crypto', {
    randomUUID: () => 'mock-uuid-' + Math.random().toString(36).substr(2, 9)
});

describe('prepareMonthClosingUpdates', () => {
    const mockProfile: Profile = {
        id: 'p1',
        name: 'Test Profile',
        icon: 'user',
        status: 'active',

        subprofiles: [
            { id: 'sub1', name: 'Sub 1', status: 'active' },
            { id: 'sub2', name: 'Sub 2', status: 'active' }
        ],
        apportionmentMethod: 'proportional',
        closedMonths: []
    };

    const mockProportions = new Map<string, number>([
        ['sub1', 0.6],
        ['sub2', 0.4]
    ]);

    const baseTransaction: Transaction = {
        id: 't1',
        profileId: 'p1',
        description: 'Test Transaction',

        planned: 100,
        actual: 100,
        date: '2023-10-15',
        type: 'expense',
        paid: true,
        isRecurring: true,
        createdAt: '2023-10-01' as any
    };

    it('should generate next month transaction for a simple recurring expense', () => {
        const transactions = [baseTransaction];
        const result = prepareMonthClosingUpdates(transactions, '2023-10', mockProfile, mockProportions);

        expect(result).toHaveLength(1);
        expect(result[0].type).toBe('parent');
        expect(result[0].data.date).toBe('2023-11-15'); // Next month
        expect(result[0].data.paid).toBe(false);
    });

    it('should NOT generate transaction if already skipped', () => {
        const skippedTransaction = { ...baseTransaction, skippedInMonths: ['2023-10'] };
        const result = prepareMonthClosingUpdates([skippedTransaction], '2023-10', mockProfile, mockProportions);
        expect(result).toHaveLength(0);
    });

    it('should generate parent AND children for Shared Proportional expense', () => {
        const sharedTransaction: Transaction = {
            ...baseTransaction,
            isShared: true
        };

        const result = prepareMonthClosingUpdates([sharedTransaction], '2023-10', mockProfile, mockProportions);

        // Should have 1 parent + 2 children (sub1, sub2)
        expect(result).toHaveLength(3);

        const parent = result.find(r => r.type === 'parent');
        const children = result.filter(r => r.type === 'child');

        expect(parent).toBeDefined();
        expect(children).toHaveLength(2);

        // Verify children linkage
        children.forEach(child => {
            expect(child.parentId).toBe(parent!.data._tempId);
            expect(child.data.parentId).toBe(parent!.data._tempId);
            expect(child.data.isApportioned).toBe(true);
            expect(child.data.isShared).toBe(false);
        });

        // Verify proportions
        const sub1Child = children.find(c => c.data.subprofileId === 'sub1');
        const sub2Child = children.find(c => c.data.subprofileId === 'sub2');

        expect(sub1Child!.data.planned).toBe(60); // 100 * 0.6
        expect(sub2Child!.data.planned).toBe(40); // 100 * 0.4
    });

    it('should NOT recur apportioned children directly', () => {
        const childTransaction: Transaction = {
            ...baseTransaction,
            isApportioned: true,
            parentId: 'some-parent',
            subprofileId: 'sub1'
        };

        const result = prepareMonthClosingUpdates([childTransaction], '2023-10', mockProfile, mockProportions);
        expect(result).toHaveLength(0);
    });

    it('should handle non-proportional profile correctly (no children generated)', () => {
        const equalProfile = { ...mockProfile, apportionmentMethod: 'manual' as const };
        const sharedTransaction: Transaction = {
            ...baseTransaction,
            isShared: true
        };

        const result = prepareMonthClosingUpdates([sharedTransaction], '2023-10', equalProfile, mockProportions);

        expect(result).toHaveLength(1);
        expect(result[0].type).toBe('parent');
    });
});
