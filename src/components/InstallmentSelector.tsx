import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface InstallmentSelectorProps {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
}

export const InstallmentSelector: React.FC<InstallmentSelectorProps> = ({
    value,
    onChange,
    min = 2,
    max = 999
}) => {
    const handleIncrement = () => {
        if (value < max) {
            onChange(value + 1);
        }
    };

    const handleDecrement = () => {
        if (value > min) {
            onChange(value - 1);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = parseInt(e.target.value, 10);
        if (!isNaN(newValue)) {
            if (newValue >= min && newValue <= max) {
                onChange(newValue);
            }
        }
    };

    return (
        <div className="flex items-center gap-2">
            <button
                type="button"
                onClick={handleDecrement}
                disabled={value <= min}
                className="p-2 rounded-lg border border-border-color bg-card hover:bg-background disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-text-secondary hover:text-text-primary"
            >
                <Minus size={16} />
            </button>

            <div className="relative w-20">
                <input
                    type="number"
                    value={value}
                    onChange={handleInputChange}
                    min={min}
                    max={max}
                    className="w-full text-center bg-card border border-border-color rounded-lg py-2 px-1 text-text-primary font-medium focus:border-accent focus:ring-1 focus:ring-accent outline-none appearance-none no-spinner"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-text-secondary pointer-events-none hidden sm:block">
                    x
                </span>
            </div>

            <button
                type="button"
                onClick={handleIncrement}
                disabled={value >= max}
                className="p-2 rounded-lg border border-border-color bg-card hover:bg-background disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-text-secondary hover:text-text-primary"
            >
                <Plus size={16} />
            </button>
        </div>
    );
};
