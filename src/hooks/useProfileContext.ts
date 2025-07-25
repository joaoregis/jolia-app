// src/hooks/useProfileContext.ts

import { useContext } from 'react';
import { ProfileContext } from '../contexts/ProfileContext';

export const useProfileContext = () => {
    const context = useContext(ProfileContext);
    if (context === undefined) {
        throw new Error('useProfileContext must be used within a ProfileProvider');
    }
    return context;
};