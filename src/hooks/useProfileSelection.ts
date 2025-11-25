// src/hooks/useProfileSelection.ts
import { useState, useEffect } from 'react';
import {
    collection,
    onSnapshot,
    addDoc,
    updateDoc,
    doc,
    QuerySnapshot,
    DocumentData
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Profile } from '../types';

/**
 * Custom hook for managing profile selection and operations
 * 
 * Handles all business logic for profile management:
 * - Fetching active profiles
 * - Creating new profiles
 * - Archiving profiles
 * - User authentication state
 */
export const useProfileSelection = () => {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const user = auth.currentUser;

    // Fetch all profiles for the current user
    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        setLoading(true);
        const q = collection(db, 'profiles');
        const unsubscribe = onSnapshot(
            q,
            (snapshot: QuerySnapshot<DocumentData>) => {
                const loadedProfiles = snapshot.docs.map(doc => ({
                    ...doc.data(),
                    id: doc.id
                })) as Profile[];
                setProfiles(loadedProfiles);
                setLoading(false);
            },
            (error) => {
                console.error("Erro ao carregar perfis:", error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [user]);

    // Get only active profiles
    const activeProfiles = profiles.filter(p => p.status === 'active');

    // Check if there are no active profiles (should show create form)
    const shouldShowCreateForm = activeProfiles.length === 0;

    // Create a new profile
    const createProfile = async (name: string, icon: string): Promise<void> => {
        await addDoc(collection(db, 'profiles'), {
            name,
            icon,
            subprofiles: [],
            status: 'active'
        });
    };

    // Archive a profile
    const archiveProfile = async (profileId: string): Promise<void> => {
        const profileRef = doc(db, 'profiles', profileId);
        await updateDoc(profileRef, { status: 'archived' });
    };

    // Logout user
    const logout = async (): Promise<void> => {
        await auth.signOut();
    };

    return {
        // State
        profiles,
        activeProfiles,
        loading,
        user,
        shouldShowCreateForm,

        // Operations
        createProfile,
        archiveProfile,
        logout
    };
};
