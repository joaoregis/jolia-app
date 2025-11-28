import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TransactionForm } from './TransactionForm';
import { Label } from '../types';

// Mock dependencies
vi.mock('react-router-dom', () => ({
    useParams: () => ({ profileId: 'p1' })
}));

const mockLabels: Label[] = [
    { id: 'l1', name: 'Food', color: '#ff0000', profileId: 'p1', status: 'active', createdAt: new Date() },
    { id: 'l2', name: 'Transport', color: '#00ff00', profileId: 'p1', status: 'active', createdAt: new Date() }
];

vi.mock('../hooks/useLabels', () => ({
    useLabels: () => ({
        labels: mockLabels,
        loading: false
    })
}));

// Mock child components to simplify testing
vi.mock('./CurrencyInput', () => ({
    CurrencyInput: ({ value, onValueChange }: { value: number, onValueChange: (val: number) => void }) => (
        <input
            data-testid="currency-input"
            type="number"
            value={value}
            onChange={(e) => onValueChange(Number(e.target.value))}
        />
    )
}));

vi.mock('./DateInput', () => ({
    DateInput: ({ id, value, onChange, name }: any) => (
        <input data-testid={`date-input-${name}`} id={id} name={name} value={value} onChange={onChange} />
    )
}));

vi.mock('./ToggleSwitch', () => ({
    ToggleSwitch: ({ id, checked, onChange, name, disabled }: any) => (
        <input
            data-testid={`toggle-${name}`}
            type="checkbox"
            id={id}
            name={name}
            checked={checked}
            onChange={onChange}
            disabled={disabled}
        />
    )
}));

vi.mock('./LabelSelector', () => ({
    LabelSelector: ({ isOpen, onToggleLabel, selectedLabelIds: _selectedLabelIds }: any) => isOpen ? (
        <div data-testid="label-selector">
            <button onClick={() => onToggleLabel('l1')}>Select Food</button>
        </div>
    ) : null
}));

describe('TransactionForm', () => {
    const mockOnClose = vi.fn();
    const mockOnSave = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render empty form in create mode', () => {
        render(
            <TransactionForm
                onClose={mockOnClose}
                onSave={mockOnSave}
                initialValues={null}
                isSubprofileView={false}
            />
        );

        expect(screen.getByText('Descrição')).toBeInTheDocument();
        expect(screen.getByText('Valor Previsto')).toBeInTheDocument();
        expect(screen.getByText('Valor Efetivo')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /salvar/i })).toBeInTheDocument();
    });

    it('should render form with initial values in edit mode', () => {
        const initialValues = {
            id: 't1',
            description: 'Test Transaction',
            planned: 100,
            actual: 100,
            type: 'expense' as const,
            date: '2023-01-01'
        };

        render(
            <TransactionForm
                onClose={mockOnClose}
                onSave={mockOnSave}
                initialValues={initialValues}
                isSubprofileView={false}
            />
        );

        expect(screen.getByDisplayValue('Test Transaction')).toBeInTheDocument();
        const currencyInputs = screen.getAllByTestId('currency-input');
        expect(currencyInputs[0]).toHaveValue(100); // Planned
        expect(currencyInputs[1]).toHaveValue(100); // Actual
    });

    it('should update form fields', async () => {
        const user = userEvent.setup();
        render(
            <TransactionForm
                onClose={mockOnClose}
                onSave={mockOnSave}
                initialValues={null}
                isSubprofileView={false}
            />
        );

        // Description
        const descInput = screen.getByLabelText('Descrição');
        await user.type(descInput, 'New Expense');
        expect(descInput).toHaveValue('New Expense');

        // Amount
        const currencyInputs = screen.getAllByTestId('currency-input');
        fireEvent.change(currencyInputs[0], { target: { value: '50' } });
        expect(currencyInputs[0]).toHaveValue(50);
    });

    it('should handle label selection', async () => {
        const user = userEvent.setup();
        render(
            <TransactionForm
                onClose={mockOnClose}
                onSave={mockOnSave}
                initialValues={null}
                isSubprofileView={false}
            />
        );

        // Open label selector
        const addButton = screen.getByRole('button', { name: '' }); // The plus button has no text
        await user.click(addButton);

        expect(screen.getByTestId('label-selector')).toBeInTheDocument();

        // Select label
        await user.click(screen.getByText('Select Food'));

        // Verify label is displayed
        expect(screen.getByText('Food')).toBeInTheDocument();
    });

    it('should submit form with correct data', async () => {
        const user = userEvent.setup();
        render(
            <TransactionForm
                onClose={mockOnClose}
                onSave={mockOnSave}
                initialValues={null}
                isSubprofileView={false}
            />
        );

        // Fill required fields
        await user.type(screen.getByLabelText('Descrição'), 'Groceries');
        fireEvent.change(screen.getAllByTestId('currency-input')[0], { target: { value: '200' } });
        fireEvent.change(screen.getByTestId('date-input-date'), { target: { value: '2023-01-01' } });

        // Submit
        await user.click(screen.getByRole('button', { name: /salvar/i }));

        expect(mockOnSave).toHaveBeenCalledTimes(1);
        expect(mockOnSave).toHaveBeenCalledWith(expect.objectContaining({
            description: 'Groceries',
            planned: 200,
            date: '2023-01-01'
        }), undefined);
    });

    it('should disable shared toggle in subprofile view', () => {
        render(
            <TransactionForm
                onClose={mockOnClose}
                onSave={mockOnSave}
                initialValues={null}
                isSubprofileView={true}
            />
        );

        // In subprofile view, the "Da Casa" (isShared) toggle might not be rendered or disabled
        // Based on code: {!isSubprofileView && ( ... toggle ... )}
        // So it should NOT be in the document
        expect(screen.queryByTestId('toggle-isShared')).not.toBeInTheDocument();
    });

    it('should show due date only for expenses', async () => {
        const user = userEvent.setup();
        render(
            <TransactionForm
                onClose={mockOnClose}
                onSave={mockOnSave}
                initialValues={{ type: 'income' }}
                isSubprofileView={true} // Enable type selection
            />
        );

        expect(screen.queryByText('Data de Vencimento')).not.toBeInTheDocument();

        // Change to expense
        // Change to expense
        const typeTrigger = screen.getByRole('button', { name: /receita/i });
        await user.click(typeTrigger);

        const expenseOption = screen.getByRole('button', { name: /despesa/i });
        await user.click(expenseOption);

        expect(screen.getByText('Data de Vencimento')).toBeInTheDocument();
    });
});
