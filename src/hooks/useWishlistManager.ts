// src/hooks/useWishlistManager.ts
import { useState, useEffect, useMemo } from 'react';
import {
    collection,
    onSnapshot,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    where,
    orderBy,
    serverTimestamp,
    writeBatch
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Wishlist, WishlistItem } from '../types';

/**
 * Custom hook for managing wishlists and wishlist items
 * 
 * Handles all business logic for wishlist operations:
 * - Fetching wishlists and items
 * - CRUD operations for wishlists
 * - CRUD operations for wishlist items
 * - Filtering by tab (geral/subprofile)
 * 
 * @param profileId - The profile ID to fetch wishlists for
 * @param activeTab - Current active tab (geral or subprofile ID)
 */
export const useWishlistManager = (profileId?: string, activeTab?: string) => {
    const [wishlists, setWishlists] = useState<Wishlist[]>([]);
    const [wishlistItems, setWishlistItems] = useState<Map<string, WishlistItem[]>>(new Map());
    const [loading, setLoading] = useState(true);

    // Fetch wishlists and their items
    useEffect(() => {
        if (!profileId) {
            setLoading(false);
            return;
        }

        const q = query(collection(db, 'wishlists'), where('profileId', '==', profileId));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const lists = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Wishlist));
            setWishlists(lists);

            // Subscribe to items for each wishlist
            lists.forEach(list => {
                const itemsQuery = query(
                    collection(db, `wishlists/${list.id}/items`),
                    orderBy('createdAt', 'asc')
                );
                onSnapshot(itemsQuery, (itemsSnapshot) => {
                    const items = itemsSnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    } as WishlistItem));
                    setWishlistItems(prevItems => new Map(prevItems).set(list.id, items));
                });
            });

            setLoading(false);
        }, () => {
            setLoading(false);
        });

        return () => unsubscribe();
    }, [profileId]);

    // Filter wishlists by active tab
    const filteredWishlists = useMemo(() => {
        const sorted = [...wishlists].sort(
            (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
        );

        if (activeTab === 'geral') {
            return sorted.filter(w => w.isShared);
        }
        return sorted.filter(w => w.subprofileId === activeTab);
    }, [wishlists, activeTab]);

    // CRUD operations for wishlists
    const addWishlist = async (name: string): Promise<void> => {
        if (!profileId) return;

        const data: {
            name: string;
            profileId: string;
            isShared: boolean;
            subprofileId?: string;
            createdAt: any;
        } = {
            name,
            profileId,
            isShared: activeTab === 'geral',
            createdAt: serverTimestamp(),
        };

        if (activeTab !== 'geral') {
            data.subprofileId = activeTab;
        }

        await addDoc(collection(db, 'wishlists'), data);
    };

    const updateWishlist = async (wishlistId: string, newName: string): Promise<void> => {
        await updateDoc(doc(db, 'wishlists', wishlistId), { name: newName });
    };

    const deleteWishlist = async (wishlistId: string): Promise<void> => {
        const batch = writeBatch(db);
        const items = wishlistItems.get(wishlistId) || [];

        // Delete all items in the wishlist
        items.forEach(item => {
            batch.delete(doc(db, `wishlists/${wishlistId}/items`, item.id));
        });

        // Delete the wishlist itself
        batch.delete(doc(db, 'wishlists', wishlistId));

        await batch.commit();
    };

    // CRUD operations for wishlist items
    const addWishlistItem = async (
        wishlistId: string,
        itemData: Omit<WishlistItem, 'id' | 'createdAt' | 'isDone'>
    ): Promise<void> => {
        await addDoc(collection(db, `wishlists/${wishlistId}/items`), {
            ...itemData,
            isDone: false,
            createdAt: serverTimestamp()
        });
    };

    const updateWishlistItem = async (
        wishlistId: string,
        itemId: string,
        itemData: Omit<WishlistItem, 'id' | 'createdAt' | 'isDone'>
    ): Promise<void> => {
        await updateDoc(doc(db, `wishlists/${wishlistId}/items`, itemId), { ...itemData });
    };

    const toggleItemDone = async (wishlistId: string, item: WishlistItem): Promise<void> => {
        await updateDoc(doc(db, `wishlists/${wishlistId}/items`, item.id), {
            isDone: !item.isDone
        });
    };

    const deleteWishlistItem = async (wishlistId: string, itemId: string): Promise<void> => {
        await deleteDoc(doc(db, `wishlists/${wishlistId}/items`, itemId));
    };

    return {
        // State
        wishlists: filteredWishlists,
        wishlistItems,
        loading,

        // Wishlist operations
        addWishlist,
        updateWishlist,
        deleteWishlist,

        // Item operations
        addWishlistItem,
        updateWishlistItem,
        toggleItemDone,
        deleteWishlistItem
    };
};
