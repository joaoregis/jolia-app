import { render, screen, fireEvent } from '@testing-library/react';
import { TransactionForm } from './TransactionForm';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';

// Mock dependencies
vi.mock('../hooks/useLabels', () => ({
    useLabels: () => ({
        labels: [
            { id: '1', name: 'Food', color: '#ff0000', status: 'active' },
            { id: '2', name: 'Rent', color: '#00ff00', status: 'active' },
        ],
    }),
}));

vi.mock('./CurrencyInput', () => ({
    CurrencyInput: ({ value, onValueChange, max }: any) => (
        <input
            data-testid="currency-input"
            type="number"
            value={value}
            max={max}
            onChange={(e) => onValueChange(Number(e.target.value))}
        />
    ),
}));

vi.mock('./ToggleSwitch', () => ({
    ToggleSwitch: ({ checked, onChange, disabled, id, name }: any) => (
        <input
            data-testid={`toggle-${id}`}
            type="checkbox"
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            name={name}
        />
    ),
}));

vi.mock('./DateInput', () => ({
    DateInput: ({ value, onChange, id, name }: any) => (
        <input
            data-testid={`date-input-${id}`}
            type="date"
            value={value}
            onChange={onChange}
            name={name || id}
        />
    ),
}));

vi.mock('./LabelSelector', () => ({
    LabelSelector: () => <div data-testid="label-selector" />,
}));

vi.mock('./InstallmentSelector', () => ({
    InstallmentSelector: ({ value, onChange }: any) => (
        <input
            data-testid="installment-selector"
            type="number"
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
        />
    ),
}));

describe('TransactionForm', () => {
    const mockOnClose = vi.fn();
    const mockOnSave = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    const renderComponent = (props: any = {}) => {
        return render(
            <BrowserRouter>
                <TransactionForm
                    onClose={mockOnClose}
                    onSave={mockOnSave}
                    isSubprofileView={false}
                    {...props}
                />
            </BrowserRouter>
        );
    };

    it('should render expense form by default', () => {
        renderComponent();
        expect(screen.getByText('Nova Despesa')).toBeInTheDocument();
        expect(screen.getByText('Valor Previsto')).toBeInTheDocument();
        expect(screen.getByText('Valor Efetivo')).toBeInTheDocument();
    });

    it('should render income form when type is income', () => {
        renderComponent({ initialValues: { type: 'income' } });
        expect(screen.getByText('Nova Receita')).toBeInTheDocument();
    });

    it('should handle description input', async () => {
        renderComponent();
        const input = screen.getByLabelText('Descrição');
        await userEvent.type(input, 'Groceries');
        expect(input).toHaveValue('Groceries');
    });

    it('should handle currency input changes', () => {
        renderComponent();
        const inputs = screen.getAllByTestId('currency-input');
        fireEvent.change(inputs[0], { target: { value: '100' } }); // Planned
        fireEvent.change(inputs[1], { target: { value: '90' } });  // Actual

        // Since we mock CurrencyInput to call onValueChange, we can't check internal state directly easily without spying,
        // but we can check if submitting calls onSave with correct values.
        // Or we can trust the mock implementation updates the parent state if the parent re-renders.
        // Let's submit and check.

        const descInput = screen.getByLabelText('Descrição');
        fireEvent.change(descInput, { target: { value: 'Test' } });

        const saveButton = screen.getByText('Salvar');
        fireEvent.click(saveButton);

        expect(mockOnSave).toHaveBeenCalledWith(expect.objectContaining({
            planned: 100,
            actual: 90,
        }), undefined);
    });

    it('should pass max prop to CurrencyInput', () => {
        renderComponent();
        const inputs = screen.getAllByTestId('currency-input');
        expect(inputs[0]).toHaveAttribute('max', '999999999.99');
        expect(inputs[1]).toHaveAttribute('max', '999999999.99');
    });

    it('should toggle paid status', () => {
        renderComponent();
        const toggle = screen.getByTestId('toggle-paid');
        fireEvent.click(toggle);
        expect(toggle).toBeChecked();
    });

    it('should toggle recurring status', () => {
        renderComponent();
        const toggle = screen.getByTestId('toggle-isRecurring');
        fireEvent.click(toggle);
        expect(toggle).toBeChecked();
    });

    it('should toggle installment purchase and show selector', () => {
        renderComponent();
        const toggle = screen.getByTestId('toggle-isInstallmentPurchase');
        fireEvent.click(toggle);
        expect(toggle).toBeChecked();
        expect(screen.getByText('Número de Parcelas')).toBeInTheDocument();
        expect(screen.getByTestId('installment-selector')).toBeInTheDocument();
    });

    it('should hide recurring option when installment is checked', () => {
        renderComponent();
        const installmentToggle = screen.getByTestId('toggle-isInstallmentPurchase');

        fireEvent.click(installmentToggle);
        expect(installmentToggle).toBeChecked();
        expect(screen.queryByTestId('toggle-isRecurring')).not.toBeInTheDocument();
    });

    it('should hide installment option when recurring is checked', () => {
        renderComponent();
        const recurringToggle = screen.getByTestId('toggle-isRecurring');

        fireEvent.click(recurringToggle);
        expect(recurringToggle).toBeChecked();
        expect(screen.queryByTestId('toggle-isInstallmentPurchase')).not.toBeInTheDocument();
    });

    it('should handle installment count change', () => {
        renderComponent();
        const toggle = screen.getByTestId('toggle-isInstallmentPurchase');
        fireEvent.click(toggle);

        const selector = screen.getByTestId('installment-selector');
        fireEvent.change(selector, { target: { value: '5' } });

        const descInput = screen.getByLabelText('Descrição');
        fireEvent.change(descInput, { target: { value: 'Test' } });

        const saveButton = screen.getByText('Salvar');
        fireEvent.click(saveButton);

        expect(mockOnSave).toHaveBeenCalledWith(expect.objectContaining({
            isInstallmentPurchase: true,
            totalInstallments: 5,
        }), undefined);
    });

    it('should not allow installment options for existing installment transaction', () => {
        renderComponent({ initialValues: { seriesId: '123', isInstallmentPurchase: true, totalInstallments: 10 } });
        expect(screen.getByText('Não é possível alterar as opções de parcelamento de uma transação já criada.')).toBeInTheDocument();
        expect(screen.queryByTestId('installment-selector')).not.toBeInTheDocument();
    });
});
