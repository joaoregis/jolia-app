// src/components/ThemeCustomizer.tsx

import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import ReactDOM from 'react-dom';
import { Theme } from '../lib/themes';
import { Card, CardContent } from './Card';
import { useToast } from '../contexts/ToastContext';
import { Info, Briefcase, Home, ChevronRight, ArrowUpDown } from 'lucide-react';

interface ThemeCustomizerProps {
    customTheme: Theme['variables'];
    onThemeChange: (newTheme: Theme['variables']) => void;
}

const colorVariables: Array<{ key: keyof Theme['variables'], label: string, description: string }> = [
    { key: '--background', label: 'Fundo Principal', description: 'A cor de fundo principal do conteúdo da página.' },
    { key: '--sidebar', label: 'Layout (Sidebar/Header)', description: 'A cor de fundo da barra lateral e do cabeçalho.' },
    { key: '--card', label: 'Cards e Elementos', description: 'A cor de fundo para cards, modais e outros elementos elevados.' },
    { key: '--table-header', label: 'Cabeçalho da Tabela', description: 'A cor de fundo para o cabeçalho das tabelas.' },
    { key: '--table-footer', label: 'Rodapé da Tabela', description: 'A cor de fundo para o rodapé (total) das tabelas.' },
    { key: '--table-header-text', label: 'Texto Cabeçalho Tabela', description: 'Cor do texto no cabeçalho das tabelas.' },
    { key: '--table-footer-text', label: 'Texto Rodapé Tabela', description: 'Cor do texto no rodapé das tabelas.' },
    { key: '--text-primary', label: 'Texto Principal', description: 'A cor primária para textos, usada em títulos e conteúdos importantes.' },
    { key: '--text-secondary', label: 'Texto Secundário', description: 'A cor para textos de menor destaque, como legendas e valores secundários.' },
    { key: '--sidebar-text-primary', label: 'Texto do Layout', description: 'A cor primária para textos na barra lateral e cabeçalho.' },
    { key: '--sidebar-text-secondary', label: 'Texto Secundário do Layout', description: 'A cor secundária para textos na barra lateral e cabeçalho.' },
    { key: '--accent', label: 'Destaque (Accent)', description: 'A cor principal para botões, links e elementos ativos.' },
    { key: '--accent-hover', label: 'Destaque (Hover)', description: 'A cor de destaque ao passar o mouse sobre elementos interativos.' },
    { key: '--border', label: 'Bordas e Divisórias', description: 'A cor para bordas, linhas e separadores de conteúdo.' },
];

const Tooltip: React.FC<{ content: string, children: React.ReactNode }> = ({ content, children }) => {
    const triggerRef = useRef<HTMLDivElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useLayoutEffect(() => {
        if (isVisible && triggerRef.current && tooltipRef.current) {
            const { top, left, width } = triggerRef.current.getBoundingClientRect();
            const { width: tooltipWidth } = tooltipRef.current.getBoundingClientRect();
            
            tooltipRef.current.style.left = `${left + window.scrollX + width / 2 - tooltipWidth / 2}px`;
            tooltipRef.current.style.top = `${top + window.scrollY - tooltipRef.current.offsetHeight - 8}px`;
        }
    }, [isVisible]);

    return (
        <div ref={triggerRef} onMouseEnter={() => setIsVisible(true)} onMouseLeave={() => setIsVisible(false)} className="relative flex items-center">
            {children}
            {isVisible && ReactDOM.createPortal(
                <div ref={tooltipRef} className="fixed bg-sidebar text-sidebar-text-primary text-xs rounded py-1 px-2 z-[60] shadow-lg pointer-events-none animate-fade-in">
                    {content}
                </div>,
                document.body
            )}
        </div>
    );
};

const ColorContextMenu: React.FC<{
    x: number;
    y: number;
    onCopy: () => void;
    onPaste: () => void;
    onClose: () => void;
}> = ({ x, y, onCopy, onPaste, onClose }) => {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    return (
        <div
            ref={menuRef}
            className="absolute z-50 w-32 rounded-md shadow-lg bg-card ring-1 ring-black ring-opacity-5 border border-border"
            style={{ top: y, left: x }}
        >
            <div className="py-1">
                <button type="button" onClick={onCopy} className="w-full text-left px-4 py-2 text-sm text-text-secondary hover:bg-background">Copiar</button>
                <button type="button" onClick={onPaste} className="w-full text-left px-4 py-2 text-sm text-text-secondary hover:bg-background">Colar</button>
            </div>
        </div>
    );
};


