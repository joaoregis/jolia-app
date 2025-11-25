// src/test-utils/testDataFactories.ts
import { Profile, Subprofile, Transaction, Label, Wishlist, WishlistItem } from '../types';

/**
 * Test Data Factories
 * 
 * Reusable factory functions for creating consistent test data.
 * Each factory provides sensible defaults with optional overrides.
 */

// ============================================================================
// Profile & Subprofile Factories
// ============================================================================

/**
 * Create a mock Profile with default values
 */
export const createMockProfile = (overrides?: Partial<Profile>): Profile => ({
    id: 'profile-1',
    name: 'Test Profile',
    icon: '🏠',
    status: 'active',
    subprofiles: [],
    savedThemes: [],
    ...overrides
});

/**
 * Create a mock Subprofile with default values
 */
export const createMockSubprofile = (overrides?: Partial<Subprofile>): Subprofile => ({
    id: 'subprofile-1',
    name: 'Test Subprofile',
    status: 'active',
    themeId: 'default',
    ...overrides
});

/**
 * Create a Profile with multiple subprofiles
 */
export const createMockProfileWithSubprofiles = (
    subprofileCount: number = 2,
    profileOverrides?: Partial<Profile>
): Profile => {
    const subprofiles = Array.from({ length: subprofileCount }, (_, i) =>
        createMockSubprofile({
            id: `subprofile-${i + 1}`,
            name: `Subprofile ${i + 1}`
        })
    );

    return createMockProfile({
        subprofiles,
        ...profileOverrides
    });
};

// ============================================================================
// Transaction Factories
// ============================================================================

/**
 * Create a mock Transaction with default values
 */
export const createMockTransaction = (overrides?: Partial<Transaction>): Transaction => ({
    id: 'transaction-1',
    description: 'Test Transaction',
    planned: 100,
    actual: 100,
    type: 'expense',
    date: '2023-01-01',
    profileId: 'profile-1',
    paid: false,
    isShared: false,
    isRecurring: false,
    createdAt: new Date(),
    ...overrides
});

/**
 * Create an income transaction
 */
export const createMockIncome = (overrides?: Partial<Transaction>): Transaction =>
    createMockTransaction({
        type: 'income',
        description: 'Test Income',
        ...overrides
    });

/**
 * Create an expense transaction
 */
export const createMockExpense = (overrides?: Partial<Transaction>): Transaction =>
    createMockTransaction({
        type: 'expense',
        description: 'Test Expense',
        ...overrides
    });

/**
 * Create a recurring transaction
 */
export const createMockRecurringTransaction = (overrides?: Partial<Transaction>): Transaction =>
    createMockTransaction({
        isRecurring: true,
        seriesId: 'series-1',
        ...overrides
    });

/**
 * Create an installment transaction
 */
export const createMockInstallmentTransaction = (
    currentInstallment: number = 1,
    totalInstallments: number = 12,
    overrides?: Partial<Transaction>
): Transaction =>
    createMockTransaction({
        seriesId: 'series-1',
        currentInstallment,
        totalInstallments,
        ...overrides
    });

/**
 * Create multiple transactions
 */
export const createMockTransactions = (
    count: number,
    template?: Partial<Transaction>
): Transaction[] =>
    Array.from({ length: count }, (_, i) =>
        createMockTransaction({
            id: `transaction-${i + 1}`,
            description: `Transaction ${i + 1}`,
            ...template
        })
    );

// ============================================================================
// Label Factories
// ============================================================================

/**
 * Create a mock Label with default values
 */
export const createMockLabel = (overrides?: Partial<Label>): Label => ({
    id: 'label-1',
    name: 'Test Label',
    color: '#FF0000',
    profileId: 'profile-1',
    status: 'active',
    createdAt: new Date(),
    ...overrides
});

/**
 * Create multiple labels
 */
export const createMockLabels = (count: number): Label[] =>
    Array.from({ length: count }, (_, i) =>
        createMockLabel({
            id: `label-${i + 1}`,
            name: `Label ${i + 1}`,
            color: `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`
        })
    );

// ============================================================================
// Wishlist Factories
// ============================================================================

/**
 * Create a mock Wishlist with default values
 */
export const createMockWishlist = (overrides?: Partial<Wishlist>): Wishlist => ({
    id: 'wishlist-1',
    name: 'Test Wishlist',
    profileId: 'profile-1',
    isShared: false,
    createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 },
    ...overrides
});

/**
 * Create a shared wishlist
 */
export const createMockSharedWishlist = (overrides?: Partial<Wishlist>): Wishlist =>
    createMockWishlist({
        isShared: true,
        name: 'Shared Wishlist',
        ...overrides
    });

/**
 * Create a subprofile wishlist
 */
export const createMockSubprofileWishlist = (
    subprofileId: string,
    overrides?: Partial<Wishlist>
): Wishlist =>
    createMockWishlist({
        isShared: false,
        subprofileId,
        name: 'Subprofile Wishlist',
        ...overrides
    });

/**
 * Create multiple wishlists
 */
export const createMockWishlists = (count: number): Wishlist[] =>
    Array.from({ length: count }, (_, i) =>
        createMockWishlist({
            id: `wishlist-${i + 1}`,
            name: `Wishlist ${i + 1}`
        })
    );

// ============================================================================
// Wishlist Item Factories
// ============================================================================

/**
 * Create a mock WishlistItem with default values
 */
export const createMockWishlistItem = (overrides?: Partial<WishlistItem>): WishlistItem => ({
    id: 'item-1',
    title: 'Test Item',
    description: 'Test description',
    budget: 100,
    isDone: false,
    createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 },
    ...overrides
});

/**
 * Create a completed wishlist item
 */
export const createMockCompletedItem = (overrides?: Partial<WishlistItem>): WishlistItem =>
    createMockWishlistItem({
        isDone: true,
        title: 'Completed Item',
        ...overrides
    });

/**
 * Create multiple wishlist items
 */
export const createMockWishlistItems = (count: number): WishlistItem[] =>
    Array.from({ length: count }, (_, i) =>
        createMockWishlistItem({
            id: `item-${i + 1}`,
            title: `Item ${i + 1}`,
            budget: (i + 1) * 10
        })
    );

// ============================================================================
// Composite Factories
// ============================================================================

/**
 * Create a complete test dataset with related entities
 */
export const createCompleteTestDataset = () => {
    const profile = createMockProfileWithSubprofiles(2);
    const transactions = createMockTransactions(5, { profileId: profile.id });
    const labels = createMockLabels(3);
    const wishlists = createMockWishlists(2);
    const wishlistItems = createMockWishlistItems(4);

    return {
        profile,
        subprofiles: profile.subprofiles,
        transactions,
        labels,
        wishlists,
        wishlistItems
    };
};

/**
 * Create archived entities for trash testing
 */
export const createArchivedDataset = () => {
    const archivedProfile = createMockProfile({
        id: 'archived-profile',
        status: 'archived',
        name: 'Archived Profile'
    });

    const profileWithArchivedSub = createMockProfile({
        id: 'profile-with-archived',
        subprofiles: [
            createMockSubprofile({
                id: 'archived-sub',
                status: 'archived',
                name: 'Archived Subprofile'
            })
        ]
    });

    return {
        archivedProfile,
        profileWithArchivedSub
    };
};
