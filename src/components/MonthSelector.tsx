// src/components/MonthSelector.tsx

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Lock } from 'lucide-react';

interface MonthSelectorProps {
    currentMonth: Date;
    availableMonths: string[]; // "YYYY-MM"
    closedMonths: string[];   // "YYYY-MM"
    onMonthSelect: (year: number, month: number | null) => void;
    allowYearSelection?: boolean;
}

export const MonthSelector: React.FC<MonthSelectorProps> = ({
    currentMonth,
    availableMonths,
    closedMonths,
    onMonthSelect,
    allowYearSelection = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [expandedYears, setExpandedYears] = useState<Set<string>>(new Set());
    const wrapperRef = useRef<HTMLDivElement>(null);

    const formattedCurrentMonth = useMemo(() => {
        return currentMonth.toLocaleDateString('pt-BR', {
            month: 'long',
            year: 'numeric',
        }).replace(/^\w/, c => c.toUpperCase());
    }, [currentMonth]);

    const currentMonthString = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;

    useEffect(() => {
        if (isOpen) {
            setExpandedYears(new Set([String(currentMonth.getFullYear())]));
        }
    }, [isOpen, currentMonth]);

    const handleSelect = (monthString: string) => {
        const [year, month] = monthString.split('-').map(Number);
        onMonthSelect(year, month - 1);
        setIsOpen(false);
    };

    const handleYearSelect = (year: number) => {
        onMonthSelect(year, null);
        setIsOpen(false);
    };

    const toggleYear = (year: string) => {
        setExpandedYears(prev => {
            const isAlreadyOpen = prev.has(year);
            if (isAlreadyOpen) {
                return new Set();
            } else {
                return new Set([year]);
            }
        });
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

    const groupedMonths = useMemo(() => {
        const sorted = [...availableMonths].sort((a, b) => b.localeCompare(a));
        return sorted.reduce((acc, monthStr) => {
            const year = monthStr.substring(0, 4);
            if (!acc[year]) {
                acc[year] = [];
            }
            acc[year].push(monthStr);
            return acc;
        }, {} as Record<string, string[]>);
    }, [availableMonths]);

    const sortedYears = useMemo(() => Object.keys(groupedMonths).sort((a, b) => b.localeCompare(a)), [groupedMonths]);

    return (
        <div className="relative" ref={wrapperRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="font-semibold text-center text-text-secondary flex items-center gap-2 hover:text-text-primary transition-colors"
            >
                <span>{formattedCurrentMonth}</span>
                <ChevronDown size={16} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute left-1/2 -translate-x-1/2 z-10 mt-2 w-56">
                    <div className="w-full origin-top rounded-md bg-card shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-border-color max-h-60 overflow-y-auto animate-zoom-in">
                        <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="menu-button">
                            {sortedYears.map(year => (
                                <div key={year} className="overflow-hidden">
                                    <button
                                        onClick={() => toggleYear(year)}
                                        className="w-full flex items-center justify-between px-4 pt-2 pb-1 text-sm font-bold text-accent hover:opacity-80 transition-opacity"
                                    >
                                        <span>{year}</span>
                                        <ChevronDown size={16} className={`transition-transform duration-300 text-text-secondary ${expandedYears.has(year) ? 'rotate-180' : ''}`} />
                                    </button>
                                    <div className={`transition-[max-height,padding] duration-300 ease-in-out overflow-hidden ${expandedYears.has(year) ? 'max-h-96 pb-2' : 'max-h-0'}`}>
                                        <div className="pl-4">
                                            {allowYearSelection && (
                                                <button
                                                    onClick={() => handleYearSelect(Number(year))}
                                                    className="w-full text-left flex items-center justify-between px-4 py-2 text-sm rounded-md text-text-primary hover:bg-background font-medium mb-1"
                                                >
                                                    <span>Todo o ano de {year}</span>
                                                </button>
                                            )}
                                            {groupedMonths[year].map(monthStr => {
                                                const [yearNum, monthNum] = monthStr.split('-');
                                                const date = new Date(Number(yearNum), Number(monthNum) - 1, 1);
                                                const isClosed = closedMonths.includes(monthStr);
                                                const isCurrent = monthStr === currentMonthString;
                                                const formatted = date.toLocaleDateString('pt-BR', { month: 'long' }).replace(/^\w/, c => c.toUpperCase());

                                                return (
                                                    <button
                                                        key={monthStr}
                                                        onClick={() => handleSelect(monthStr)}
                                                        className={`w-full text-left flex items-center justify-between px-4 py-2 text-sm rounded-md ${isCurrent
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
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};