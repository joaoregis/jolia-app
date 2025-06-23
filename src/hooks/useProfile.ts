// src/hooks/useProfile.ts
import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Profile } from '../types';
import { useNavigate } from 'react-router-dom';

export function useProfile(profileId?: string) {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (!profileId) {
            setLoading(false);
            return;
        }

        const docRef = doc(db, 'profiles', profileId);
        const unsubscribe = onSnapshot(docRef, (doc) => {
            if (doc.exists()) {
                setProfile({ id: doc.id, ...doc.data() } as Profile);
            } else {
                console.error("Perfil não encontrado!");
                navigate('/');
            }
            setLoading(false);
        }, (error) => {
            console.error("Erro ao buscar perfil:", error);
            navigate('/');
            setLoading(false);
        });

        return () => unsubscribe();
    }, [profileId, navigate]);

    return { profile, loading };
}