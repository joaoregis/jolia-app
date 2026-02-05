import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTransactionMutations } from './useTransactionMutations';
import { Profile, Transaction } from '../types';
import * as firestore from 'firebase/firestore';
import { db } from '../lib/firebase';

// Mock Firebase
vi.mock('../lib/firebase', () => ({
    db: {}
}));

vi.mock('firebase/firestore', () => {
    const batch = {
        set: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        commit: vi.fn().mockResolvedValue(undefined)
    };
    return {
        writeBatch: vi.fn(() => batch),
        doc: vi.fn((_, path, id) => ({ id: id || 'new-id', path: path || 'path' })),
        collection: vi.fn(),
        serverTimestamp: vi.fn(),
        deleteField: vi.fn(),
        getDoc: vi.fn(),
        getDocs: vi.fn().mockResolvedValue({ docs: [], forEach: vi.fn() }),
        query: vi.fn(),
        where: vi.fn(),
        orderBy: vi.fn(),
        updateDoc: vi.fn(),
        addDoc: vi.fn(),
    };
});

vi.mock('../logic/metadataLogic', () => ({
    registerMonthInStats: vi.fn(),
    regenerateAvailableMonths: vi.fn().mockResolvedValue([])
}));

describe('useTransactionMutations', () => {
    const mockProfile: Profile = {
        id: 'p1',
        name: 'Test Profile',
        icon: '👤',
        status: 'active',
        subprofiles: []
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should create a simple transaction', async () => {
        const { result } = renderHook(() => useTransactionMutations(mockProfile));

        const formData: any = {
            description: 'New Transaction',
            amount: 100,
            date: '2023-01-01',
            type: 'expense'
        };

        await act(async () => {
            await result.current.handleSaveTransaction(formData);
        });

        const batch = firestore.writeBatch(db);
        expect(batch.set).toHaveBeenCalled();
        expect(batch.commit).toHaveBeenCalled();
    });

    it('should update an existing transaction', async () => {
        const { result } = renderHook(() => useTransactionMutations(mockProfile));

        // Mock getDoc to return existing transaction
        (firestore.getDoc as any).mockResolvedValue({
            exists: () => true,
            id: 't1',
            data: () => ({
                description: 'Old',
                date: '2023-01-01'
            })
        });

        const formData: any = {
            description: 'Updated',
            date: '2023-01-01',
            type: 'expense'
        };

        await act(async () => {
            await result.current.handleSaveTransaction(formData, 't1');
        });

        const batch = firestore.writeBatch(db);
        expect(batch.update).toHaveBeenCalled();
        expect(batch.commit).toHaveBeenCalled();
    });

    it('should handle skip transaction', async () => {
        const { result } = renderHook(() => useTransactionMutations(mockProfile));

        const transaction: Transaction = {
            id: 't1',
            description: 'Recurring',
            date: '2023-01-01',
            type: 'expense',
            planned: 100,
            actual: 100,
            profileId: 'p1',
            isRecurring: true
        };

        await act(async () => {
            await result.current.handleSkipTransaction(transaction, '2023-01');
        });

        const batch = firestore.writeBatch(db);
        // Should update current transaction (skippedInMonths)
        expect(batch.update).toHaveBeenCalled(); // t1
        // Should create next transaction
        expect(batch.set).toHaveBeenCalled(); // next transaction
        expect(batch.commit).toHaveBeenCalled();
    });

    it('should propagate skip to children', async () => {
        const { result } = renderHook(() => useTransactionMutations(mockProfile));

        const transaction: Transaction = {
            id: 't1',
            description: 'Parent',
            date: '2023-01-01',
            type: 'expense',
            planned: 100,
            actual: 100,
            profileId: 'p1',
            isRecurring: true
        };

        // Mock getDocs finding children
        (firestore.getDocs as any).mockResolvedValue({
            docs: [
                { id: 'c1', ref: { id: 'c1', path: 'transactions/c1' }, data: () => ({ skippedInMonths: [] }) },
                { id: 'c2', ref: { id: 'c2', path: 'transactions/c2' }, data: () => ({ skippedInMonths: [] }) }
            ],
            forEach: function (opt: any) { this.docs.forEach(opt); }
        });

        await act(async () => {
            await result.current.handleSkipTransaction(transaction, '2023-01');
        });

        const batch = firestore.writeBatch(db);

        // Calls: 1 update (parent), 1 set (next parent), 2 updates (children)
        // Note: The implementation might differ in order, but checking calls is key.
        // We expect batch.update to be called for t1, c1, c2.

        const updateCalls = (batch.update as any).mock.calls;
        const idsUpdated = updateCalls.map((call: any) => call[0].id);
        console.log('IDs updated:', idsUpdated);

        expect(idsUpdated).toContain('t1'); // Parent
        expect(idsUpdated).toContain('c1'); // Child 1
        expect(idsUpdated).toContain('c2'); // Child 2
    });

    it('should handle unskip transaction', async () => {
        const { result } = renderHook(() => useTransactionMutations(mockProfile));

        const transaction: Transaction = {
            id: 't1',
            description: 'Recurring',
            date: '2023-01-01',
            type: 'expense',
            planned: 100,
            actual: 100,
            profileId: 'p1',
            isRecurring: true,
            skippedInMonths: ['2023-01'],
            generatedFutureTransactionId: 'future-t2'
        };

        await act(async () => {
            await result.current.handleUnskipTransaction(transaction, '2023-01');
        });

        const batch = firestore.writeBatch(db);
        // Should delete future transaction
        expect(batch.delete).toHaveBeenCalled();
        // Should update current transaction (remove from skippedInMonths)
        expect(batch.update).toHaveBeenCalled();
        expect(batch.commit).toHaveBeenCalled();
    });

    it('should propagate unskip to children', async () => {
        const { result } = renderHook(() => useTransactionMutations(mockProfile));

        const transaction: Transaction = {
            id: 't1',
            description: 'Parent',
            date: '2023-01-01',
            type: 'expense',
            planned: 100,
            actual: 100,
            profileId: 'p1',
            isRecurring: true,
            skippedInMonths: ['2023-01'],
        };

        // Mock getDocs finding children
        (firestore.getDocs as any).mockResolvedValue({
            docs: [
                { id: 'c1', ref: { id: 'c1', path: 'transactions/c1' }, data: () => ({ skippedInMonths: ['2023-01'] }) },
            ],
            forEach: function (opt: any) { this.docs.forEach(opt); }
        });

        await act(async () => {
            await result.current.handleUnskipTransaction(transaction, '2023-01');
        });

        const batch = firestore.writeBatch(db);
        const updateCalls = (batch.update as any).mock.calls;
        const idsUpdated = updateCalls.map((call: any) => call[0].id);

        expect(idsUpdated).toContain('t1'); // Parent
        expect(idsUpdated).toContain('c1'); // Child
    });

    it('should create apportioned children when saving shared transaction with percentage mode', async () => {
        const profileWithPercentages: Profile = {
            ...mockProfile,
            apportionmentMethod: 'percentage',
            subprofileApportionmentPercentages: { 's1': 40, 's2': 60 },
            subprofiles: [{ id: 's1', name: 'S1', status: 'active' }, { id: 's2', name: 'S2', status: 'active' }]
        };

        const { result } = renderHook(() => useTransactionMutations(profileWithPercentages));

        const formData: any = {
            description: 'Shared Cost',
            planned: 100,
            actual: 100,
            date: '2023-01-01',
            type: 'expense',
            isShared: true
        };

        const proportions = new Map<string, number>();
        proportions.set('s1', 0.4);
        proportions.set('s2', 0.6);

        await act(async () => {
            await result.current.handleSaveTransaction(formData, undefined, proportions);
        });

        const batch = firestore.writeBatch(db);
        // 1 call for parent, 2 calls for children (metadata update is mocked)
        expect(batch.set).toHaveBeenCalledTimes(3);
        expect(batch.commit).toHaveBeenCalled();
    });
});
