import { useMemo } from 'react';
import { AppData, Label, Profile, SortConfig, Transaction, FilterConfig } from '../types';
import { filterTransactions, sortTransactions } from '../logic/transactionProcessing';

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

        const subprofileIncomes = new Map<string, number>(activeSubprofiles.map(s => [s.id, 0]));

        allTransactions
            .filter(t => !(t.skippedInMonths || []).includes(currentMonthString) && t.type === 'income' && t.subprofileId && subprofileIncomes.has(t.subprofileId))
            .forEach(t => {
                subprofileIncomes.set(t.subprofileId!, (subprofileIncomes.get(t.subprofileId!) || 0) + t.actual);
            });

        const totalIncome = Array.from(subprofileIncomes.values()).reduce((acc, income) => acc + income, 0);
        const proportions = new Map<string, number>();

        if (totalIncome > 0) {
            subprofileIncomes.forEach((income, subId) => proportions.set(subId, income / totalIncome));
        } else {
            const equalShare = 1 / activeSubprofiles.length;
            activeSubprofiles.forEach(sub => proportions.set(sub.id, equalShare));
        }
        return proportions;
    }, [allTransactions, profile, currentMonthString]);

    const { activeTransactions, ignoredTransactions } = useMemo(() => {
        const active: Transaction[] = [];
        const ignored: Transaction[] = [];
        for (const t of allTransactions) {
            if (t.skippedInMonths?.includes(currentMonthString)) {
                ignored.push(t);
            } else {
                active.push(t);
            }
        }
        return { activeTransactions: active, ignoredTransactions: ignored };
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