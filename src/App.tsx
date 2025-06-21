// src/App.tsx

import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './lib/firebase.ts';

// Importa os novos componentes com caminhos corrigidos
import { LoginScreen } from './screens/LoginScreen.tsx';
import { ProtectedRoute } from './components/ProtectedRoute.tsx'; 

import { ProfileSelector } from './screens/ProfileSelector.tsx';
import { DashboardScreen } from './screens/DashboardScreen.tsx';
import { Layout } from './components/Layout.tsx';
import { TrashScreen } from './screens/TrashScreen.tsx';

export default function App() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // O useEffect agora apenas observa o estado de autenticação sem fazer login anônimo
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    return (
        <Routes>
            {/* Rota pública para a tela de login */}
            <Route path="/login" element={<LoginScreen />} />

            {/* Rota principal, protegida */}
            <Route 
                path="/" 
                element={
                    <ProtectedRoute user={user} loading={loading}>
                        <ProfileSelector />
                    </ProtectedRoute>
                } 
            />
            
            {/* Rota do perfil, protegida */}
            <Route 
                path="/profile/:profileId/*" 
                element={
                    <ProtectedRoute user={user} loading={loading}>
                        <Layout user={user}>
                            <DashboardScreen />
                        </Layout>
                    </ProtectedRoute>
                } 
            />
            
            {/* Rota da lixeira, protegida */}
            <Route 
                path="/trash" 
                element={
                    <ProtectedRoute user={user} loading={loading}>
                        <TrashScreen />
                    </ProtectedRoute>
                } 
            />
        </Routes>
    );
}
