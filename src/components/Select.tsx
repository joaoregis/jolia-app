import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps {
    value: string;
    onChange: (value: string) => void;
    options: SelectOption[];
    placeholder?: string;
    className?: string;
    icon?: React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({
    value,
    onChange,
    options,
    placeholder = 'Selecione...',
    className = '',
    icon
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const selectedOption = options.find(opt => opt.value === value);

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    w-full flex items-center justify-between gap-2 px-3 py-2 rounded-md border transition-all duration-200
                    ${isOpen ? 'border-accent ring-1 ring-accent' : 'border-border hover:border-accent/50'}
                    bg-background text-text-primary
                `}
            >
                <div className="flex items-center gap-2 truncate">
                    {icon && <span className="text-text-secondary">{icon}</span>}
                    <span className={`truncate ${!selectedOption ? 'text-text-secondary' : ''}`}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                </div>
                <ChevronDown
                    size={16}
                    className={`text-text-secondary transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-md shadow-lg max-h-60 overflow-y-auto animate-zoom-in origin-top">
                    <div className="p-1">
                        {options.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => {
                                    onChange(option.value);
                                    setIsOpen(false);
                                }}
                                className={`
                                    w-full flex items-center justify-between px-3 py-2 text-sm rounded-sm transition-colors
                                    ${option.value === value
                                        ? 'bg-accent/10 text-accent font-medium'
                                        : 'text-text-primary hover:bg-accent/5 hover:text-accent'
                                    }
                                `}
                            >
                                <span className="truncate">{option.label}</span>
                                {option.value === value && <Check size={14} />}
                            </button>
                        ))}
                        {options.length === 0 && (
                            <div className="px-3 py-2 text-sm text-text-secondary text-center">
                                Sem opções
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
