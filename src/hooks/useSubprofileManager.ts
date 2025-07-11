// src/hooks/useSubprofileManager.ts
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Profile, Subprofile } from '../types';
import { Theme } from '../lib/themes';

/**
 * Hook para gerir as operações de subperfis (criar, atualizar, arquivar).
 * @param profile O perfil atual ao qual os subperfis pertencem.
 */
export function useSubprofileManager(profile: Profile | null) {
    const handleCreateSubprofile = async (name: string, themeId: string) => {
        if (!profile) return;
        const newSubprofile: Subprofile = {
            id: name.trim().toLowerCase().replace(/\s+/g, '-'),
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

    return {
        handleCreateSubprofile,
        handleUpdateSubprofile,
        handleArchiveSubprofile,
    };
}