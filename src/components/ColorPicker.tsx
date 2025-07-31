// src/components/ColorPicker.tsx

import React from 'react';

interface ColorPickerProps {
    selectedColor: string;
    onSelect: (color: string) => void;
}

const colors = [
    '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#10b981',
    '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6',
    '#a855f7', '#d946ef', '#ec4899', '#f43f5e'
];

export const ColorPicker: React.FC<ColorPickerProps> = ({ selectedColor, onSelect }) => {
    return (
        <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
                Cor do Rótulo
            </label>
            <div className="grid grid-cols-8 gap-2">
                {colors.map(color => (
                    <button
                        key={color}
                        type="button"
                        onClick={() => onSelect(color)}
                        className={`w-full h-8 rounded-md transition-transform transform hover:scale-110 ${selectedColor === color ? 'ring-2 ring-offset-2 ring-accent ring-offset-card' : ''}`}
                        style={{ backgroundColor: color }}
                        aria-label={`Selecionar cor ${color}`}
                    />
                ))}
            </div>
        </div>
    );
};