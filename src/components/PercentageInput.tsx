import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface PercentageInputProps {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    disabled?: boolean;
}

export const PercentageInput: React.FC<PercentageInputProps> = ({
    value,
    onChange,
    min = 0,
    max = 100,
    disabled = false
}) => {
    const handleIncrement = () => {
        if (value < max && !disabled) {
            onChange(value + 1);
        }
    };

    const handleDecrement = () => {
        if (value > min && !disabled) {
            onChange(value - 1);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (disabled) return;

        let newValue = parseInt(e.target.value, 10);

        if (isNaN(newValue)) {
            newValue = 0;
        }

        if (newValue >= min && newValue <= max) {
            onChange(newValue);
        } else if (newValue > max) {
            onChange(max);
        } else if (newValue < min) {
            onChange(min);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <button
                type="button"
                onClick={handleDecrement}
                disabled={value <= min || disabled}
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
                    disabled={disabled}
                    className="w-full text-center bg-card border border-border-color rounded-lg py-2 px-1 text-text-primary font-medium focus:border-accent focus:ring-1 focus:ring-accent outline-none appearance-none no-spinner disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-text-secondary pointer-events-none hidden sm:block">
                    %
                </span>
            </div>

            <button
                type="button"
                onClick={handleIncrement}
                disabled={value >= max || disabled}
                className="p-2 rounded-lg border border-border-color bg-card hover:bg-background disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-text-secondary hover:text-text-primary"
            >
                <Plus size={16} />
            </button>
        </div>
    );
};
