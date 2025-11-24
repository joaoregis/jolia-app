import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDashboardData } from './useDashboardData';
import { Transaction, Profile, Label, FilterConfig } from '../types';

describe('useDashboardData', () => {
    const mockProfile: Profile = {
        id: 'p1',
        name: 'Test Profile',
        icon: '👤',
        status: 'active',
        subprofiles: [
            { id: 's1', name: 'Sub 1', status: 'active', themeId: 'blue' },
            { id: 's2', name: 'Sub 2', status: 'active', themeId: 'green' }
        ]
    };

    const mockLabels: Label[] = [
        { id: 'l1', name: 'Food', color: 'green', profileId: 'p1', status: 'active', createdAt: new Date() }
    ];

    const mockTransactions: Transaction[] = [
        {
            id: 't1', description: 'Salary', type: 'income', planned: 1000, actual: 1000,
            date: '2023-01-01', profileId: 'p1', isShared: true, subprofileId: 's1'
        },
        {
            id: 't2', description: 'Rent', type: 'expense', planned: 500, actual: 500,
            date: '2023-01-05', profileId: 'p1', isShared: true
        },
        {
            id: 't3', description: 'Skipped', type: 'expense', planned: 100, actual: 100,
            date: '2023-01-10', profileId: 'p1', skippedInMonths: ['2023-01']
        }
    ];

    const defaultFilter: FilterConfig = {};

    it('should separate active and ignored transactions', () => {
        const { result } = renderHook(() => useDashboardData(
            mockTransactions,
            mockProfile,
            mockLabels,
            'geral',
            '2023-01',
            null,
            defaultFilter
        ));

        expect(result.current.activeTransactions).toHaveLength(2); // t1, t2
        expect(result.current.ignoredTransactions).toHaveLength(1); // t3
    });

    it('should calculate subprofile revenue proportions', () => {
        const { result } = renderHook(() => useDashboardData(
            mockTransactions,
            mockProfile,
            mockLabels,
            'geral',
            '2023-01',
            null,
            defaultFilter
        ));

        // t1 is income for sub1 (1000). Total income 1000.
        // sub1: 1.0, sub2: 0.0
        const proportions = result.current.subprofileRevenueProportions;
        expect(proportions.get('s1')).toBe(1);
        expect(proportions.get('s2')).toBe(0);
    });

    it('should filter data based on active tab (geral)', () => {
        const { result } = renderHook(() => useDashboardData(
            mockTransactions,
            mockProfile,
            mockLabels,
            'geral',
            '2023-01',
            null,
            defaultFilter
        ));

        // Geral shows shared transactions
        expect(result.current.sortedData.receitas).toHaveLength(1); // t1
        expect(result.current.sortedData.despesas).toHaveLength(1); // t2
    });

    it('should filter data based on active tab (subprofile)', () => {
        const { result } = renderHook(() => useDashboardData(
            mockTransactions,
            mockProfile,
            mockLabels,
            's1',
            '2023-01',
            null,
            defaultFilter
        ));

        // Sub1 has t1 assigned to it
        expect(result.current.sortedData.receitas).toHaveLength(1); // t1
        expect(result.current.sortedData.despesas).toHaveLength(0);
    });
});
