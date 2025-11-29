// src/components/CurrencyInput.tsx

import React, { ChangeEvent, useEffect, useState } from 'react';

interface CurrencyInputProps {
    value: number;
    onValueChange: (value: number) => void;
    size?: 'normal' | 'large' | 'small';
    max?: number;
    className?: string;
    [key: string]: any;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
    value,
    onValueChange,
    size = 'normal',
    max,
    className,
    ...props
}) => {
    const [displayValue, setDisplayValue] = useState('');

    useEffect(() => {
        setDisplayValue(formatValue(value));
    }, [value]);

    const formatValue = (val: number) => {
        if (val === 0) return '0,00';
        return new Intl.NumberFormat('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(val);
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        let inputValue = e.target.value;

        // Remove non-numeric characters
        const numericValue = inputValue.replace(/\D/g, '');

        // Convert to number (divide by 100 for cents)
        let numberValue = Number(numericValue) / 100;

        if (max !== undefined && numberValue > max) {
            numberValue = max;
        }

        onValueChange(numberValue);
    };

    const isSmall = size === 'small';
    const containerClasses = "relative group w-full";
    const symbolClasses = `absolute top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-accent transition-colors pointer-events-none ${isSmall ? 'left-2 text-xs' : 'left-4 text-lg'}`;
    const inputClasses = `w-full bg-card font-semibold rounded-lg border-2 border-border-color focus:border-accent focus:ring-0 transition-colors text-text-primary ${isSmall ? 'p-1.5 pl-7 text-sm' : 'p-4 pl-12 text-2xl'} ${className || ''}`;

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