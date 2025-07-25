// src/contexts/ProfileContext.tsx

import React, { createContext, useState, useMemo, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useProfile } from '../hooks/useProfile';
import { themes, Theme } from '../lib/themes';
import { Profile } from '../types';

interface ProfileContextType {
    profile: Profile | null;
    loading: boolean;
    activeTheme: Theme;
    setActiveThemeBySubprofileId: (subprofileId: string | null) => void;
}

export const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { profileId } = useParams<{ profileId: string }>();
    const { profile, loading } = useProfile(profileId);
    
    const [activeTheme, setActiveTheme] = useState<Theme>(themes.default);

    const setActiveThemeBySubprofileId = useCallback((subprofileId: string | null) => {
        if (!profile) return;
        
        const activeSub = profile.subprofiles.find(s => s.id === subprofileId);
        let themeToApply = themes.default;

        if (activeSub?.customTheme) {
            themeToApply = { name: 'Custom', variables: activeSub.customTheme };
        } else if (activeSub?.themeId && themes[activeSub.themeId]) {
            themeToApply = themes[activeSub.themeId];
        }
        
        setActiveTheme(currentTheme => {
            if (JSON.stringify(currentTheme) === JSON.stringify(themeToApply)) {
                return currentTheme;
            }
            return themeToApply;
        });
    }, [profile]);
    
    useEffect(() => {
        const root = document.documentElement;
        Object.entries(activeTheme.variables).forEach(([key, value]) => {
            root.style.setProperty(key, value);
        });
        
        return () => {
             Object.keys(themes.default.variables).forEach(key => {
                root.style.removeProperty(key);
            });
        }
    }, [activeTheme]);
    
    const value = useMemo(() => ({
        profile,
        loading,
        activeTheme,
        setActiveThemeBySubprofileId
    }), [profile, loading, activeTheme, setActiveThemeBySubprofileId]);

    return (
        <ProfileContext.Provider value={value}>
            {children}
        </ProfileContext.Provider>
    );
};