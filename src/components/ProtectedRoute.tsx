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
        // Mostra uma tela de carregamento enquanto o estado de autenticação é verificado
        return <div className="flex h-screen items-center justify-center bg-slate-100 dark:bg-slate-900 text-slate-500">A verificar autenticação...</div>;
    }

    if (!user) {
        // Se não houver utilizador após o carregamento, redireciona para a tela de login
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Se houver utilizador, renderiza o componente filho (a página protegida)
    return <>{children}</>;
};
