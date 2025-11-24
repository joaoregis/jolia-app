import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAvailableMonths } from './useAvailableMonths';
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

describe('useAvailableMonths', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should fetch available months from transactions', async () => {
        const mockTransactions = [
            { id: 't1', date: '2023-01-01', profileId: 'p1' },
            { id: 't2', date: '2023-02-15', profileId: 'p1' },
            { id: 't3', date: '2023-01-20', profileId: 'p1' } // Duplicate month
        ];

        (firestore.onSnapshot as any).mockImplementation((_query: any, callback: any) => {
            console.log('onSnapshot called');
            const docs = mockTransactions.map(t => ({
                id: t.id,
                data: () => t
            }));
            const snapshot = {
                docs,
                forEach: (fn: any) => {
                    console.log('forEach called');
                    docs.forEach(fn);
                }
            };
            console.log('Calling callback with snapshot:', snapshot);
            callback(snapshot);
            return () => { };
        });

        const { result } = renderHook(() => useAvailableMonths('p1'));

        await waitFor(() => {
            expect(result.current.availableMonths).toHaveLength(2);
        });

        expect(result.current.availableMonths).toContain('2023-01');
        expect(result.current.availableMonths).toContain('2023-02');
    });
});
