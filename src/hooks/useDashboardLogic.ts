import { useState, useCallback, useEffect, useMemo } from 'react';
import { SortConfig, FilterConfig, GroupBy, Transaction, Profile } from '../types';

const SORT_CONFIG_STORAGE_KEY = 'jolia_sort_config';

export function useDashboardLogic(
    profile: Profile | null,
    availableMonths: string[],
    monthsLoading: boolean
) {
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
    const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
    const [filterConfig, setFilterConfig] = useState<FilterConfig>({});
    const [groupBy, setGroupBy] = useState<GroupBy>('none');
    const [isInitialMonthSet, setIsInitialMonthSet] = useState(false);

    // Selection States
    const [selectedIncomeIds, setSelectedIncomeIds] = useState<Set<string>>(new Set());
    const [selectedExpenseIds, setSelectedExpenseIds] = useState<Set<string>>(new Set());
    const [selectedIgnoredIds, setSelectedIgnoredIds] = useState<Set<string>>(new Set());

    // Initialize Month
    useEffect(() => {
        setIsInitialMonthSet(false);
    }, [profile?.id]);

    useEffect(() => {
        if (isInitialMonthSet || monthsLoading || !profile) return;
        const closedMonthsSet = new Set(profile.closedMonths || []);
        const openMonths = availableMonths.filter(month => !closedMonthsSet.has(month));
        const latestMonth = availableMonths[availableMonths.length - 1];
        const firstOpenMonthStr = openMonths[0] || latestMonth;
        if (firstOpenMonthStr) {
            const [year, month] = firstOpenMonthStr.split('-');
            setCurrentMonth(new Date(Number(year), Number(month) - 1, 1));
        } else {
            setCurrentMonth(new Date());
        }
        setIsInitialMonthSet(true);
    }, [isInitialMonthSet, monthsLoading, availableMonths, profile]);

    // Initialize Sort Config
    useEffect(() => {
        try {
            const savedSortConfig = localStorage.getItem(SORT_CONFIG_STORAGE_KEY);
            if (savedSortConfig) setSortConfig(JSON.parse(savedSortConfig));
            else setSortConfig({ key: 'createdAt', direction: 'descending' });
        } catch {
            setSortConfig({ key: 'createdAt', direction: 'descending' });
        }
    }, []);

    useEffect(() => {
        if (sortConfig) localStorage.setItem(SORT_CONFIG_STORAGE_KEY, JSON.stringify(sortConfig));
    }, [sortConfig]);

    // Handlers
    const changeMonth = useCallback((amount: number) => {
        setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + amount, 1));
    }, []);

    const handleMonthSelect = useCallback((year: number, month: number) => {
        setCurrentMonth(new Date(year, month, 1));
    }, []);

    const requestSort = useCallback((key: keyof Transaction) => {
        setSortConfig(prev => ({
            key,
            direction: prev?.key === key && prev.direction === 'ascending' ? 'descending' : 'ascending'
        }));
    }, []);

    const createSelectionHandler = useCallback((setter: React.Dispatch<React.SetStateAction<Set<string>>>) => (id: string, checked: boolean) => {
        setter(prev => {
            const newSet = new Set(prev);
            if (checked) newSet.add(id);
            else newSet.delete(id);
            return newSet;
        });
    }, []);

    const createSelectAllHandler = useCallback((setter: React.Dispatch<React.SetStateAction<Set<string>>>, data: Transaction[]) => (checked: boolean) => {
        if (checked) setter(new Set(data.map(item => item.id)));
        else setter(new Set());
    }, []);

    const handleClearAllSelections = useCallback(() => {
        setSelectedIncomeIds(new Set());
        setSelectedExpenseIds(new Set());
        setSelectedIgnoredIds(new Set());
    }, []);

    // Reset selections on month/tab change (handled in component effect usually, but we can expose a resetter)
    const resetSelections = useCallback(() => {
        setSelectedIncomeIds(new Set());
        setSelectedExpenseIds(new Set());
        setSelectedIgnoredIds(new Set());
    }, []);

    const handlers = useMemo(() => ({
        changeMonth,
        handleMonthSelect,
        requestSort,
        createSelectionHandler,
        createSelectAllHandler,
        handleClearAllSelections,
        resetSelections
    }), [changeMonth, handleMonthSelect, requestSort, createSelectionHandler, createSelectAllHandler, handleClearAllSelections, resetSelections]);

    const setters = useMemo(() => ({
        setSortConfig,
        setFilterConfig,
        setGroupBy,
        setSelectedIncomeIds,
        setSelectedExpenseIds,
        setSelectedIgnoredIds
    }), []);

    return {
        state: {
            currentMonth,
            sortConfig,
            filterConfig,
            groupBy,
            isInitialMonthSet,
            selectedIncomeIds,
            selectedExpenseIds,
            selectedIgnoredIds
        },
        setters,
        handlers
    };
}
