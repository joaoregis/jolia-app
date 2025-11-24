import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useProfile } from './useProfile';
import * as firestore from 'firebase/firestore';

// Mock Firebase
vi.mock('../lib/firebase', () => ({
    db: {}
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate
}));

vi.mock('firebase/firestore', () => ({
    doc: vi.fn(),
    onSnapshot: vi.fn(() => () => { })
}));

describe('useProfile', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return loading initially', () => {
        const { result } = renderHook(() => useProfile('p1'));
        expect(result.current.loading).toBe(true);
    });

    it('should return profile data when found', async () => {
        const mockData = { name: 'Test User', subprofiles: [] };

        (firestore.onSnapshot as any).mockImplementation((_ref: any, callback: any) => {
            callback({
                exists: () => true,
                id: 'p1',
                data: () => mockData
            });
            return () => { }; // unsubscribe
        });

        const { result } = renderHook(() => useProfile('p1'));

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.profile).toEqual({ id: 'p1', ...mockData });
    });

    it('should handle profile not found', async () => {
        (firestore.onSnapshot as any).mockImplementation((_ref: any, callback: any) => {
            callback({
                exists: () => false
            });
            return () => { };
        });

        const { result } = renderHook(() => useProfile('p1'));

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.profile).toBeNull();
        expect(mockNavigate).toHaveBeenCalledWith('/');
    });
});
