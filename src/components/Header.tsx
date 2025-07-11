// src/components/Header.tsx

import React from 'react';
import { Menu, User as UserIcon } from 'lucide-react';
import { User } from 'firebase/auth';
import { useProfileContext } from '../contexts/ProfileContext';

interface HeaderProps {
    onMenuClick: () => void;
    user: User | null;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick, user }) => {
    const { profile } = useProfileContext();

    return (
        <header className="flex-shrink-0 bg-sidebar border-b border-border">
            <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                    {/* Botão do Menu Hambúrguer para mobile */}
                    <button onClick={onMenuClick} className="lg:hidden text-text-primary">
                        <Menu size={24} />
                    </button>
                    <h1 className="text-xl font-semibold text-text-primary hidden sm:block">
                        {profile?.name || 'Dashboard'}
                    </h1>
                </div>

                <div className="flex items-center gap-4">
                     <div className="flex items-center gap-3 text-sm text-text-secondary">
                        <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center">
                            <UserIcon size={18} />
                        </div>
                        <span className="hidden md:inline">{user?.email}</span>
                    </div>
                </div>
            </div>
        </header>
    );
};