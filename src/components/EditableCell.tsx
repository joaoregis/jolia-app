// src/components/EditableCell.tsx

import React, { useState, useEffect } from 'react';
import { Check, X, Edit2 } from 'lucide-react';
import { formatCurrency } from '../lib/utils.ts';
import { CurrencyInput } from './CurrencyInput.tsx'; 

interface EditableCellProps {
    value: string | number;
    onSave: (newValue: string | number) => void;
    type?: 'text' | 'number';
    formatAsCurrency?: boolean;
    disabled?: boolean;
}

export const EditableCell: React.FC<EditableCellProps> = ({ value, onSave, type = 'text', formatAsCurrency = false, disabled = false }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [currentValue, setCurrentValue] = useState(value);

    useEffect(() => {
        setCurrentValue(value);
    }, [value]);

    const handleSave = () => {
        const newValue = formatAsCurrency ? Number(currentValue) || 0 : currentValue;
        onSave(newValue);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setCurrentValue(value);
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleSave();
        if (e.key === 'Escape') handleCancel();
    };

    if (isEditing && !disabled) {
        return (
            // --- MELHORIA: Aumenta o gap para melhor espaçamento ---
            <div className="flex items-center gap-2 w-full"> 
                {formatAsCurrency ? (
                    // --- MELHORIA: Passa a prop 'size' para diminuir o campo ---
                    <CurrencyInput
                        value={Number(currentValue)}
                        onValueChange={(newValue) => setCurrentValue(newValue)}
                        onBlur={handleSave}
                        onKeyDown={handleKeyDown}
                        autoFocus
                        size="small" 
                    />
                ) : (
                    <input
                        type={type}
                        value={String(currentValue)}
                        onChange={(e) => setCurrentValue(e.target.value)}
                        autoFocus
                        onBlur={handleSave}
                        onKeyDown={handleKeyDown}
                        className="w-full bg-slate-100 dark:bg-slate-700 p-2 rounded border border-blue-500"
                    />
                )}
                 <button onClick={handleSave} className="p-2 text-green-500 hover:bg-green-100 dark:hover:bg-green-900/50 rounded-full"><Check size={16} /></button>
                 <button onClick={handleCancel} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full"><X size={16} /></button>
            </div>
        );
    }

    return (
        <div className="group relative w-full h-full flex items-center">
            <span className="block w-full whitespace-nowrap overflow-hidden text-ellipsis">
                {formatAsCurrency ? formatCurrency(Number(value)) : value}
            </span>
            {!disabled && (
                <button
                    onClick={() => setIsEditing(true)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 p-1 rounded-full bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                >
                    <Edit2 size={12} />
                </button>
            )}
        </div>
    );
};
