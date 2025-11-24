import { useMemo } from 'react';
import { AppData, Label, Profile, SortConfig, Transaction, FilterConfig } from '../types';
import { filterTransactions, sortTransactions, splitActiveAndIgnoredTransactions } from '../logic/transactionProcessing';
import { calculateApportionmentProportions } from '../logic/mutationLogic';

export function useDashboardData(
    allTransactions: Transaction[],
    profile: Profile | null,
    allLabels: Label[],
    activeTab: string,
    currentMonthString: string,
    sortConfig: SortConfig | null,
    filterConfig: FilterConfig
) {
    const subprofileRevenueProportions = useMemo(() => {
        if (!profile) return new Map<string, number>();
        const activeSubprofiles = profile.subprofiles.filter(s => s.status === 'active');
        if (activeSubprofiles.length === 0) return new Map<string, number>();

        return calculateApportionmentProportions(allTransactions, activeSubprofiles);
    }, [allTransactions, profile]);

    const { activeTransactions, ignoredTransactions } = useMemo(() => {
        return splitActiveAndIgnoredTransactions(allTransactions, currentMonthString);
    }, [allTransactions, currentMonthString]);

    const filteredActiveTransactions = useMemo(() => {
        return filterTransactions(activeTransactions, filterConfig);
    }, [activeTransactions, filterConfig]);

    const filteredData = useMemo<AppData>(() => {
        if (activeTab === 'geral') {
            return {
                receitas: filteredActiveTransactions.filter(t => t.type === 'income' && t.isShared),
                despesas: filteredActiveTransactions.filter(t => t.type === 'expense' && t.isShared)
            };
        }
        return {
            receitas: filteredActiveTransactions.filter(t => t.type === 'income' && t.subprofileId === activeTab),
            despesas: filteredActiveTransactions.filter(t => t.type === 'expense' && t.subprofileId === activeTab)
        };
    }, [filteredActiveTransactions, activeTab]);

    const sortedData = useMemo(() => {
        return {
            receitas: sortTransactions(filteredData.receitas, sortConfig, allLabels),
            despesas: sortTransactions(filteredData.despesas, sortConfig, allLabels)
        };
    }, [filteredData, sortConfig, allLabels]);

    return {
        sortedData,
        ignoredTransactions,
        subprofileRevenueProportions,
        activeTransactions
    };
}