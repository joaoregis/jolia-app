// src/hooks/useDashboardData.ts

import { useMemo } from 'react';
import { AppData, Label, Profile, SortConfig, Transaction } from '../types';

/**
 * Hook para processar e derivar todos os dados necessários para o Dashboard.
 * Ele recebe dados brutos e retorna os dados prontos para a UI.
 * @param allTransactions - Lista de todas as transações do mês.
 * @param profile - O perfil atual.
 * @param allLabels - A lista de todos os rótulos do perfil.
 * @param activeTab - O subperfil ativo ou 'geral'.
 * @param currentMonthString - O mês atual no formato "YYYY-MM".
 * @param sortConfig - A configuração de ordenação atual.
 * @returns Um objeto contendo os dados processados e prontos para a UI.
 */
export function useDashboardData(
    allTransactions: Transaction[],
    profile: Profile | null,
    allLabels: Label[],
    activeTab: string,
    currentMonthString: string,
    sortConfig: SortConfig | null
) {
    // Calcula a proporção de receita de cada subperfil, usado para rateio
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

    // Filtra as transações ativas e ignoradas para o mês atual
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

    // Filtra os dados com base na aba (subperfil) ativa
    const filteredData = useMemo<AppData>(() => {
        if (activeTab === 'geral') {
            return {
                receitas: activeTransactions.filter(t => t.type === 'income' && t.isShared),
                despesas: activeTransactions.filter(t => t.type === 'expense' && t.isShared)
            };
        }
        return {
            receitas: activeTransactions.filter(t => t.type === 'income' && t.subprofileId === activeTab),
            despesas: activeTransactions.filter(t => t.type === 'expense' && t.subprofileId === activeTab)
        };
    }, [activeTransactions, activeTab]);

    // Ordena os dados filtrados com base na configuração de ordenação
    const sortedData = useMemo(() => {
        const labelsMap = new Map(allLabels.map(l => [l.id, l]));

        const getPrimaryLabelName = (t: Transaction) => {
            if (!t.labelIds || t.labelIds.length === 0) return null;
            return labelsMap.get(t.labelIds[0])?.name || null;
        };

        const sortFn = (a: Transaction, b: Transaction) => {
            if (!sortConfig) return 0;

            if (sortConfig.key === 'labelIds') {
                const aLabel = getPrimaryLabelName(a);
                const bLabel = getPrimaryLabelName(b);
                if (aLabel === bLabel) return 0;
                if (aLabel === null) return 1;
                if (bLabel === null) return -1;
                return sortConfig.direction === 'ascending'
                    ? aLabel.localeCompare(bLabel)
                    : bLabel.localeCompare(aLabel);
            }
            
            const aVal = a[sortConfig.key];
            const bVal = b[sortConfig.key];
            if (aVal == null && bVal == null) return 0;
            if (aVal == null) return sortConfig.direction === 'ascending' ? 1 : -1;
            if (bVal == null) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (typeof aVal === 'boolean' && typeof bVal === 'boolean') {
                return (sortConfig.direction === 'ascending' ? (aVal ? -1 : 1) : (aVal ? 1 : -1));
            }
            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return sortConfig.direction === 'ascending' ? aVal - bVal : bVal - aVal;
            }
            return sortConfig.direction === 'ascending' 
                ? String(aVal).localeCompare(String(bVal)) 
                : String(bVal).localeCompare(String(aVal));
        };

        return {
            receitas: [...filteredData.receitas].sort(sortFn),
            despesas: [...filteredData.despesas].sort(sortFn)
        };
    }, [filteredData, sortConfig, allLabels]);

    return {
        sortedData,
        ignoredTransactions,
        subprofileRevenueProportions,
        activeTransactions 
    };
}