// src/components/ToggleSwitch.tsx

import React from 'react';

interface ToggleSwitchProps {
    id: string;
    checked: boolean | undefined;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    name?: string;
    disabled?: boolean;
}

/**
 * Um componente de interruptor (toggle) estilizado,
 * que funciona como um substituto para um checkbox.
 */
export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ id, checked, onChange, name, disabled = false }) => {
    return (
        <label htmlFor={id} className="relative inline-flex items-center cursor-pointer">
            <input 
                type="checkbox" 
                id={id}
                name={name}
                checked={checked} 
                onChange={onChange}
                disabled={disabled}
                className="sr-only peer" // Esconde o checkbox padrão, mas o mantém acessível
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600 peer-disabled:opacity-50"></div>
        </label>
    );
};
