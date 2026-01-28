import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useFeedbacks } from './useFeedbacks';

import * as firestore from 'firebase/firestore';

// Mock Firebase functions
vi.mock('firebase/firestore', async () => {
    const actual = await vi.importActual('firebase/firestore');
    return {
        ...actual,
        collection: vi.fn(),
        query: vi.fn(),
        where: vi.fn(),
        orderBy: vi.fn(),
        onSnapshot: vi.fn(),
        addDoc: vi.fn(),
        updateDoc: vi.fn(),
        deleteDoc: vi.fn(),
        doc: vi.fn(),
        serverTimestamp: vi.fn(),
    };
});

// Mock Toast Context
const mockShowToast = vi.fn();
vi.mock('../contexts/ToastContext', () => ({
    useToast: () => ({ showToast: mockShowToast }),
}));

describe('useFeedbacks', () => {
    const profileId = 'test-profile-id';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should initialize with loading state and empty feedbacks', () => {
        (firestore.onSnapshot as any).mockReturnValue(() => { });
        const { result } = renderHook(() => useFeedbacks(profileId));

        expect(result.current.loading).toBe(true);
        expect(result.current.feedbacks).toEqual([]);
    });

    it('should fetch feedbacks on mount', () => {
        const mockUnsubscribe = vi.fn();
        const mockFeedbacks = [
            { id: '1', description: 'Test bug', type: 'bug' },
            { id: '2', description: 'Test feature', type: 'feature' }
        ];

        (firestore.onSnapshot as any).mockImplementation((_query: any, callback: any) => {
            callback({
                docs: mockFeedbacks.map(f => ({
                    id: f.id,
                    data: () => f
                }))
            });
            return mockUnsubscribe;
        });

        const { result } = renderHook(() => useFeedbacks(profileId));

        expect(result.current.loading).toBe(false);
        expect(result.current.feedbacks).toHaveLength(2);
        expect(result.current.feedbacks[0].id).toBe('1');
    });

    it('should add feedback', async () => {
        (firestore.onSnapshot as any).mockReturnValue(() => { });
        (firestore.addDoc as any).mockResolvedValue({ id: 'new-id' });

        const { result } = renderHook(() => useFeedbacks(profileId));

        const newFeedback = {
            profileId: profileId,
            subprofileId: 'sub-id',
            description: 'New issue',
            type: 'bug' as const,
            priority: 'high' as const
        };

        await act(async () => {
            await result.current.addFeedback(newFeedback);
        });

        expect(firestore.addDoc).toHaveBeenCalled();
        expect(mockShowToast).toHaveBeenCalledWith('Feedback registrado!', 'success');
    });

    it('should update feedback status', async () => {
        (firestore.onSnapshot as any).mockReturnValue(() => { });
        (firestore.updateDoc as any).mockResolvedValue({});

        const { result } = renderHook(() => useFeedbacks(profileId));

        await act(async () => {
            await result.current.updateFeedbackStatus('f1', 'resolved');
        });

        expect(firestore.updateDoc).toHaveBeenCalled();
        expect(mockShowToast).toHaveBeenCalledWith('Status atualizado!', 'success');
    });

    it('should delete feedback', async () => {
        (firestore.onSnapshot as any).mockReturnValue(() => { });
        (firestore.deleteDoc as any).mockResolvedValue({});

        const { result } = renderHook(() => useFeedbacks(profileId));

        await act(async () => {
            await result.current.deleteFeedback('f1');
        });

        expect(firestore.deleteDoc).toHaveBeenCalled();
        expect(mockShowToast).toHaveBeenCalledWith('Feedback removido!', 'success');
    });
});
