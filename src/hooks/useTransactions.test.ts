import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useTransactions } from './useTransactions';
import * as firestore from 'firebase/firestore';

vi.mock('../lib/firebase', () => ({
    db: {}
}));

vi.mock('firebase/firestore', () => ({
    collection: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    onSnapshot: vi.fn(),
    orderBy: vi.fn()
}));

describe('useTransactions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should fetch transactions for month range', async () => {
        const mockTransactions = [
            { id: 't1', description: 'T1', date: '2023-01-01', profileId: 'p1' },
            { id: 't2', description: 'T2', date: '2023-01-15', profileId: 'p1' }
        ];

        (firestore.onSnapshot as any).mockImplementation((_query: any, callback: any) => {
            callback({
                docs: mockTransactions.map(t => ({
                    id: t.id,
                    data: () => t
                }))
            });
            return () => { };
        });

        const date = new Date('2023-01-01T12:00:00');
        const { result } = renderHook(() => useTransactions('p1', date));

        await waitFor(() => {
            expect(result.current.transactions).toHaveLength(2);
        });

        expect(result.current.transactions[0]).toEqual(mockTransactions[0]);
    });

    it('should return empty if no profileId', () => {
        const date = new Date('2023-01-01T12:00:00');
        const { result } = renderHook(() => useTransactions(undefined, date));
        expect(result.current.transactions).toEqual([]);
    });
});
