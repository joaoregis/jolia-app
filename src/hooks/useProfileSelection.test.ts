// src/hooks/useProfileSelection.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useProfileSelection } from './useProfileSelection';
import { createMockProfile } from '../test-utils/testDataFactories';
import * as firestore from 'firebase/firestore';

// Mock Firebase
vi.mock('firebase/firestore', () => ({
    collection: vi.fn(),
    onSnapshot: vi.fn(),
    addDoc: vi.fn(),
    updateDoc: vi.fn(),
    doc: vi.fn()
}));

vi.mock('../lib/firebase', () => ({
    db: {},
    auth: {
        currentUser: { uid: 'test-user' },
        signOut: vi.fn()
    }
}));

describe('useProfileSelection', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Setup default onSnapshot mock
        vi.mocked(firestore.onSnapshot).mockImplementation((_query: any, callback: any) => {
            callback({ docs: [] });
            return vi.fn();
        });
    });

    it('should initialize with empty state when user is logged in', async () => {
        const { result } = renderHook(() => useProfileSelection());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.profiles).toEqual([]);
        expect(result.current.activeProfiles).toEqual([]);
        expect(result.current.user).toBeDefined();
    });

    it('should filter active profiles', async () => {
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

        const { result } = renderHook(() => useProfileSelection());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.activeProfiles).toHaveLength(1);
        expect(result.current.activeProfiles[0].name).toBe('Active');
    });

    it('should indicate when create form should be shown', async () => {
        // No active profiles = should show create form
        vi.mocked(firestore.onSnapshot).mockImplementation((_query: any, callback: any) => {
            callback({ docs: [] });
            return vi.fn();
        });

        const { result } = renderHook(() => useProfileSelection());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.shouldShowCreateForm).toBe(true);
    });

    it('should not show create form when active profiles exist', async () => {
        const activeProfile = createMockProfile({ id: 'p1', status: 'active' });

        vi.mocked(firestore.onSnapshot).mockImplementation((_query: any, callback: any) => {
            callback({
                docs: [{ id: 'p1', data: () => activeProfile }]
            });
            return vi.fn();
        });

        const { result } = renderHook(() => useProfileSelection());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.shouldShowCreateForm).toBe(false);
    });

    it('should expose createProfile method', () => {
        const { result } = renderHook(() => useProfileSelection());

        expect(result.current.createProfile).toBeDefined();
        expect(typeof result.current.createProfile).toBe('function');
    });

    it('should call addDoc when creating a profile', async () => {
        vi.mocked(firestore.addDoc).mockResolvedValue({ id: 'new-profile' } as any);
        vi.mocked(firestore.collection).mockReturnValue({} as any);

        const { result } = renderHook(() => useProfileSelection());

        await result.current.createProfile('Test Profile', '🏠');

        expect(firestore.addDoc).toHaveBeenCalledWith(
            {},
            {
                name: 'Test Profile',
                icon: '🏠',
                subprofiles: [],
                status: 'active'
            }
        );
    });

    it('should expose archiveProfile method', () => {
        const { result } = renderHook(() => useProfileSelection());

        expect(result.current.archiveProfile).toBeDefined();
        expect(typeof result.current.archiveProfile).toBe('function');
    });

    it('should call updateDoc when archiving a profile', async () => {
        vi.mocked(firestore.updateDoc).mockResolvedValue(undefined);
        vi.mocked(firestore.doc).mockReturnValue({ id: 'p1' } as any);

        const { result } = renderHook(() => useProfileSelection());

        await result.current.archiveProfile('p1');

        expect(firestore.updateDoc).toHaveBeenCalledWith(
            { id: 'p1' },
            { status: 'archived' }
        );
    });

    it('should expose logout method', () => {
        const { result } = renderHook(() => useProfileSelection());

        expect(result.current.logout).toBeDefined();
        expect(typeof result.current.logout).toBe('function');
    });
});
