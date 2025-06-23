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
        <div className="flex h-screen overflow-hidden bg-background font-sans">
            {/* O menu lateral agora usa as variáveis de tema */}
            <aside className="w-64 flex-shrink-0 bg-card p-6 flex flex-col justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-10">
                        <Briefcase className="text-accent h-8 w-8" />
                        <h1 className="text-2xl font-bold text-text-primary">Finanças</h1>
                    </div>
                    
                    <nav className="space-y-2">
                        <a href={`/profile/${profileId}`} className="flex items-center gap-3 px-3 py-2 text-white bg-accent rounded-lg">
                            <Home size={20}/>
                            <span>Dashboard</span>
                        </a>
                        <a href="#" className="flex items-center gap-3 px-3 py-2 text-text-secondary hover:bg-background rounded-lg">
                            <CreditCard size={20}/>
                            <span>Lançamentos</span>
                        </a>
                        <a href="#" className="flex items-center gap-3 px-3 py-2 text-text-secondary hover:bg-background rounded-lg">
                            <Tag size={20}/>
                            <span>Categorias</span>
                        </a>
                    </nav>
                </div>
                
                <div className="space-y-2">
                    <button onClick={() => navigate('/')} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-text-secondary hover:bg-background rounded-lg">
                        <LogOut size={16} />
                        <span>Trocar de Perfil</span>
                    </button>
                    <a href="#" className="w-full flex items-center gap-3 px-3 py-2 text-sm text-text-secondary hover:bg-background rounded-lg">
                        <Settings size={16}/>
                        <span>Configurações</span>
                    </a>
                    <div className="flex items-center gap-3 px-3 py-2 text-xs text-text-secondary border-t border-border-color mt-2 pt-2" title={user?.uid}>
                        <UserIcon className="h-4 w-4 flex-shrink-0"/>
                        <span className="truncate">Utilizador: {user?.uid.substring(0, 10)}...</span>
                    </div>
                </div>
            </aside>
            <main className="flex-1 overflow-y-auto bg-background">
                {children}
            </main>
        </div>
    );
};
