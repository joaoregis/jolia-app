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

/**
 * Um componente de input que formata o valor como moeda BRL (R$)
 * enquanto o usuário digita.
 */
export const CurrencyInput: React.FC<CurrencyInputProps> = ({ value, onValueChange, size = 'normal', ...props }) => {
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Remove todos os caracteres que não são dígitos
        const rawValue = e.target.value.replace(/\D/g, '');
        // Converte o valor em centavos para um número flutuante
        const newValue = Number(rawValue) / 100;
        // Chama a função do componente pai para atualizar o estado
        onValueChange(newValue);
    };

    // --- CORREÇÃO: Formata o valor apenas como número, sem o símbolo da moeda ---
    const displayValue = new Intl.NumberFormat('pt-BR', {
        style: 'decimal', // Alterado de 'currency' para 'decimal'
        minimumFractionDigits: 2,
    }).format(value);

    const isSmall = size === 'small';
    const containerClasses = "relative group w-full";
    const symbolClasses = `absolute top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500 transition-colors pointer-events-none ${isSmall ? 'left-3 text-sm' : 'left-4 text-lg'}`;
    const inputClasses = `w-full bg-slate-100 dark:bg-slate-900/50 font-semibold rounded-lg border-2 border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-0 transition-colors text-slate-800 dark:text-slate-100 ${isSmall ? 'p-2 pl-9 text-base' : 'p-4 pl-12 text-2xl'}`;

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