const normalizeHexColor = (colorString: string): string | null => {
    const str = colorString.trim().replace(/^#/, '');

    if (/^[0-9a-f]{6}$/i.test(str)) {
        return `#${str.toLowerCase()}`;
    }

    if (/^[0-9a-f]{3}$/i.test(str)) {
        return `#${str.split('').map(char => char + char).join('').toLowerCase()}`;
    }

    return null;
}


export const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({ customTheme, onThemeChange }) => {
    const { showToast } = useToast();
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; key: keyof Theme['variables'] } | null>(null);

    const handleColorChange = (key: keyof Theme['variables'], value: string) => {
        onThemeChange({ ...customTheme, [key]: value });
    };

    const handleContextMenu = (e: React.MouseEvent, key: keyof Theme['variables']) => {
        e.preventDefault();
        setContextMenu({ x: e.pageX, y: e.pageY, key });
    };

    const handleCopy = () => {
        if (contextMenu) {
            const colorToCopy = customTheme[contextMenu.key];
            navigator.clipboard.writeText(colorToCopy).then(() => {
                showToast(`Cor ${colorToCopy} copiada!`, 'success');
            }).catch(() => {
                showToast('Falha ao copiar a cor.', 'error');
            });
            setContextMenu(null);
        }
    };

    const handlePaste = async () => {
        if (contextMenu) {
            try {
                const text = await navigator.clipboard.readText();
                const validHexColor = normalizeHexColor(text);

                if (validHexColor) {
                    handleColorChange(contextMenu.key, validHexColor);
                    showToast(`Cor "${text}" colada com sucesso!`, 'success');
                } else {
                    showToast(`"${text.substring(0, 10) + (text.length > 10 ? "..." : "")}" não é um formato HEX válido.`, 'error');
                }
            } catch (error) {
                showToast('Não foi possível ler da área de transferência.', 'error');
                console.error('Clipboard paste error:', error);
            }
            setContextMenu(null);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h4 className="text-lg font-medium text-text-primary mb-3">Cores Personalizadas</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-5">
                    {colorVariables.map(({ key, label, description }) => (
                        <div key={key} onContextMenu={(e) => handleContextMenu(e, key)}>
                            <div className="flex items-center gap-2 mb-1">
                                <label htmlFor={key} className="block text-sm font-medium text-text-secondary">
                                    {label}
                                </label>
                                <Tooltip content={description}>
                                    <Info size={14} className="text-text-secondary/70" />
                                </Tooltip>
                            </div>
                            <input
                                id={key}
                                type="color"
                                value={customTheme[key]}
                                onChange={(e) => handleColorChange(key, e.target.value)}
                                className="h-10 w-full block border-none cursor-pointer rounded-md"
                                style={{ backgroundColor: customTheme[key] }}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {contextMenu && (
                <ColorContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    onCopy={handleCopy}
                    onPaste={handlePaste}
                    onClose={() => setContextMenu(null)}
                />
            )}

            <div>
                <h4 className="text-lg font-medium text-text-primary mb-3">Pré-visualização</h4>
                <div style={customTheme as React.CSSProperties} className="p-4 rounded-lg border border-border bg-background">
                    <div className="flex h-64 rounded-md overflow-hidden">
                        {/* Sidebar Preview */}
                        <div className="w-1/4 bg-sidebar p-3 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-2">
                                    <Briefcase className="text-accent" size={24}/>
                                    <h1 className="text-lg font-bold text-sidebar-text-primary">Jolia</h1>
                                </div>
                                <div className="mt-6 space-y-2">
                                    <div className="flex items-center gap-2 p-2 rounded bg-accent text-white">
                                        <Home size={16}/>
                                        <span className="text-sm">Dashboard</span>
                                    </div>
                                    <p className="text-sm text-sidebar-text-secondary p-2">Menu Item</p>
                                </div>
                            </div>
                            <p className="text-xs text-sidebar-text-secondary">Trocar Perfil</p>
                        </div>
                        {/* Content Preview */}
                        <div className="w-3/4 flex flex-col">
                            <div className="bg-sidebar p-3 border-b border-border flex justify-between items-center">
                                <div className="flex items-center gap-1.5 text-sm text-sidebar-text-secondary">
                                    <span>Nossa Casa</span> <ChevronRight size={14}/> <span>Finanças</span>
                                </div>
                                <div className="w-6 h-6 rounded-full bg-background"></div>
                            </div>
                            <div className="p-4 flex-grow bg-background space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <Card className="shadow-md"><CardContent><p className="text-text-primary font-bold text-lg">R$ 1.234,56</p><p className="text-text-secondary text-xs">Receitas</p></CardContent></Card>
                                    <Card className="shadow-md"><CardContent><p className="text-text-primary font-bold text-lg">R$ 789,10</p><p className="text-text-secondary text-xs">Despesas</p></CardContent></Card>
                                </div>
                                <Card className="shadow-md">
                                    <table className="w-full text-left text-xs">
                                        <thead className="text-table-header-text bg-table-header">
                                            <tr>
                                                <th className="p-2">Descrição <ArrowUpDown size={10} className="inline"/></th>
                                                <th className="p-2">Valor</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr className="border-b border-border"><td className="p-2 text-text-primary">Salário</td><td className="p-2 text-text-secondary">R$ 5.000,00</td></tr>
                                            <tr><td className="p-2 text-text-primary">Aluguel</td><td className="p-2 text-text-secondary">- R$ 1.500,00</td></tr>
                                        </tbody>
                                        <tfoot className="font-bold bg-table-footer text-table-footer-text">
                                            <tr><td className="p-2">TOTAL</td><td className="p-2">R$ 3.500,00</td></tr>
                                        </tfoot>
                                    </table>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
             <style>{` @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } } .animate-fade-in { animation: fade-in 0.2s ease-out forwards; } `}</style>
        </div>
    );
};