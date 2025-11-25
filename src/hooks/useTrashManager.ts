// src/hooks/useTrashManager.ts
import { useState, useEffect, useMemo } from 'react';
import {
    collection,
    onSnapshot,
    updateDoc,
    doc,
    query,
    where,
    getDocs,
    writeBatch,
    QuerySnapshot,
    DocumentData
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Profile } from '../types';

/**
 * Custom hook for managing trash (archived profiles and subprofiles)
 * 
 * Handles all business logic for trash operations:
 * - Fetching archived profiles and subprofiles
 * - Restoring profiles and subprofiles
 * - Permanently deleting profiles (with cascading transaction deletion)
 * - Permanently deleting subprofiles
 */
export const useTrashManager = () => {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch all profiles (including archived ones)
    useEffect(() => {
        const q = collection(db, 'profiles');
        const unsubscribe = onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
            setProfiles(snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Profile[]);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // Filter archived profiles
    const archivedProfiles = useMemo(
        () => profiles.filter(p => p.status === 'archived'),
        [profiles]
    );

    // Get archived subprofiles from all profiles
    const archivedSubprofiles = useMemo(
        () => profiles.flatMap(p =>
            p.subprofiles
                .filter(s => s.status === 'archived')
                .map(s => ({
                    ...s,
                    parentProfileId: p.id,
                    parentProfileName: p.name
                }))
        ),
        [profiles]
    );

    // Restore a profile
    const restoreProfile = async (profileId: string): Promise<void> => {
        await updateDoc(doc(db, 'profiles', profileId), { status: 'active' });
    };

    // Restore a subprofile
    const restoreSubprofile = async (parentProfileId: string, subprofileId: string): Promise<void> => {
        const parentProfile = profiles.find(p => p.id === parentProfileId);
        if (!parentProfile) return;

        const updatedSubprofiles = parentProfile.subprofiles.map(s =>
            s.id === subprofileId ? { ...s, status: 'active' as const } : s
        );

        await updateDoc(doc(db, 'profiles', parentProfileId), { subprofiles: updatedSubprofiles });
    };

    // Permanently delete a profile (including all its transactions)
    const permanentlyDeleteProfile = async (profileId: string): Promise<void> => {
        const batch = writeBatch(db);

        // Delete all transactions for this profile
        const transQuery = query(collection(db, 'transactions'), where('profileId', '==', profileId));
        const transSnapshot = await getDocs(transQuery);
        transSnapshot.forEach(doc => batch.delete(doc.ref));

        // Delete the profile
        batch.delete(doc(db, 'profiles', profileId));

        await batch.commit();
    };

    // Permanently delete a subprofile
    const permanentlyDeleteSubprofile = async (parentProfileId: string, subprofileId: string): Promise<void> => {
        const parentProfile = profiles.find(p => p.id === parentProfileId);
        if (!parentProfile) return;

        const updatedSubprofiles = parentProfile.subprofiles.filter(s => s.id !== subprofileId);

        await updateDoc(doc(db, 'profiles', parentProfileId), { subprofiles: updatedSubprofiles });
    };

    return {
        // State
        profiles,
        archivedProfiles,
        archivedSubprofiles,
        loading,

        // Operations
        restoreProfile,
        restoreSubprofile,
        permanentlyDeleteProfile,
        permanentlyDeleteSubprofile
    };
};
