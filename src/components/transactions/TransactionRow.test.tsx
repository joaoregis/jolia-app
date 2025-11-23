import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TransactionRow } from './TransactionRow';
import { Transaction, Label } from '../../types';
import userEvent from '@testing-library/user-event';

const mockLabels: Label[] = [
    { id: 'l1', name: 'Food', color: '#ff0000', profileId: 'p1', status: 'active', createdAt: '2023-01-01' }
];

const mockTransaction: Transaction = {
    id: 't1',
    description: 'Test Transaction',
    date: '2023-10-01',
    type: 'expense',
    labelIds: ['l1'],
    planned: 100,
    actual: 100,
    profileId: 'p1',
    paid: true,
    isShared: true,
    isRecurring: false,
    createdAt: '2023-10-01T10:00:00Z'
};

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

describe('TransactionRow', () => {
    it('should render transaction data correctly', () => {
        render(
            <table>
                <tbody>
                    <TransactionRow
                        item={mockTransaction}
                        type="expense"
                        isClosed={false}
                        isIgnoredTable={false}
                        actions={mockActions}
                        onOpenNoteModal={vi.fn()}
                        isSelected={false}
                        onSelectionChange={vi.fn()}
                        labels={mockLabels}
                        onRemoveLabel={vi.fn()}
                        onOpenLabelSelector={vi.fn()}
                    />
                </tbody>
            </table>
        );

        expect(screen.getByText('Test Transaction')).toBeInTheDocument();
        expect(screen.getByText('Food')).toBeInTheDocument();
    });

    it('should apply correct styling for paid status', () => {
        render(
            <table>
                <tbody>
                    <TransactionRow
                        item={mockTransaction}
                        type="expense"
                        isClosed={false}
                        isIgnoredTable={false}
                        actions={mockActions}
                        onOpenNoteModal={vi.fn()}
                        isSelected={false}
                        onSelectionChange={vi.fn()}
                        labels={mockLabels}
                        onRemoveLabel={vi.fn()}
                        onOpenLabelSelector={vi.fn()}
                    />
                </tbody>
            </table>
        );

        const paidButton = screen.getByText('Sim');
        expect(paidButton).toBeInTheDocument();
        expect(paidButton.className).toContain('bg-green');
    });

    it('should call onTogglePaid when paid button is clicked', async () => {
        const user = userEvent.setup();

        render(
            <table>
                <tbody>
                    <TransactionRow
                        item={mockTransaction}
                        type="expense"
                        isClosed={false}
                        isIgnoredTable={false}
                        actions={mockActions}
                        onOpenNoteModal={vi.fn()}
                        isSelected={false}
                        onSelectionChange={vi.fn()}
                        labels={mockLabels}
                        onRemoveLabel={vi.fn()}
                        onOpenLabelSelector={vi.fn()}
                    />
                </tbody>
            </table>
        );

        const paidButton = screen.getByText('Sim').closest('button');
        if (paidButton) {
            await user.click(paidButton);
            expect(mockActions.onTogglePaid).toHaveBeenCalledWith(mockTransaction);
        }
    });
});
