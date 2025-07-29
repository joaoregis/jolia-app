// src/components/EditableCell.tsx

import React, { useState, useEffect } from 'react';
import { Check, X, Edit2 } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { CurrencyInput } from './CurrencyInput';

interface EditableCellProps {
    value: string | number;
    onSave: (newValue: string | number) => void;
    type?: 'text' | 'number';
    formatAsCurrency?: boolean;
    disabled?: boolean;
    className?: string;
}

export const EditableCell: React.FC<EditableCellProps> = ({ value, onSave, type = 'text', formatAsCurrency = false, disabled = false, className }) => {
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
            <div className="flex items-center gap-2 w-full"> 
                {formatAsCurrency ? (
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
                        className="w-full bg-background text-text-primary p-2 rounded border border-accent"
                    />
                )}
                 <button onClick={handleSave} className="p-1 text-green-500 hover:bg-green-100 dark:hover:bg-green-900/50 rounded-full"><Check size={16} /></button>
                 <button onClick={handleCancel} className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full"><X size={16} /></button>
            </div>
        );
    }

    return (
        <div className={`group relative w-full h-full flex items-center ${className}`}>
            <span className="block w-full whitespace-nowrap overflow-hidden text-ellipsis">
                {formatAsCurrency ? formatCurrency(Number(value)) : value}
            </span>
            {!disabled && (
                <button
                    onClick={() => setIsEditing(true)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 p-1 rounded-full bg-background text-text-secondary opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                >
                    <Edit2 size={12} />
                </button>
            )}
        </div>
    );
};