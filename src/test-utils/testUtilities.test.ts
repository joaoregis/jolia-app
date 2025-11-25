// src/test-utils/testUtilities.test.ts
import { describe, it, expect } from 'vitest';
import {
    createMockDocSnapshot,
    createMockQuerySnapshot,
    createFirestoreMocks,
    createBatchMock
} from './firebaseMocks';
import {
    createMockProfile,
    createMockProfileWithSubprofiles,
    createMockTransaction,
    createMockTransactions,
    createMockWishlist,
    createCompleteTestDataset,
    createArchivedDataset
} from './testDataFactories';

describe('Test Utilities Validation', () => {
    describe('Firebase Mocks', () => {
        it('should create mock document snapshot', () => {
            const snapshot = createMockDocSnapshot('test-id', { name: 'Test' });

            expect(snapshot.id).toBe('test-id');
            expect(snapshot.data()).toEqual({ name: 'Test' });
            expect(snapshot.exists()).toBe(true);
        });

        it('should create mock query snapshot', () => {
            const snapshot = createMockQuerySnapshot([
                { id: '1', data: { name: 'Item 1' } },
                { id: '2', data: { name: 'Item 2' } }
            ]);

            expect(snapshot.docs).toHaveLength(2);
            expect(snapshot.empty).toBe(false);
            expect(snapshot.size).toBe(2);
        });

        it('should create Firestore operation mocks', () => {
            const mocks = createFirestoreMocks();

            expect(mocks.addDoc).toBeDefined();
            expect(mocks.updateDoc).toBeDefined();
            expect(mocks.deleteDoc).toBeDefined();
        });

        it('should create batch mocks', () => {
            const { writeBatch, batch } = createBatchMock();

            expect(writeBatch).toBeDefined();
            expect(batch.delete).toBeDefined();
            expect(batch.update).toBeDefined();
            expect(batch.commit).toBeDefined();
        });
    });

    describe('Test Data Factories', () => {
        it('should create mock profile with defaults', () => {
            const profile = createMockProfile();

            expect(profile.id).toBe('profile-1');
            expect(profile.name).toBe('Test Profile');
            expect(profile.status).toBe('active');
            expect(profile.subprofiles).toEqual([]);
        });

        it('should create mock profile with overrides', () => {
            const profile = createMockProfile({
                id: 'custom-id',
                name: 'Custom Name'
            });

            expect(profile.id).toBe('custom-id');
            expect(profile.name).toBe('Custom Name');
        });

        it('should create profile with subprofiles', () => {
            const profile = createMockProfileWithSubprofiles(3);

            expect(profile.subprofiles).toHaveLength(3);
            expect(profile.subprofiles[0].id).toBe('subprofile-1');
            expect(profile.subprofiles[1].id).toBe('subprofile-2');
            expect(profile.subprofiles[2].id).toBe('subprofile-3');
        });

        it('should create mock transaction with defaults', () => {
            const transaction = createMockTransaction();

            expect(transaction.id).toBe('transaction-1');
            expect(transaction.type).toBe('expense');
            expect(transaction.planned).toBe(100);
            expect(transaction.actual).toBe(100);
        });

        it('should create multiple transactions', () => {
            const transactions = createMockTransactions(5, { profileId: 'test-profile' });

            expect(transactions).toHaveLength(5);
            transactions.forEach(t => {
                expect(t.profileId).toBe('test-profile');
            });
        });

        it('should create mock wishlist', () => {
            const wishlist = createMockWishlist();

            expect(wishlist.id).toBe('wishlist-1');
            expect(wishlist.name).toBe('Test Wishlist');
            expect(wishlist.isShared).toBe(false);
        });

        it('should create complete test dataset', () => {
            const dataset = createCompleteTestDataset();

            expect(dataset.profile).toBeDefined();
            expect(dataset.subprofiles).toHaveLength(2);
            expect(dataset.transactions).toHaveLength(5);
            expect(dataset.labels).toHaveLength(3);
            expect(dataset.wishlists).toHaveLength(2);
            expect(dataset.wishlistItems).toHaveLength(4);
        });

        it('should create archived dataset', () => {
            const dataset = createArchivedDataset();

            expect(dataset.archivedProfile.status).toBe('archived');
            expect(dataset.profileWithArchivedSub.subprofiles[0].status).toBe('archived');
        });
    });
});
