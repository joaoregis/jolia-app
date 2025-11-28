// src/components/Layout.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation, Outlet } from 'react-router-dom';
import { User } from 'firebase/auth';
import { Briefcase, Home, LogOut, ChevronLeft, Gift, Settings, Film } from 'lucide-react';
import { Header } from './Header';
import { ProfileProvider } from '../contexts/ProfileContext';

interface LayoutProps {
    user: User | null;
}

const COLLAPSED_STATE_STORAGE_KEY = 'jolia_sidebar_collapsed';

export const Layout: React.FC<LayoutProps> = ({ user }) => {
    const navigate = useNavigate();
    const { profileId, subprofileId } = useParams<{ profileId: string; subprofileId?: string }>();
    const location = useLocation();

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const [isCollapsed, setIsCollapsed] = useState(() => {
        try {
            const savedState = localStorage.getItem(COLLAPSED_STATE_STORAGE_KEY);
            return savedState ? JSON.parse(savedState) : false;
        } catch (error) {
            return false;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(COLLAPSED_STATE_STORAGE_KEY, JSON.stringify(isCollapsed));
        } catch (error) {
            console.error("Erro ao salvar estado do menu no localStorage:", error);
        }
    }, [isCollapsed]);

    const subprofilePath = subprofileId ? `/${subprofileId}` : '';

    const navItems = [
        { href: `/profile/${profileId}${subprofilePath}`, icon: Home, label: 'Controle Financeiro' },
        { href: `/profile/${profileId}/wishlist${subprofilePath}`, icon: Gift, label: 'Lista de Desejos' },
        { href: `/profile/${profileId}/media`, icon: Film, label: 'Entretenimento' },
    ];

    const NavLink: React.FC<{ href: string; icon: React.ElementType; label: string; isActive: boolean; isCollapsed: boolean; }> =
        ({ href, icon: Icon, label, isActive, isCollapsed }) => (
            <a
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                ${isActive ? 'bg-accent text-white' : 'text-sidebar-text-secondary hover:bg-background'}
                ${isCollapsed ? 'justify-center' : ''}
            `}
                title={isCollapsed ? label : undefined}
            >
                <Icon size={20} />
                {!isCollapsed && <span>{label}</span>}
            </a>
        );

    return (
        <ProfileProvider>
            <div className="flex h-screen overflow-hidden bg-background font-sans">
                {isMobileMenuOpen && (
                    <div
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="fixed inset-0 bg-black/60 z-30 lg:hidden"
                        aria-hidden="true"
                    ></div>
                )}

                <aside className={`
                    absolute lg:relative inset-y-0 left-0 z-40 bg-sidebar p-4 flex flex-col justify-between transition-transform duration-300 ease-in-out border-r border-border
                    ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
                    lg:translate-x-0
                    ${isCollapsed ? 'w-20' : 'w-64'}
                `}>
                    <div>
                        <div className={`flex items-center gap-3 mb-10 ${isCollapsed ? 'justify-center' : 'px-2'}`}>
                            <Briefcase className="text-accent h-8 w-8 flex-shrink-0" />
                            {!isCollapsed && <h1 className="text-2xl font-bold text-sidebar-text-primary whitespace-nowrap">Jolia</h1>}
                        </div>

                        <nav className="space-y-2">
                            {navItems.map(item => {
                                const isDashboardRoute = !location.pathname.includes('wishlist') && !location.pathname.includes('settings') && !location.pathname.includes('media');
                                const isWishlistRoute = location.pathname.includes('wishlist');
                                const isMediaRoute = location.pathname.includes('media');

                                let isActive = false;
                                if (item.label === 'Controle Financeiro') {
                                    isActive = isDashboardRoute;
                                } else if (item.label === 'Lista de Desejos') {
                                    isActive = isWishlistRoute;
                                } else if (item.label === 'Entretenimento') {
                                    isActive = isMediaRoute;
                                }

                                return (
                                    <NavLink
                                        key={item.label}
                                        href={item.href}
                                        icon={item.icon}
                                        label={item.label}
                                        isCollapsed={isCollapsed}
                                        isActive={isActive}
                                    />
                                )
                            })}
                        </nav>
                    </div>

                    <div className="space-y-2 border-t border-border pt-4">
                        <NavLink
                            href={`/profile/${profileId}/settings`}
                            icon={Settings}
                            label="Configurações"
                            isCollapsed={isCollapsed}
                            isActive={location.pathname.includes('settings')}
                        />
                        <button onClick={() => navigate('/')} title="Trocar de Perfil" className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm text-sidebar-text-secondary hover:bg-background rounded-lg ${isCollapsed ? 'justify-center' : ''}`}>
                            <LogOut size={20} />
                            {!isCollapsed && <span>Trocar de Perfil</span>}
                        </button>
                    </div>

                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="absolute -right-3 top-16 hidden lg:flex items-center justify-center w-6 h-6 bg-accent text-white rounded-full hover:bg-accent-hover focus:outline-none"
                        title={isCollapsed ? "Expandir menu" : "Recolher menu"}
                    >
                        <ChevronLeft className={`transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} size={16} />
                    </button>
                </aside>

                <div className="flex-1 flex flex-col overflow-hidden">
                    <Header
                        onMenuClick={() => setIsMobileMenuOpen(true)}
                        user={user}
                    />
                    <main id="main-content" className="flex-1 overflow-y-auto bg-background">
                        <Outlet />
                    </main>
                </div>
            </div>
        </ProfileProvider>
    );
};