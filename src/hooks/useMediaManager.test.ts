// src/hooks/useMediaManager.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMediaManager } from './useMediaManager';

// Mock Firebase
vi.mock('firebase/firestore', () => ({
    collection: vi.fn().mockReturnValue({}),
    onSnapshot: vi.fn(() => vi.fn()), // Return unsubscribe
    addDoc: vi.fn().mockResolvedValue({ id: 'new-id' }),
    updateDoc: vi.fn().mockResolvedValue(undefined),
    deleteDoc: vi.fn().mockResolvedValue(undefined),
    doc: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    orderBy: vi.fn(),
    serverTimestamp: vi.fn(() => ({ __type: 'timestamp' })),
    writeBatch: vi.fn(() => ({
        delete: vi.fn(),
        commit: vi.fn().mockResolvedValue(undefined)
    }))
}));

vi.mock('../lib/firebase', () => ({
    db: {}
}));

describe('useMediaManager', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should initialize with empty state when no profileId', () => {
        const { result } = renderHook(() => useMediaManager(undefined));

        expect(result.current.mediaItems).toEqual([]);
        expect(result.current.loading).toBe(false);
    });

    it('should expose CRUD methods', () => {
        const { result } = renderHook(() => useMediaManager('p1'));

        expect(typeof result.current.addMedia).toBe('function');
        expect(typeof result.current.updateMedia).toBe('function');
        expect(typeof result.current.deleteMedia).toBe('function');
        expect(typeof result.current.updateStatus).toBe('function');
    });

    it('should call addDoc when adding media', async () => {
        const { addDoc } = await import('firebase/firestore');
        const { result } = renderHook(() => useMediaManager('p1'));

        const mediaData = {
            title: 'Movie',
            type: 'movie' as const,
            provider: 'Netflix' as const,
            suggestedBy: 'sub1',
            status: 'to_watch' as const
        };

        await act(async () => {
            await result.current.addMedia(mediaData);
        });

        expect(addDoc).toHaveBeenCalled();
    });

    it('should add a series with episode tracking', async () => {
        const { addDoc } = await import('firebase/firestore');
        const { result } = renderHook(() => useMediaManager('profile1'));

        const newSeries = {
            title: 'Breaking Bad',
            type: 'series' as const,
            provider: 'Netflix' as const,
            suggestedBy: 'sub1',
            currentSeason: 1,
            currentEpisode: 1,
            totalSeasons: 5,
            status: 'to_watch' as const
        };

        await act(async () => {
            await result.current.addMedia(newSeries);
        });

        expect(addDoc).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({
                ...newSeries,
                profileId: 'profile1',
                createdAt: expect.anything()
            })
        );
    });

    it('should call updateDoc when updating media', async () => {
        const { updateDoc } = await import('firebase/firestore');
        const { result } = renderHook(() => useMediaManager('p1'));

        await act(async () => {
            await result.current.updateMedia('m1', { title: 'Updated' });
        });

        expect(updateDoc).toHaveBeenCalled();
    });

    it('should call deleteDoc when deleting media', async () => {
        const { deleteDoc } = await import('firebase/firestore');
        const { result } = renderHook(() => useMediaManager('p1'));

        await act(async () => {
            await result.current.deleteMedia('m1');
        });

        expect(deleteDoc).toHaveBeenCalled();
    });

    it('should call updateDoc when updating status', async () => {
        const { updateDoc } = await import('firebase/firestore');
        const { result } = renderHook(() => useMediaManager('p1'));

        const item: any = {
            id: 'm1',
            status: 'to_watch'
        };

        await act(async () => {
            await result.current.updateStatus(item, 'watched', { rating: 5, watchedDate: '2023-10' });
        });

        expect(updateDoc).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({
                status: 'watched',
                rating: 5,
                watchedDate: '2023-10'
            })
        );
    });
});
