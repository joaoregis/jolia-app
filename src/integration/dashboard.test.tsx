import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TransactionTable } from '../components/TransactionTable';
import { Transaction, Label } from '../types';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';

// Mock data
const mockLabels: Label[] = [
    { id: 'l1', name: 'Food', color: '#ff0000', profileId: 'p1', status: 'active', createdAt: '2023-01-01' },
    { id: 'l2', name: 'Salary', color: '#00ff00', profileId: 'p1', status: 'active', createdAt: '2023-01-01' }
];

const mockTransactions: Transaction[] = [
    {
        id: 't1',
        description: 'Grocery Shopping',
        date: '2023-10-01',
        type: 'expense',
        labelIds: ['l1'],
        planned: 50,
        actual: 50,
        profileId: 'p1',
        paid: true,
        isShared: true,
        isRecurring: false,
        createdAt: '2023-10-01T10:00:00Z'
    },
    {
        id: 't2',
        description: 'Monthly Salary',
        date: '2023-10-05',
        type: 'income',
        labelIds: ['l2'],
        planned: 2000,
        actual: 2000,
        profileId: 'p1',
        paid: true,
        isShared: true,
        isRecurring: false,
        createdAt: '2023-10-05T10:00:00Z'
    }
];

// Mock actions
const mockActions = {
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onTogglePaid: vi.fn(),
    onUpdateField: vi.fn(),
    onSkip: vi.fn(),
    onUnskip: vi.fn(),
    onTransfer: vi.fn(),
    onSaveNote: vi.fn()
};

describe('Dashboard Integration', () => {
    it('should render transaction table with data', () => {
        render(
            <BrowserRouter>
                <TransactionTable
                    title="Test Table"
                    data={mockTransactions}
                    labels={mockLabels}
                    type="expense"
                    isClosed={false}
                    sortConfig={null}
                    requestSort={vi.fn()}
                    actions={mockActions}
                    selectedIds={new Set()}
                    onSelectionChange={vi.fn()}
                    onSelectAll={vi.fn()}
                    groupBy="none"
                />
            </BrowserRouter>
        );

        expect(screen.getAllByText('Grocery Shopping').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Monthly Salary').length).toBeGreaterThan(0);
    });

    it('should trigger sort request on header click', async () => {
        const user = userEvent.setup();
        const requestSort = vi.fn();

        render(
            <BrowserRouter>
                <TransactionTable
                    title="Test Table"
                    data={mockTransactions}
                    labels={mockLabels}
                    type="expense"
                    isClosed={false}
                    sortConfig={{ key: 'dueDate', direction: 'ascending' }}
                    requestSort={requestSort}
                    actions={mockActions}
                    selectedIds={new Set()}
                    onSelectionChange={vi.fn()}
                    onSelectAll={vi.fn()}
                    groupBy="none"
                />
            </BrowserRouter>
        );

        const dateHeader = screen.getByText('Vencimento');
        await user.click(dateHeader);

        expect(requestSort).toHaveBeenCalledWith('dueDate');
    });
});
