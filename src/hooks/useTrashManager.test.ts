// src/hooks/useTrashManager.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useTrashManager } from './useTrashManager';
import { createMockProfile, createMockSubprofile } from '../test-utils/testDataFactories';
import * as firestore from 'firebase/firestore';

// Mock Firebase
vi.mock('firebase/firestore', () => ({
    collection: vi.fn(),
    onSnapshot: vi.fn(),
    updateDoc: vi.fn(),
    doc: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    getDocs: vi.fn(),
    writeBatch: vi.fn()
}));

vi.mock('../lib/firebase', () => ({
    db: {}
}));

describe('useTrashManager', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Setup default onSnapshot mock
        vi.mocked(firestore.onSnapshot).mockImplementation((_query: any, callback: any) => {
            callback({ docs: [] });
            return vi.fn();
        });
    });

    it('should initialize with empty state', async () => {
        const { result } = renderHook(() => useTrashManager());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.profiles).toEqual([]);
        expect(result.current.archivedProfiles).toEqual([]);
        expect(result.current.archivedSubprofiles).toEqual([]);
    });

    it('should filter archived profiles', async () => {
        const activeProfile = createMockProfile({ id: 'p1', status: 'active', name: 'Active' });
        const archivedProfile = createMockProfile({ id: 'p2', status: 'archived', name: 'Archived' });

        vi.mocked(firestore.onSnapshot).mockImplementation((_query: any, callback: any) => {
            callback({
                docs: [
                    { id: 'p1', data: () => activeProfile },
                    { id: 'p2', data: () => archivedProfile }
                ]
            });
            return vi.fn();
        });

        const { result } = renderHook(() => useTrashManager());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.archivedProfiles).toHaveLength(1);
        expect(result.current.archivedProfiles[0].name).toBe('Archived');
    });

    it('should filter archived subprofiles from all profiles', async () => {
        const profile = createMockProfile({
            id: 'p1',
            name: 'Test Profile',
            subprofiles: [
                createMockSubprofile({ id: 's1', name: 'Active Sub', status: 'active' }),
                createMockSubprofile({ id: 's2', name: 'Archived Sub', status: 'archived' })
            ]
        });

        vi.mocked(firestore.onSnapshot).mockImplementation((_query: any, callback: any) => {
            callback({
                docs: [{ id: 'p1', data: () => profile }]
            });
            return vi.fn();
        });

        const { result } = renderHook(() => useTrashManager());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.archivedSubprofiles).toHaveLength(1);
        expect(result.current.archivedSubprofiles[0].name).toBe('Archived Sub');
        expect(result.current.archivedSubprofiles[0].parentProfileName).toBe('Test Profile');
    });

    it('should expose restoreProfile method', () => {
        const { result } = renderHook(() => useTrashManager());

        expect(result.current.restoreProfile).toBeDefined();
        expect(typeof result.current.restoreProfile).toBe('function');
    });

    it('should call updateDoc when restoring a profile', async () => {
        vi.mocked(firestore.updateDoc).mockResolvedValue(undefined);
        vi.mocked(firestore.doc).mockReturnValue({ id: 'p1' } as any);

        const { result } = renderHook(() => useTrashManager());

        await result.current.restoreProfile('p1');

        expect(firestore.updateDoc).toHaveBeenCalledWith(
            { id: 'p1' },
            { status: 'active' }
        );
    });

    it('should expose restoreSubprofile method', () => {
        const { result } = renderHook(() => useTrashManager());

        expect(result.current.restoreSubprofile).toBeDefined();
        expect(typeof result.current.restoreSubprofile).toBe('function');
    });

    it('should call updateDoc when restoring a subprofile', async () => {
        const profile = createMockProfile({
            id: 'p1',
            subprofiles: [
                createMockSubprofile({ id: 's1', status: 'archived' })
            ]
        });

        vi.mocked(firestore.onSnapshot).mockImplementation((_query: any, callback: any) => {
            callback({
                docs: [{ id: 'p1', data: () => profile }]
            });
            return vi.fn();
        });
        vi.mocked(firestore.updateDoc).mockResolvedValue(undefined);
        vi.mocked(firestore.doc).mockReturnValue({ id: 'p1' } as any);

        const { result } = renderHook(() => useTrashManager());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        await result.current.restoreSubprofile('p1', 's1');

        expect(firestore.updateDoc).toHaveBeenCalled();
    });

    it('should expose permanentlyDeleteProfile method', () => {
        const { result } = renderHook(() => useTrashManager());

        expect(result.current.permanentlyDeleteProfile).toBeDefined();
        expect(typeof result.current.permanentlyDeleteProfile).toBe('function');
    });

    it('should use batch operations when permanently deleting a profile', async () => {
        const batch = {
            delete: vi.fn(),
            commit: vi.fn().mockResolvedValue(undefined)
        };

        vi.mocked(firestore.writeBatch).mockReturnValue(batch as any);
        vi.mocked(firestore.getDocs).mockResolvedValue({ forEach: (_callback: any) => { } } as any);
        vi.mocked(firestore.query).mockReturnValue({} as any);
        vi.mocked(firestore.collection).mockReturnValue({} as any);
        vi.mocked(firestore.where).mockReturnValue({} as any);
        vi.mocked(firestore.doc).mockReturnValue({ id: 'p1' } as any);

        const { result } = renderHook(() => useTrashManager());

        await result.current.permanentlyDeleteProfile('p1');

        expect(firestore.writeBatch).toHaveBeenCalled();
        expect(batch.commit).toHaveBeenCalled();
    });

    it('should expose permanentlyDeleteSubprofile method', () => {
        const { result } = renderHook(() => useTrashManager());

        expect(result.current.permanentlyDeleteSubprofile).toBeDefined();
        expect(typeof result.current.permanentlyDeleteSubprofile).toBe('function');
    });
});
