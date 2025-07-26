// src/hooks/useSubprofileManager.ts
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Profile, Subprofile, Theme, CustomTheme } from '../types';

/**
 * Hook para gerir as operações de subperfis (criar, atualizar, arquivar).
 * @param profile O perfil atual ao qual os subperfis pertencem.
 */
export function useSubprofileManager(profile: Profile | null) {
    const handleCreateSubprofile = async (name: string, themeId: string) => {
        if (!profile) return;
        const newSubprofile: Subprofile = {
            id: crypto.randomUUID(),
            name: name.trim(),
            status: 'active',
            themeId: themeId
        };
        const updatedSubprofiles = [...profile.subprofiles, newSubprofile];
        await updateDoc(doc(db, "profiles", profile.id), { subprofiles: updatedSubprofiles });
    };

    const handleUpdateSubprofile = async (id: string, newName: string, newThemeId: string, customTheme?: Theme['variables']) => {
        if (!profile) return;
        const updatedSubprofiles = profile.subprofiles.map(sub =>
            sub.id === id ? { ...sub, name: newName, themeId: newThemeId, customTheme: customTheme || null } : sub
        );
        await updateDoc(doc(db, "profiles", profile.id), { subprofiles: updatedSubprofiles });
    };

    const handleArchiveSubprofile = async (subprofileToArchive: Subprofile) => {
        if (!profile || !subprofileToArchive) return;
        const updatedSubprofiles = profile.subprofiles.map(sub =>
            sub.id === subprofileToArchive.id ? { ...sub, status: 'archived' } : sub
        );
        await updateDoc(doc(db, "profiles", profile.id), { subprofiles: updatedSubprofiles });
    };

    const handleSaveCustomTheme = async (name: string, variables: Theme['variables']) => {
        if (!profile) return;
        const newTheme: CustomTheme = {
            id: crypto.randomUUID(),
            name,
            variables
        };
        await updateDoc(doc(db, "profiles", profile.id), {
            savedThemes: arrayUnion(newTheme)
        });
    };
    
    const handleDeleteCustomTheme = async (themeId: string) => {
        if (!profile || !profile.savedThemes) return;
        const themeToDelete = profile.savedThemes.find(t => t.id === themeId);
        if (themeToDelete) {
            await updateDoc(doc(db, "profiles", profile.id), {
                savedThemes: arrayRemove(themeToDelete)
            });
        }
    };

    return {
        handleCreateSubprofile,
        handleUpdateSubprofile,
        handleArchiveSubprofile,
        handleSaveCustomTheme,
        handleDeleteCustomTheme,
    };
}