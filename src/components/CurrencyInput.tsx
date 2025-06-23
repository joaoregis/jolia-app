// src/components/CurrencyInput.tsx

import React from 'react';

interface CurrencyInputProps {
    value: number;
    onValueChange: (value: number) => void;
    autoFocus?: boolean;
    onBlur?: () => void;
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    size?: 'normal' | 'small';
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({ value, onValueChange, size = 'normal', ...props }) => {
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/\D/g, '');
        const newValue = Number(rawValue) / 100;
        onValueChange(newValue);
    };

    const displayValue = new Intl.NumberFormat('pt-BR', {
        style: 'decimal',
        minimumFractionDigits: 2,
    }).format(value);

    const isSmall = size === 'small';
    const containerClasses = "relative group w-full";
    const symbolClasses = `absolute top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-accent transition-colors pointer-events-none ${isSmall ? 'left-3 text-sm' : 'left-4 text-lg'}`;
    const inputClasses = `w-full bg-card font-semibold rounded-lg border-2 border-border-color focus:border-accent focus:ring-0 transition-colors text-text-primary ${isSmall ? 'p-2 pl-9 text-base' : 'p-4 pl-12 text-2xl'}`;

    return (
        <div className={containerClasses}>
            <span className={symbolClasses}>
                R$
            </span>
            <input
                type="text"
                inputMode="decimal"
                value={displayValue}
                onChange={handleInputChange}
                className={inputClasses}
                {...props}
            />
        </div>
    );
};
