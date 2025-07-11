// src/components/ThemeCustomizer.tsx

import React from 'react';
import { Theme } from '../lib/themes';
import { Card, CardContent, CardHeader, CardTitle } from './Card';

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

export const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({ customTheme, onThemeChange }) => {

    const handleColorChange = (key: keyof Theme['variables'], value: string) => {
        onThemeChange({ ...customTheme, [key]: value });
    };

    return (
        <div className="space-y-6">
            <div>
                <h4 className="text-lg font-medium text-text-primary mb-3">Cores Personalizadas</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {colorVariables.map(({ key, label }) => (
                        <div key={key}>
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