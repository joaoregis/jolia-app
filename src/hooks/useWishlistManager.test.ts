// src/hooks/useWishlistManager.test.ts
/**
 * Simplified tests for useWishlistManager
 * Focus on testing the hook's API and basic functionality
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWishlistManager } from './useWishlistManager';

// Mock Firebase with simpler approach
vi.mock('firebase/firestore', () => ({
    collection: vi.fn(),
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

describe('useWishlistManager', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should initialize with empty state when no profileId', () => {
        const { result } = renderHook(() => useWishlistManager(undefined, 'geral'));

        expect(result.current.wishlists).toEqual([]);
        expect(result.current.loading).toBe(false);
    });

    it('should expose wishlist CRUD methods', () => {
        const { result } = renderHook(() => useWishlistManager('p1', 'geral'));

        expect(typeof result.current.addWishlist).toBe('function');
        expect(typeof result.current.updateWishlist).toBe('function');
        expect(typeof result.current.deleteWishlist).toBe('function');
    });

    it('should expose wishlist item CRUD methods', () => {
        const { result } = renderHook(() => useWishlistManager('p1', 'geral'));

        expect(typeof result.current.addWishlistItem).toBe('function');
        expect(typeof result.current.updateWishlistItem).toBe('function');
        expect(typeof result.current.toggleItemDone).toBe('function');
        expect(typeof result.current.deleteWishlistItem).toBe('function');
    });

    it('should call addDoc when adding wishlist', async () => {
        const { addDoc } = await import('firebase/firestore');
        const { result } = renderHook(() => useWishlistManager('p1', 'geral'));

        await act(async () => {
            await result.current.addWishlist('New List');
        });

        expect(addDoc).toHaveBeenCalled();
    });

    it('should call updateDoc when updating wishlist', async () => {
        const { updateDoc } = await import('firebase/firestore');
        const { result } = renderHook(() => useWishlistManager('p1', 'geral'));

        await act(async () => {
            await result.current.updateWishlist('w1', 'Updated');
        });

        expect(updateDoc).toHaveBeenCalled();
    });

    it('should call writeBatch when deleting wishlist', async () => {
        const { writeBatch } = await import('firebase/firestore');
        const { result } = renderHook(() => useWishlistManager('p1', 'geral'));

        await act(async () => {
            await result.current.deleteWishlist('w1');
        });

        expect(writeBatch).toHaveBeenCalled();
    });

    it('should call addDoc when adding wishlist item', async () => {
        const { addDoc } = await import('firebase/firestore');
        const { result } = renderHook(() => useWishlistManager('p1', 'geral'));

        const itemData = { title: 'Item', description: 'Desc', budget: 100 };

        await act(async () => {
            await result.current.addWishlistItem('w1', itemData);
        });

        expect(addDoc).toHaveBeenCalled();
    });

    it('should call updateDoc when updating item', async () => {
        const { updateDoc } = await import('firebase/firestore');
        const { result } = renderHook(() => useWishlistManager('p1', 'geral'));

        const itemData = { title: 'Updated', description: '', budget: 50 };

        await act(async () => {
            await result.current.updateWishlistItem('w1', 'item1', itemData);
        });

        expect(updateDoc).toHaveBeenCalled();
    });

    it('should call updateDoc when toggling item done status', async () => {
        const { updateDoc } = await import('firebase/firestore');
        const { result } = renderHook(() => useWishlistManager('p1', 'geral'));

        const item = {
            id: 'item1',
            title: 'Test',
            isDone: false,
            createdAt: { seconds: 0, nanoseconds: 0 }
        };

        await act(async () => {
            await result.current.toggleItemDone('w1', item);
        });

        expect(updateDoc).toHaveBeenCalled();
    });

    it('should call deleteDoc when deleting item', async () => {
        const { deleteDoc } = await import('firebase/firestore');
        const { result } = renderHook(() => useWishlistManager('p1', 'geral'));

        await act(async () => {
            await result.current.deleteWishlistItem('w1', 'item1');
        });

        expect(deleteDoc).toHaveBeenCalled();
    });
});
