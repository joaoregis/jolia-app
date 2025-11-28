import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSubprofileManager } from './useSubprofileManager';
import * as firestore from 'firebase/firestore';
import { Profile } from '../types';

vi.mock('../lib/firebase', () => ({
    db: {}
}));

vi.mock('firebase/firestore', () => ({
    doc: vi.fn(),
    updateDoc: vi.fn(),
    arrayUnion: vi.fn((val) => val),
    arrayRemove: vi.fn((val) => val)
}));

describe('useSubprofileManager', () => {
    const mockProfile: Profile = {
        id: 'p1',
        name: 'Test Profile',
        icon: '👤',
        status: 'active',
        subprofiles: [
            { id: 'sub1', name: 'Sub 1', status: 'active', themeId: 'blue' }
        ],
        savedThemes: []
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should create a new subprofile', async () => {
        const { result } = renderHook(() => useSubprofileManager(mockProfile));

        await result.current.handleCreateSubprofile('New Sub', 'green');

        expect(firestore.updateDoc).toHaveBeenCalled();
        const callArgs = (firestore.updateDoc as any).mock.calls[0];
        const updatedSubprofiles = callArgs[1].subprofiles;
        expect(updatedSubprofiles).toHaveLength(2);
        expect(updatedSubprofiles[1].name).toBe('New Sub');
        expect(updatedSubprofiles[1].themeId).toBe('green');
    });

    it('should update an existing subprofile', async () => {
        const { result } = renderHook(() => useSubprofileManager(mockProfile));

        await result.current.handleUpdateSubprofile('sub1', 'Updated Name', 'red');

        expect(firestore.updateDoc).toHaveBeenCalled();
        const callArgs = (firestore.updateDoc as any).mock.calls[0];
        const updatedSubprofiles = callArgs[1].subprofiles;
        expect(updatedSubprofiles[0].name).toBe('Updated Name');
        expect(updatedSubprofiles[0].themeId).toBe('red');
    });

    it('should archive a subprofile', async () => {
        const { result } = renderHook(() => useSubprofileManager(mockProfile));

        await result.current.handleArchiveSubprofile(mockProfile.subprofiles[0]);

        expect(firestore.updateDoc).toHaveBeenCalled();
        const callArgs = (firestore.updateDoc as any).mock.calls[0];
        const updatedSubprofiles = callArgs[1].subprofiles;
        expect(updatedSubprofiles[0].status).toBe('archived');
    });

    it('should save a custom theme', async () => {
        const { result } = renderHook(() => useSubprofileManager(mockProfile));
        const themeVars = {
            '--background': '#ff0000',
            '--sidebar': '#ff0000',
            '--card': '#ff0000',
            '--table-header': '#ff0000',
            '--table-header-text': '#ff0000',
            '--table-footer': '#ff0000',
            '--table-footer-text': '#ff0000',
            '--text-primary': '#ff0000',
            '--text-secondary': '#ff0000',
            '--sidebar-text-primary': '#ff0000',
            '--sidebar-text-secondary': '#ff0000',
            '--accent': '#ff0000',
            '--accent-hover': '#ff0000',
            '--accent-selected': '#ff0000',
            '--border': '#ff0000'
        };

        await result.current.handleSaveCustomTheme('My Theme', themeVars);

        expect(firestore.updateDoc).toHaveBeenCalled();
        expect(firestore.arrayUnion).toHaveBeenCalled();
    });

    it('should delete a custom theme', async () => {
        const profileWithThemes: Profile = {
            ...mockProfile,
            savedThemes: [{
                id: 't1',
                name: 'Theme 1',
                variables: {
                    '--background': '#000',
                    '--sidebar': '#000',
                    '--card': '#000',
                    '--table-header': '#000',
                    '--table-header-text': '#000',
                    '--table-footer': '#000',
                    '--table-footer-text': '#000',
                    '--text-primary': '#000',
                    '--text-secondary': '#000',
                    '--sidebar-text-primary': '#000',
                    '--sidebar-text-secondary': '#000',
                    '--accent': '#000',
                    '--accent-hover': '#000',
                    '--accent-selected': '#000',
                    '--border': '#000'
                }
            }]
        };
        const { result } = renderHook(() => useSubprofileManager(profileWithThemes));

        await result.current.handleDeleteCustomTheme('t1');

        expect(firestore.updateDoc).toHaveBeenCalled();
        expect(firestore.arrayRemove).toHaveBeenCalled();
    });

    it('should not perform operations if profile is null', async () => {
        const { result } = renderHook(() => useSubprofileManager(null));

        await result.current.handleCreateSubprofile('Test', 'blue');
        expect(firestore.updateDoc).not.toHaveBeenCalled();
    });
});
