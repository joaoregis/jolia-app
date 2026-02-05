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
    orderBy: vi.fn(),
    doc: vi.fn(),
    getDocs: vi.fn(),
    setDoc: vi.fn()
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

        (firestore.onSnapshot as any).mockImplementation((_ref: any, callback: any) => {
            // Check if it's the metadata doc (ref is usually undefined/mocked object in this simple mock, but we can check calls or just invoke)
            // The hook calls onSnapshot(statsRef, ...) then getDocs(q) if empty.

            // Simulating metadata MISSING (to test self-healing which uses the old logic path)
            const docSnapMock = {
                exists: () => false,
                data: () => ({})
            };
            callback(docSnapMock);
            return () => { };
        });

        // Mock getDocs to return the transactions for self-healing
        (firestore.getDocs as any).mockResolvedValue({
            docs: mockTransactions.map(t => ({
                data: () => t
            }))
        });

        // Mock metadataLogic dynamic import (conceptually, or let it run if it's pure logic)
        // Since we are not mocking the dynamic import, ensure the logic works.
        // metadataLogic uses db. setDoc. We need setDoc mocked too if it writes.
        // But the hook catches errors.

        // Wait, onSnapshot is called for metadata.
        // If we want to test the "happy path" (metadata exists), we can just return exists: true.
        // The existing test checks if it fetches from transactions. 
        // So we SHOULD simulate missing metadata to trigger the "fetch from transactions" logic which the test expects.


        const { result } = renderHook(() => useAvailableMonths('p1'));

        await waitFor(() => {
            expect(result.current.availableMonths).toHaveLength(2);
        });

        expect(result.current.availableMonths).toContain('2023-01');
        expect(result.current.availableMonths).toContain('2023-02');
    });
});
