import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CalculationToolbar } from './CalculationToolbar';

describe('CalculationToolbar', () => {
    const mockOnClearSelection = vi.fn();

    it('should not render when total count is 0', () => {
        render(
            <CalculationToolbar
                selections={{}}
                onClearSelection={mockOnClearSelection}
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
                onClearSelection={mockOnClearSelection}
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
                onClearSelection={mockOnClearSelection}
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
                onClearSelection={mockOnClearSelection}
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
                onClearSelection={mockOnClearSelection}
            />
        );

        await user.click(screen.getByTitle('Limpar Seleção'));
        expect(mockOnClearSelection).toHaveBeenCalledTimes(1);
    });
});
