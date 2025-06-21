// src/components/Layout.tsx

import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { User } from 'firebase/auth';
import { Briefcase, User as UserIcon, Home, CreditCard, Tag, Settings, LogOut } from 'lucide-react';

interface LayoutProps {
    user: User | null;
    children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ user, children }) => {
    const navigate = useNavigate();
    // Usamos useParams para ler o ID do perfil, para que o menu lateral possa ser mais inteligente no futuro
    const { profileId } = useParams<{ profileId: string }>();

    return (
        // CORREÇÃO: Alterado 'min-h-screen' para 'h-screen' e adicionado 'overflow-hidden'
        // Isto fixa o layout à altura do ecrã, impedindo o scroll da página inteira.
        <div className="flex h-screen overflow-hidden bg-slate-100 dark:bg-slate-900 font-sans">
            <aside className="w-64 flex-shrink-0 bg-white dark:bg-slate-800 p-6 flex flex-col justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-10">
                        <Briefcase className="text-blue-500" size={32}/>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Finanças</h1>
                    </div>
                    
                    <nav className="space-y-2">
                        {/* O link agora é dinâmico, baseado no profileId do URL */}
                        <a href={`/profile/${profileId}`} className="flex items-center gap-3 px-3 py-2 text-white bg-blue-500 rounded-lg">
                            <Home size={20}/>
                            <span>Dashboard</span>
                        </a>
                        <a href="#" className="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                            <CreditCard size={20}/>
                            <span>Lançamentos</span>
                        </a>
                        <a href="#" className="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                            <Tag size={20}/>
                            <span>Categorias</span>
                        </a>
                    </nav>
                </div>
                <div>
                    <button onClick={() => navigate('/')} className="w-full flex items-center gap-3 px-3 py-2 mb-4 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                        <LogOut size={16} />
                        Trocar de Perfil
                    </button>
                    <div className="text-xs text-slate-400 truncate" title={user?.uid}>
                        <UserIcon className="inline w-4 h-4 mr-1"/> Utilizador: {user?.uid.substring(0, 10)}...
                    </div>
                     <a href="#" className="flex items-center gap-3 px-3 py-2 mt-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                        <Settings size={20}/>
                        <span>Configurações</span>
                     </a>
                </div>
            </aside>
            <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
                {children}
            </main>
        </div>
    );
};
