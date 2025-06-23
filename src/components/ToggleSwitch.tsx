// src/components/ToggleSwitch.tsx

import React from 'react';

interface ToggleSwitchProps {
    id: string;
    checked: boolean | undefined;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    name?: string;
    disabled?: boolean;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ id, checked, onChange, name, disabled = false }) => {
    return (
        <label htmlFor={id} className="relative inline-flex items-center cursor-pointer">
            <input 
                type="checkbox" 
                id={id}
                name={name}
                checked={!!checked}
                onChange={onChange}
                disabled={disabled}
                className="sr-only peer"
            />
            <div className="w-11 h-6 bg-border-color rounded-full peer peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/50 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border-color after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent peer-checked:after:translate-x-full peer-checked:after:border-white peer-disabled:opacity-50"></div>
        </label>
    );
};
