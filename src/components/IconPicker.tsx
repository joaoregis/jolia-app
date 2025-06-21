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
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                Escolha um Ícone
            </label>
            <div className="grid grid-cols-6 sm:grid-cols-10 gap-2 rounded-lg bg-slate-100 dark:bg-slate-900/50 p-3">
                {iconNames.map(name => (
                    <button
                        key={name}
                        type="button"
                        onClick={() => onSelect(name)}
                        className={`flex items-center justify-center p-2 rounded-md transition-colors ${
                            selectedIcon === name 
                                ? 'bg-blue-500 text-white' 
                                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
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
