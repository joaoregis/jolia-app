// src/components/MonthSelector.tsx

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Lock } from 'lucide-react';

interface MonthSelectorProps {
    currentMonth: Date;
    availableMonths: string[]; // "YYYY-MM"
    closedMonths: string[];   // "YYYY-MM"
    onMonthSelect: (year: number, month: number) => void;
}

export const MonthSelector: React.FC<MonthSelectorProps> = ({ currentMonth, availableMonths, closedMonths, onMonthSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const formattedCurrentMonth = currentMonth.toLocaleDateString('pt-BR', {
        month: 'long',
        year: 'numeric',
    }).replace(/^\w/, c => c.toUpperCase());
    
    const currentMonthString = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;

    const handleSelect = (monthString: string) => {
        const [year, month] = monthString.split('-').map(Number);
        onMonthSelect(year, month - 1);
        setIsOpen(false);
    };

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);
    
    const sortedAvailableMonths = [...availableMonths].sort((a, b) => b.localeCompare(a));

    return (
        <div className="relative" ref={wrapperRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                // CORREÇÃO: Removido o min-w-[150px] para permitir centralização natural
                className="font-semibold text-center text-text-secondary flex items-center gap-2 hover:text-text-primary transition-colors"
            >
                <span>{formattedCurrentMonth}</span>
                <ChevronDown size={16} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isOpen && (
                <div className="absolute left-1/2 -translate-x-1/2 z-10 mt-2 w-56 origin-top rounded-md bg-card shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-border-color max-h-60 overflow-y-auto">
                    <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="menu-button">
                        {sortedAvailableMonths.map(monthStr => {
                            const [year, monthNum] = monthStr.split('-');
                            const date = new Date(Number(year), Number(monthNum) - 1, 1);
                            const isClosed = closedMonths.includes(monthStr);
                            const isCurrent = monthStr === currentMonthString;
                            const formatted = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase());

                            return (
                                <button
                                    key={monthStr}
                                    onClick={() => handleSelect(monthStr)}
                                    className={`w-full text-left flex items-center justify-between px-4 py-2 text-sm ${
                                        isCurrent 
                                            ? 'bg-accent text-white' 
                                            : 'text-text-primary hover:bg-background'
                                    }`}
                                    role="menuitem"
                                >
                                    <span>{formatted}</span>
                                    {isClosed && <Lock size={12} className={isCurrent ? 'text-white/70' : 'text-text-secondary'} />}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};