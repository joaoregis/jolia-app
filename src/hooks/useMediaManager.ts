// src/hooks/useMediaManager.ts
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
    serverTimestamp,
    deleteField
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { MediaItem } from '../types';

export type HistoryEntry = MediaItem & {
    displaySeason?: number;
    displayDate: string;
};

/**
 * Custom hook for managing media items
 */
export const useMediaManager = (profileId?: string) => {
    const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch media items
    useEffect(() => {
        if (!profileId) {
            setLoading(false);
            return;
        }

        const q = query(
            collection(db, 'media_items'),
            where('profileId', '==', profileId)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => {
                const data = doc.data();
                // Backward compatibility mapping
                let status = data.status;
                if (!status) {
                    status = data.isWatched ? 'watched' : 'to_watch';
                }

                return {
                    id: doc.id,
                    ...data,
                    status
                };
            }) as MediaItem[];

            // Sort locally
            items.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

            setMediaItems(items);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching media items:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [profileId]);

    // Filtered lists
    const watchList = useMemo(() => {
        return mediaItems.filter(item => item.status === 'to_watch');
    }, [mediaItems]);

    const inProgressList = useMemo(() => {
        return mediaItems.filter(item => item.status === 'in_progress');
    }, [mediaItems]);

    // History List (Legacy support + New Per-Season Logic)
    const historyList = useMemo(() => {
        const entries: HistoryEntry[] = [];

        mediaItems.forEach(item => {
            // 1. Movies or Legacy Series (single watchedDate)
            if (item.status === 'watched' && item.watchedDate) {
                // If it's a series with watchedSeasons, we might want to skip this generic entry 
                // IF we are sure we have individual entries. 
                // But for safety, if it has watchedDate, we show it.
                // However, to avoid duplication if we have watchedSeasons, we check:
                if (item.type === 'movie' || !item.watchedSeasons) {
                    entries.push({
                        ...item,
                        displayDate: item.watchedDate
                    });
                }
            }

            // 2. Series with Per-Season History
            if (item.type === 'series' && item.watchedSeasons) {
                Object.entries(item.watchedSeasons).forEach(([season, date]) => {
                    const seasonNum = Number(season);
                    // Use season-specific ratings if available, otherwise fall back to global ratings (or empty)
                    const seasonSpecificRatings = item.seasonRatings?.[seasonNum] || item.ratings;

                    entries.push({
                        ...item,
                        displaySeason: seasonNum,
                        displayDate: date,
                        ratings: seasonSpecificRatings // Override ratings for this entry
                    });
                });
            }
        });

        // Sort by date descending
        return entries.sort((a, b) => b.displayDate.localeCompare(a.displayDate));
    }, [mediaItems]);

    // CRUD operations
    const addMedia = async (data: Omit<MediaItem, 'id' | 'createdAt' | 'profileId'>): Promise<void> => {
        if (!profileId) return;

        // Ensure status is set
        const status = data.status || 'to_watch';

        await addDoc(collection(db, 'media_items'), {
            ...data,
            status,
            profileId,
            createdAt: serverTimestamp()
        });
    };

    const updateMedia = async (id: string, data: Partial<MediaItem>): Promise<void> => {
        await updateDoc(doc(db, 'media_items', id), data);
    };

    const deleteMedia = async (id: string): Promise<void> => {
        await deleteDoc(doc(db, 'media_items', id));
    };

    const updateStatus = async (item: MediaItem, newStatus: MediaItem['status'], additionalData?: Partial<MediaItem>): Promise<void> => {
        const updateData: Partial<MediaItem> = {
            status: newStatus,
            ...additionalData
        };

        if (newStatus === 'watched') {
            if (!updateData.watchedDate) {
                updateData.watchedDate = new Date().toISOString().slice(0, 7);
            }
        } else {
            // If moving back from watched, remove watchedDate
            if (item.status === 'watched') {
                updateData.watchedDate = deleteField() as any;
            }
        }

        await updateDoc(doc(db, 'media_items', item.id), updateData);
    };

    const addRating = async (item: MediaItem, subprofileId: string, rating: number): Promise<void> => {
        const currentRatings = item.ratings || {};
        await updateDoc(doc(db, 'media_items', item.id), {
            ratings: {
                ...currentRatings,
                [subprofileId]: rating
            }
        });
    };

    return {
        mediaItems,
        watchList,
        inProgressList,
        historyList, // Now returns HistoryEntry[]
        loading,
        addMedia,
        updateMedia,
        deleteMedia,
        updateStatus,
        addRating
    };
};
