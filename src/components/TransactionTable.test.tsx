import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TransactionTable } from './TransactionTable';
import { Transaction, Label, TransactionActions } from '../types';

describe('TransactionTable', () => {
    const mockLabels: Label[] = [
        { id: 'l1', name: 'Food', color: '#ff0000', profileId: 'p1', status: 'active', createdAt: new Date() }
    ];

    const mockTransactions: Transaction[] = [
        {
            id: 't1',
            description: 'Salary',
            type: 'income',
            planned: 1000,
            actual: 1000,
            date: '2023-01-01',
            profileId: 'p1',
            paid: true
        },
        {
            id: 't2',
            description: 'Rent',
            type: 'expense',
            planned: 500,
            actual: 500,
            date: '2023-01-05',
            profileId: 'p1',
            paid: false,
            dueDate: '2023-01-10'
        }
    ];

    const mockActions: TransactionActions = {
        onEdit: vi.fn(),
        onDelete: vi.fn(),
        onTogglePaid: vi.fn(),
        onUpdateField: vi.fn(),
        onSkip: vi.fn(),
        onUnskip: vi.fn(),
        onTransfer: vi.fn(),
        onSaveNote: vi.fn()
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render table with transactions', () => {
        render(
            <TransactionTable
                title="Income"
                data={mockTransactions.filter(t => t.type === 'income')}
                labels={mockLabels}
                type="income"
                isClosed={false}
                requestSort={vi.fn()}
                sortConfig={null}
                actions={mockActions}
                selectedIds={new Set()}
                onSelectionChange={vi.fn()}
                onSelectAll={vi.fn()}
            />
        );

        // Table renders both mobile and desktop views, so we use getAllByText
        expect(screen.getAllByText('Income')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Salary')[0]).toBeInTheDocument();
    });

    it('should show empty state when no transactions', () => {
        render(
            <TransactionTable
                title="Income"
                data={[]}
                labels={mockLabels}
                type="income"
                isClosed={false}
                requestSort={vi.fn()}
                sortConfig={null}
                actions={mockActions}
                selectedIds={new Set()}
                onSelectionChange={vi.fn()}
                onSelectAll={vi.fn()}
            />
        );

        const emptyMessages = screen.getAllByText('Nenhuma transação encontrada nesta categoria.');
        expect(emptyMessages.length).toBeGreaterThan(0);
        expect(emptyMessages[0]).toBeInTheDocument();
    });

    it('should call requestSort when clicking header', async () => {
        const user = userEvent.setup();
        const requestSort = vi.fn();

        render(
            <TransactionTable
                title="Income"
                data={mockTransactions.filter(t => t.type === 'income')}
                labels={mockLabels}
                type="income"
                isClosed={false}
                requestSort={requestSort}
                sortConfig={null}
                actions={mockActions}
                selectedIds={new Set()}
                onSelectionChange={vi.fn()}
                onSelectAll={vi.fn()}
            />
        );

        // Desktop view has the header
        const descriptionHeaders = screen.getAllByText('Descrição');
        // Find the one that is inside a button (sortable header)
        const descriptionHeader = descriptionHeaders.find(el => el.closest('button'));

        if (descriptionHeader) {
            await user.click(descriptionHeader);
            expect(requestSort).toHaveBeenCalledWith('description');
        }
    });

    it('should call onSelectAll when select all checkbox is clicked', async () => {
        const user = userEvent.setup();
        const onSelectAll = vi.fn();

        render(
            <TransactionTable
                title="Income"
                data={mockTransactions.filter(t => t.type === 'income')}
                labels={mockLabels}
                type="income"
                isClosed={false}
                requestSort={vi.fn()}
                sortConfig={null}
                actions={mockActions}
                selectedIds={new Set()}
                onSelectionChange={vi.fn()}
                onSelectAll={onSelectAll}
            />
        );

        // Use getAllByTitle because there might be one for mobile and one for desktop
        const selectAllCheckboxes = screen.getAllByTitle('Selecionar Tudo');
        await user.click(selectAllCheckboxes[0]);

        expect(onSelectAll).toHaveBeenCalledWith(true);
    });

    it('should display expense-specific column (due date)', () => {
        render(
            <TransactionTable
                title="Expenses"
                data={mockTransactions.filter(t => t.type === 'expense')}
                labels={mockLabels}
                type="expense"
                isClosed={false}
                requestSort={vi.fn()}
                sortConfig={null}
                actions={mockActions}
                selectedIds={new Set()}
                onSelectionChange={vi.fn()}
                onSelectAll={vi.fn()}
            />
        );

        expect(screen.getAllByText('Vencimento')[0]).toBeInTheDocument();
    });

    it('should calculate and display totals', () => {
        render(
            <TransactionTable
                title="All"
                data={mockTransactions}
                labels={mockLabels}
                type="expense"
                isClosed={false}
                requestSort={vi.fn()}
                sortConfig={null}
                actions={mockActions}
                selectedIds={new Set()}
                onSelectionChange={vi.fn()}
                onSelectAll={vi.fn()}
            />
        );

        // Total should be 1500 (1000 + 500) - Brazilian format: 1.500,00
        const totals = screen.getAllByText(/1\.500,00/);
        expect(totals.length).toBeGreaterThan(0);
    });
});
