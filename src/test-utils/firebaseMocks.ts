// src/test-utils/firebaseMocks.ts
import { vi, expect } from 'vitest';

/**
 * Firebase Mocking Utilities
 * 
 * Centralized Firebase mocking patterns to reduce test boilerplate
 * and ensure consistency across all tests.
 */

// ============================================================================
// Mock Snapshot Generators
// ============================================================================

/**
 * Create a mock Firestore document snapshot
 */
export const createMockDocSnapshot = <T extends Record<string, any>>(
    id: string,
    data: T
) => ({
    id,
    data: () => data,
    exists: () => true,
    ref: { id }
});

/**
 * Create a mock Firestore query snapshot
 */
export const createMockQuerySnapshot = <T extends Record<string, any>>(
    docs: Array<{ id: string; data: T }>
) => ({
    docs: docs.map(doc => createMockDocSnapshot(doc.id, doc.data)),
    empty: docs.length === 0,
    size: docs.length,
    forEach: (callback: (doc: any) => void) => {
        docs.forEach(doc => callback(createMockDocSnapshot(doc.id, doc.data)));
    }
});

// ============================================================================
// Real-time Listener Simulators
// ============================================================================

/**
 * Create a mock onSnapshot listener that immediately calls callback
 * Returns an unsubscribe function
 */
export const createMockOnSnapshot = <T extends Record<string, any>>(
    docs: Array<{ id: string; data: T }>,
    errorCallback?: (error: Error) => void
) => {
    return (_query: any, callback: (snapshot: any) => void, onError?: (error: Error) => void) => {
        if (errorCallback && onError) {
            onError(new Error('Mock error'));
        } else {
            callback(createMockQuerySnapshot(docs));
        }
        return vi.fn(); // Unsubscribe function
    };
};

/**
 * Create a controlled onSnapshot mock that can be triggered manually
 * Useful for testing real-time updates
 */
export const createControlledOnSnapshot = () => {
    let storedCallback: ((snapshot: any) => void) | null = null;
    const unsubscribe = vi.fn();

    const mockOnSnapshot = vi.fn((_query: any, callback: (snapshot: any) => void) => {
        storedCallback = callback;
        return unsubscribe;
    });

    const trigger = <T extends Record<string, any>>(docs: Array<{ id: string; data: T }>) => {
        if (storedCallback) {
            storedCallback(createMockQuerySnapshot(docs));
        }
    };

    return { mockOnSnapshot, trigger, unsubscribe };
};

// ============================================================================
// Firestore Operation Mocks
// ============================================================================

/**
 * Create mock for Firestore CRUD operations
 */
export const createFirestoreMocks = () => {
    const addDoc = vi.fn().mockResolvedValue({ id: 'mock-id' });
    const updateDoc = vi.fn().mockResolvedValue(undefined);
    const deleteDoc = vi.fn().mockResolvedValue(undefined);
    const getDoc = vi.fn();
    const getDocs = vi.fn();
    const setDoc = vi.fn().mockResolvedValue(undefined);

    return {
        addDoc,
        updateDoc,
        deleteDoc,
        getDoc,
        getDocs,
        setDoc
    };
};

/**
 * Create mock for Firestore batch operations
 */
export const createBatchMock = () => {
    const batch = {
        delete: vi.fn(),
        update: vi.fn(),
        set: vi.fn(),
        commit: vi.fn().mockResolvedValue(undefined)
    };

    const writeBatch = vi.fn(() => batch);

    return { writeBatch, batch };
};

// ============================================================================
// Query Builder Mocks
// ============================================================================

/**
 * Mock Firestore query builders
 */
export const createQueryMocks = () => ({
    collection: vi.fn((_db: any, path: string) => ({ path })),
    doc: vi.fn((_db: any, path: string, id?: string) => ({ path, id })),
    query: vi.fn((...args: any[]) => ({ args })),
    where: vi.fn((field: string, op: string, value: any) => ({ field, op, value })),
    orderBy: vi.fn((field: string, direction?: string) => ({ field, direction })),
    limit: vi.fn((count: number) => ({ count }))
});

// ============================================================================
// Complete Firebase Mock Setup
// ============================================================================

/**
 * Setup complete Firebase mock for a test suite
 * Returns all mocked functions for assertions
 */
export const setupFirebaseMocks = () => {
    const firestoreMocks = createFirestoreMocks();
    const queryMocks = createQueryMocks();
    const { writeBatch, batch } = createBatchMock();
    const serverTimestamp = vi.fn(() => ({ __type: 'serverTimestamp' }));

    // Mock all Firestore functions
    vi.mock('firebase/firestore', async () => {
        const actual = await vi.importActual('firebase/firestore');
        return {
            ...actual,
            ...firestoreMocks,
            ...queryMocks,
            writeBatch,
            serverTimestamp,
            onSnapshot: vi.fn()
        };
    });

    return {
        ...firestoreMocks,
        ...queryMocks,
        writeBatch,
        batch,
        serverTimestamp
    };
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Wait for async operations to complete in tests
 */
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));

/**
 * Create a rejected promise for error testing
 */
export const createRejectedPromise = (message: string) =>
    Promise.reject(new Error(message));

/**
 * Assert that a mock was called with specific arguments
 */
export const expectCalledWith = (mock: any, ...args: any[]) => {
    expect(mock).toHaveBeenCalledWith(...args);
};
