import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TransactionFilters } from './TransactionFilters';
import { FilterConfig, Label } from '../types';

describe('TransactionFilters', () => {
    const mockLabels: Label[] = [
        { id: 'l1', name: 'Food', color: '#ff0000', profileId: 'p1', status: 'active', createdAt: new Date() },
        { id: 'l2', name: 'Transport', color: '#00ff00', profileId: 'p1', status: 'active', createdAt: new Date() }
    ];

    const defaultFilters: FilterConfig = {};

    it('should render search input', () => {
        render(
            <TransactionFilters
                filters={defaultFilters}
                onFilterChange={vi.fn()}
                labels={mockLabels}
                onClearFilters={vi.fn()}
                groupBy="none"
                onGroupByChange={vi.fn()}
            />
        );

        expect(screen.getByPlaceholderText('Buscar transações...')).toBeInTheDocument();
    });

    it('should call onFilterChange when search input changes', async () => {
        const user = userEvent.setup();
        const onFilterChange = vi.fn();

        render(
            <TransactionFilters
                filters={defaultFilters}
                onFilterChange={onFilterChange}
                labels={mockLabels}
                onClearFilters={vi.fn()}
                groupBy="none"
                onGroupByChange={vi.fn()}
            />
        );

        const searchInput = screen.getByPlaceholderText('Buscar transações...');
        await user.type(searchInput, 'test');

        expect(onFilterChange).toHaveBeenCalled();
    });

    it('should call onGroupByChange when group by select changes', async () => {
        const user = userEvent.setup();
        const onGroupByChange = vi.fn();

        render(
            <TransactionFilters
                filters={defaultFilters}
                onFilterChange={vi.fn()}
                labels={mockLabels}
                onClearFilters={vi.fn()}
                groupBy="none"
                onGroupByChange={onGroupByChange}
            />
        );

        const groupBySelect = screen.getByRole('combobox');
        await user.selectOptions(groupBySelect, 'label');

        expect(onGroupByChange).toHaveBeenCalledWith('label');
    });

    it('should expand and show advanced filters', async () => {
        const user = userEvent.setup();

        render(
            <TransactionFilters
                filters={defaultFilters}
                onFilterChange={vi.fn()}
                labels={mockLabels}
                onClearFilters={vi.fn()}
                groupBy="none"
                onGroupByChange={vi.fn()}
            />
        );

        const filterButton = screen.getByTitle('Filtros Avançados');
        await user.click(filterButton);

        expect(screen.getByText('Valor')).toBeInTheDocument();
        expect(screen.getByText('Data')).toBeInTheDocument();
        expect(screen.getByText('Rótulos')).toBeInTheDocument();
    });

    it('should call onClearFilters when clear button is clicked', async () => {
        const user = userEvent.setup();
        const onClearFilters = vi.fn();

        render(
            <TransactionFilters
                filters={{ searchTerm: 'test' }}
                onFilterChange={vi.fn()}
                labels={mockLabels}
                onClearFilters={onClearFilters}
                groupBy="none"
                onGroupByChange={vi.fn()}
            />
        );

        const clearButton = screen.getByTitle('Limpar Filtros');
        await user.click(clearButton);

        expect(onClearFilters).toHaveBeenCalledTimes(1);
    });

    it('should toggle label filter', async () => {
        const user = userEvent.setup();
        const onFilterChange = vi.fn();

        render(
            <TransactionFilters
                filters={defaultFilters}
                onFilterChange={onFilterChange}
                labels={mockLabels}
                onClearFilters={vi.fn()}
                groupBy="none"
                onGroupByChange={vi.fn()}
            />
        );

        // Expand filters
        const filterButton = screen.getByTitle('Filtros Avançados');
        await user.click(filterButton);

        // Click label
        const labelButton = screen.getByText('Food');
        await user.click(labelButton);

        expect(onFilterChange).toHaveBeenCalled();
        const lastCall = onFilterChange.mock.calls[onFilterChange.mock.calls.length - 1][0];
        expect(lastCall.labelIds).toContain('l1');
    });
});
