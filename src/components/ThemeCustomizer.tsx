// src/components/ThemeCustomizer.tsx

import React, { useState, useEffect, useRef } from 'react';
import { Theme } from '../lib/themes';
import { Card, CardContent, CardHeader, CardTitle } from './Card';
import { useToast } from '../contexts/ToastContext';

interface ThemeCustomizerProps {
    customTheme: Theme['variables'];
    onThemeChange: (newTheme: Theme['variables']) => void;
}

const colorVariables: Array<{ key: keyof Theme['variables'], label: string }> = [
    { key: '--background', label: 'Fundo Principal' },
    { key: '--sidebar', label: 'Fundo do Layout' },
    { key: '--card', label: 'Fundo do Card' },
    { key: '--table-header', label: 'Fundo Tabela' },
    { key: '--text-primary', label: 'Texto Principal' },
    { key: '--text-secondary', label: 'Texto Secundário' },
    { key: '--accent', label: 'Cor de Destaque' },
    { key: '--accent-hover', label: 'Destaque (Hover)' },
    { key: '--border', label: 'Cor da Borda' },
];

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
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {colorVariables.map(({ key, label }) => (
                        <div key={key} onContextMenu={(e) => handleContextMenu(e, key)}>
                            <label htmlFor={key} className="block text-sm font-medium text-text-secondary">
                                {label}
                            </label>
                            <input
                                id={key}
                                type="color"
                                value={customTheme[key]}
                                onChange={(e) => handleColorChange(key, e.target.value)}
                                className="mt-1 h-10 w-full block border-none cursor-pointer rounded-md"
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
                <div style={{ ...customTheme as React.CSSProperties, transition: 'background-color 0.3s, color 0.3s', backgroundColor: 'var(--background)' }} className="p-4 rounded-lg border border-border">
                     <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle>Exemplo de Card</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-text-primary">Este é um texto principal de exemplo.</p>
                            <p className="text-text-secondary text-sm">Este é um texto secundário para mostrar o contraste.</p>
                            <div className="flex gap-4">
                                <button
                                    className="px-4 py-2 text-sm font-medium text-white rounded-lg"
                                    style={{ backgroundColor: customTheme['--accent'] }}
                                >
                                    Botão Principal
                                </button>
                                 <button
                                    className="px-4 py-2 text-sm font-medium rounded-lg"
                                    style={{
                                        backgroundColor: customTheme['--card'],
                                        color: customTheme['--text-primary'],
                                        border: `1px solid ${customTheme['--border']}`
                                    }}
                                >
                                    Botão Secundário
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};