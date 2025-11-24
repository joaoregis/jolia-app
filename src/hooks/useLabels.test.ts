import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useLabels } from './useLabels';
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

describe('useLabels', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should fetch labels for profile', async () => {
        const mockLabels = [
            { id: 'l1', name: 'Label 1', profileId: 'p1' },
            { id: 'l2', name: 'Label 2', profileId: 'p1' }
        ];

        (firestore.onSnapshot as any).mockImplementation((_query: any, callback: any) => {
            callback({
                docs: mockLabels.map(l => ({
                    id: l.id,
                    data: () => l
                }))
            });
            return () => { };
        });

        const { result } = renderHook(() => useLabels('p1'));

        await waitFor(() => {
            expect(result.current.labels).toHaveLength(2);
        });

        expect(result.current.labels).toHaveLength(2);
    });

    it('should return empty array if no profileId', () => {
        const { result } = renderHook(() => useLabels(undefined));
        expect(result.current.labels).toEqual([]);
    });
});
