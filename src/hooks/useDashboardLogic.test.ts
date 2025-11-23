import { renderHook, act } from '@testing-library/react';
import { useDashboardLogic } from './useDashboardLogic';
import { Profile } from '../types';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockProfile: Profile = {
    id: 'p1',
    name: 'Test Profile',
    icon: '👤',
    status: 'active',
    subprofiles: [],
    closedMonths: []
};

const mockAvailableMonths = ['2023-01', '2023-02', '2023-03'];

describe('useDashboardLogic', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2023-02-15'));
    });

    it('should initialize with current month if available', () => {
        const { result } = renderHook(() => useDashboardLogic(mockProfile, mockAvailableMonths, false));

        // Should default to current system time month if logic allows, 
        // or the first open month. 
        // In the logic: 
        // openMonths = ['2023-01', '2023-02', '2023-03'] (none closed)
        // firstOpenMonthStr = '2023-01'
        // So it sets to 2023-01-01

        expect(result.current.state.currentMonth.toISOString().slice(0, 10)).toBe('2023-01-01');
    });

    it('should change month correctly', () => {
        const { result } = renderHook(() => useDashboardLogic(mockProfile, mockAvailableMonths, false));

        act(() => {
            result.current.handlers.changeMonth(1);
        });

        expect(result.current.state.currentMonth.toISOString().slice(0, 10)).toBe('2023-02-01');
    });

    it('should handle selection toggles', () => {
        const { result } = renderHook(() => useDashboardLogic(mockProfile, mockAvailableMonths, false));

        act(() => {
            result.current.handlers.createSelectionHandler(result.current.setters.setSelectedIncomeIds)('t1', true);
        });

        expect(result.current.state.selectedIncomeIds.has('t1')).toBe(true);

        act(() => {
            result.current.handlers.createSelectionHandler(result.current.setters.setSelectedIncomeIds)('t1', false);
        });

        expect(result.current.state.selectedIncomeIds.has('t1')).toBe(false);
    });

    it('should sort request toggle direction', () => {
        const { result } = renderHook(() => useDashboardLogic(mockProfile, mockAvailableMonths, false));

        // Initial state is null or default from localstorage mock (which is empty here)
        // logic sets default in useEffect, but we might not wait for it in test without waiting.
        // Let's trigger a sort.

        act(() => {
            result.current.handlers.requestSort('planned');
        });

        expect(result.current.state.sortConfig).toEqual({ key: 'planned', direction: 'ascending' });

        act(() => {
            result.current.handlers.requestSort('planned');
        });

        expect(result.current.state.sortConfig).toEqual({ key: 'planned', direction: 'descending' });
    });
});
