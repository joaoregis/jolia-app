// src/App.tsx

import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './lib/firebase.ts';

import { LoginScreen } from './screens/LoginScreen.tsx';
import { ProtectedRoute } from './components/ProtectedRoute.tsx';
import { ProfileSelector } from './screens/ProfileSelector.tsx';
import { DashboardScreen } from './screens/DashboardScreen.tsx';
import { Layout } from './components/Layout.tsx';
import { TrashScreen } from './screens/TrashScreen.tsx';
import { WishlistScreen } from './screens/WishlistScreen.tsx';
import { SettingsScreen } from './screens/SettingsScreen.tsx';
import { ToastProvider } from './contexts/ToastContext.tsx';
import { themes } from './lib/themes.ts';

export default function App() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });

        // Aplica o tema padrão na inicialização do app
        const root = document.documentElement;
        Object.entries(themes.default.variables).forEach(([key, value]) => {
            root.style.setProperty(key, value);
        });

        return () => unsubscribe();
    }, []);

    return (
        <ToastProvider>
            <Routes>
                <Route path="/login" element={<LoginScreen />} />
                <Route
                    path="/"
                    element={
                        <ProtectedRoute user={user} loading={loading}>
                            <ProfileSelector />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/trash"
                    element={
                        <ProtectedRoute user={user} loading={loading}>
                            <TrashScreen />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/profile/:profileId"
                    element={
                        <ProtectedRoute user={user} loading={loading}>
                            <Layout user={user}>
                            </Layout>
                        </ProtectedRoute>
                    }
                >
                    <Route path="" element={<DashboardScreen />} />
                    <Route path=":subprofileId" element={<DashboardScreen />} />
                    <Route path="wishlist" element={<WishlistScreen />} />
                    <Route path="wishlist/:subprofileId" element={<WishlistScreen />} />
                    <Route path="settings" element={<SettingsScreen />} />
                </Route>
            </Routes>
        </ToastProvider>
    );
}