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
    const { profileId } = useParams<{ profileId: string }>();

    return (
        <div className="flex h-screen overflow-hidden bg-slate-100 dark:bg-slate-900 font-sans">
            <aside className="w-64 flex-shrink-0 bg-white dark:bg-slate-800 p-6 flex flex-col justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-10">
                        <Briefcase className="text-blue-500 h-8 w-8" />
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Finanças</h1>
                    </div>
                    
                    <nav className="space-y-2">
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
                
                {/* --- MELHORIA: Contêiner para os itens inferiores do menu com espaçamento consistente --- */}
                <div className="space-y-2">
                    <button onClick={() => navigate('/')} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                        <LogOut size={16} />
                        <span>Trocar de Perfil</span>
                    </button>
                    <a href="#" className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                        <Settings size={16}/>
                        <span>Configurações</span>
                    </a>
                    {/* --- MELHORIA: Alinhamento e estilo consistentes para o texto do utilizador --- */}
                    <div className="flex items-center gap-3 px-3 py-2 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700 mt-2 pt-2" title={user?.uid}>
                        <UserIcon className="h-4 w-4 flex-shrink-0"/>
                        <span className="truncate">Utilizador: {user?.uid.substring(0, 10)}...</span>
                    </div>
                </div>
            </aside>
            <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
                {children}
            </main>
        </div>
    );
};
