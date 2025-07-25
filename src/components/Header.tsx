// src/components/Header.tsx

import React, { useMemo } from 'react';
import { Menu, User as UserIcon, ChevronRight } from 'lucide-react';
import { User } from 'firebase/auth';
import { useProfileContext } from '../hooks/useProfileContext';
import { useLocation, useParams } from 'react-router-dom';

interface HeaderProps {
    onMenuClick: () => void;
    user: User | null;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick, user }) => {
    const { profile } = useProfileContext();
    const { subprofileId } = useParams();
    const location = useLocation();

    const breadcrumb = useMemo(() => {
        if (!profile) return 'Dashboard';

        const parts: React.ReactNode[] = [<span key="profile">{profile.name}</span>];
        
        if (location.pathname.includes('/wishlist')) {
            parts.push(<ChevronRight key="sep1" size={16} />);
            parts.push(<span key="page">Lista de Desejos</span>);
        } else {
            parts.push(<ChevronRight key="sep1" size={16} />);
            parts.push(<span key="page">Finanças</span>);
        }

        if (subprofileId) {
            const subprofile = profile.subprofiles.find(s => s.id === subprofileId);
            if (subprofile) {
                parts.push(<ChevronRight key="sep2" size={16} />);
                parts.push(<span key="subprofile">{subprofile.name}</span>);
            }
        }

        return parts;
    }, [profile, subprofileId, location.pathname]);


    return (
        <header className="flex-shrink-0 bg-sidebar border-b border-border">
            <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                    {/* Botão do Menu Hambúrguer para mobile */}
                    <button onClick={onMenuClick} className="lg:hidden text-sidebar-text-primary">
                        <Menu size={24} />
                    </button>
                    <h1 className="text-sm font-semibold text-sidebar-text-secondary hidden sm:flex items-center gap-1.5">
                        {breadcrumb}
                    </h1>
                </div>

                <div className="flex items-center gap-4">
                     <div className="flex items-center gap-3 text-sm text-sidebar-text-secondary">
                        <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center">
                            <UserIcon size={18} className="text-text-secondary"/>
                        </div>
                        <span className="hidden md:inline">{user?.email}</span>
                    </div>
                </div>
            </div>
        </header>
    );
};