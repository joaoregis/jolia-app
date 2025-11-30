// src/components/IconPicker.tsx

import React from 'react';
import { Icon, iconNames } from './Icon';

interface IconPickerProps {
    selectedIcon: string;
    onSelect: (iconName: string) => void;
}

export const IconPicker: React.FC<IconPickerProps> = ({ selectedIcon, onSelect }) => {
    return (
        <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Escolha um Ícone
            </label>
            <div className="grid grid-cols-6 sm:grid-cols-10 gap-2 rounded-lg bg-[var(--background)] border border-[var(--border)] p-3">
                {iconNames.map(name => (
                    <button
                        key={name}
                        type="button"
                        onClick={() => onSelect(name)}
                        className={`flex items-center justify-center p-2 rounded-md transition-colors ${selectedIcon === name
                                ? 'bg-[var(--accent)] text-white'
                                : 'text-[var(--text-secondary)] hover:bg-[var(--card)] hover:text-[var(--text-primary)]'
                            }`}
                        aria-label={`Selecionar ícone ${name}`}
                    >
                        <Icon name={name} size={24} />
                    </button>
                ))}
            </div>
        </div>
    );
};
