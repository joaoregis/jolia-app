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

        // Find the trigger button. Since we don't have a specific label/id on the custom select trigger easily accessible by role 'combobox' without aria-label,
        // we can find it by the default text or current value.
        // Initially it might be 'Agrupar por...' or similar if we set a placeholder, but here the default is 'none' which likely maps to 'Agrupar por...' or a specific label.
        // Looking at TransactionFilters.tsx (which I haven't seen but assuming), let's assume the default text is visible.
        // However, the test sets groupBy="none".

        // Let's assume the trigger is a button. We can try to find it by text if we know what "none" renders as, or by finding the button that contains the chevron.
        // Better yet, let's look for the text that is currently displayed.
        // If groupBy="none", and assuming the options have a label for "none" or it shows placeholder.

        // Let's try to find the button that opens the dropdown.
        // Since there might be multiple buttons, we need to be specific.
        // The Select component renders a button.

        // Let's try to find by text "Agrupar por" if that's the placeholder or label.
        // Or we can add a data-testid to the Select component to make it easier, but I can't modify source code just for tests if I can avoid it.

        // Let's assume the default value 'none' renders as "Sem agrupamento" or similar?
        // Without seeing TransactionFilters.tsx it's a bit of a guess.
        // But I can see the test passes `groupBy="none"`.

        // Let's try to find the trigger by its class or structure if needed, but `getByRole('button')` might return many.

        // Wait, I can see `TransactionFilters.tsx` content? No, I haven't viewed it yet.
        // I should view `TransactionFilters.tsx` to see what the options are and what the placeholder is.

        // For now, I will comment out this test or try to fix it based on assumption.
        // Actually, I should view `TransactionFilters.tsx` first.

        // I will skip this edit for a moment and view TransactionFilters.tsx first.
        const groupByTrigger = screen.getByText('Sem Agrupamento');
        await user.click(groupByTrigger);

        const option = screen.getByRole('button', { name: /rótulo/i }); // Assuming 'label' maps to 'Rótulo'
        await user.click(option);

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
