// src/components/ProtectedRoute.tsx

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { User } from 'firebase/auth';

interface ProtectedRouteProps {
    user: User | null;
    loading: boolean;
    children: React.ReactNode;
}

/**
 * Componente para proteger rotas.
 * Se o utilizador não estiver logado, redireciona para a página de login.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ user, loading, children }) => {
    const location = useLocation();

    if (loading) {
        // Mostra uma tela de carregamento animada enquanto o estado de autenticação é verificado
        return (
            <div className="flex h-screen flex-col items-center justify-center bg-slate-100 dark:bg-slate-900 text-slate-500">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-accent border-t-transparent"></div>
                <p className="mt-4 text-lg font-medium">A verificar autenticação...</p>
            </div>
        );
    }

    if (!user) {
        // Se não houver utilizador após o carregamento, redireciona para a tela de login
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Se houver utilizador, renderiza o componente filho (a página protegida)
    return <>{children}</>;
};