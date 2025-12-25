import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CalculationToolbar } from './CalculationToolbar';

describe('CalculationToolbar', () => {
    const mockOnClearSelection = vi.fn();
    const mockOnBatchTransfer = vi.fn();
    const mockOnBatchDelete = vi.fn();
    const mockOnBatchSkip = vi.fn();
    const mockOnBatchUnskip = vi.fn();
    const defaultProps = {
        selectedTransactions: [],
        onClearSelection: mockOnClearSelection,
        onBatchTransfer: mockOnBatchTransfer,
        onBatchDelete: mockOnBatchDelete,
        onBatchSkip: mockOnBatchSkip,
        onBatchUnskip: mockOnBatchUnskip
    };

    it('should not render when total count is 0', () => {
        render(
            <CalculationToolbar
                selections={{}}
                {...defaultProps}
            />
        );

        expect(screen.queryByText(/item/)).not.toBeInTheDocument();
    });

    it('should render correct count and totals for income selection', () => {
        render(
            <CalculationToolbar
                selections={{
                    income: { count: 2, sumPlanned: 200, sumActual: 200 }
                }}
                {...defaultProps}
            />
        );

        expect(screen.getByText('2 itens')).toBeInTheDocument();
        expect(screen.getByText('Receitas')).toBeInTheDocument();
        expect(screen.getByText(/200,00/)).toBeInTheDocument();
    });

    it('should render correct count and totals for mixed selection', () => {
        render(
            <CalculationToolbar
                selections={{
                    income: { count: 1, sumPlanned: 100, sumActual: 100 },
                    expense: { count: 1, sumPlanned: 50, sumActual: 60 }
                }}
                {...defaultProps}
            />
        );

        expect(screen.getByText('2 itens')).toBeInTheDocument();

        // Income
        expect(screen.getByText('Receitas')).toBeInTheDocument();
        expect(screen.getByText(/100,00/)).toBeInTheDocument();

        // Expense
        expect(screen.getByText('Despesas')).toBeInTheDocument();
        // Actual is 60, Planned is 50. Should show Actual and (Planned)
        expect(screen.getByText(/60,00/)).toBeInTheDocument();
        // Matches (R$ 50,00) or similar, handling potential non-breaking spaces
        expect(screen.getByText(/\(R\$\s*50,00\)/)).toBeInTheDocument();
    });

    it('should render ignored transactions', () => {
        render(
            <CalculationToolbar
                selections={{
                    ignored: { count: 3, sumPlanned: 300, sumActual: 0 }
                }}
                {...defaultProps}
            />
        );

        expect(screen.getByText('3 itens')).toBeInTheDocument();
        expect(screen.getByText('Ignorados')).toBeInTheDocument();
        expect(screen.getByText(/300,00/)).toBeInTheDocument();
    });

    it('should call onClearSelection when close button is clicked', async () => {
        const user = userEvent.setup();
        render(
            <CalculationToolbar
                selections={{
                    income: { count: 1, sumPlanned: 100, sumActual: 100 }
                }}
                {...defaultProps}
            />
        );

        await user.click(screen.getByTitle('Limpar Seleção'));
        expect(mockOnClearSelection).toHaveBeenCalledTimes(1);
    });
});
