// src/components/DateInput.tsx

import React from 'react';
import { Calendar } from 'lucide-react';

interface DateInputProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    name: string;
    id: string;
    required?: boolean;
}

const formatDateForDisplay = (dateString: string): string => {
    if (!dateString || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return 'Selecione uma data';
    }
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
};

export const DateInput: React.FC<DateInputProps> = ({ value, onChange, name, id, required }) => {
    const dateInputRef = React.useRef<HTMLInputElement>(null);

    const handleButtonClick = () => {
        try {
            dateInputRef.current?.showPicker();
        } catch (error) {
            console.error("Este navegador não suporta 'showPicker()'.", error);
        }
    };

    return (
        <div className="relative mt-1">
            <button
                type="button"
                onClick={handleButtonClick}
                className="w-full flex justify-between items-center rounded-md border border-border-color shadow-sm bg-card px-3 py-3 text-left focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
            >
                <span className="text-text-primary">{formatDateForDisplay(value)}</span>
                <Calendar className="h-5 w-5 text-text-secondary" />
            </button>

            <input
                ref={dateInputRef}
                type="date"
                id={id}
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                className="opacity-0 absolute top-0 left-0 w-full h-full pointer-events-none"
            />
        </div>
    );
};
