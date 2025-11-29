import { render, screen, fireEvent } from '@testing-library/react';
import { CurrencyInput } from './CurrencyInput';
import { vi, describe, it, expect } from 'vitest';

describe('CurrencyInput', () => {
    it('should render with initial value', () => {
        render(<CurrencyInput value={100} onValueChange={() => { }} />);
        const input = screen.getByRole('textbox');
        expect(input).toHaveValue('100,00');
    });

    it('should format value as currency', () => {
        render(<CurrencyInput value={1234.56} onValueChange={() => { }} />);
        const input = screen.getByRole('textbox') as HTMLInputElement;
        // Note: Intl.NumberFormat might output non-breaking spaces or different formats based on locale.
        // We check for the number part mainly.
        expect(input.value).toContain('1.234,56');
    });

    it('should call onValueChange with parsed number', () => {
        const handleChange = vi.fn();
        render(<CurrencyInput value={0} onValueChange={handleChange} />);
        const input = screen.getByRole('textbox');

        fireEvent.change(input, { target: { value: '12345' } });
        // 12345 -> 123.45
        expect(handleChange).toHaveBeenCalledWith(123.45);
    });

    it('should respect max limit', () => {
        const handleChange = vi.fn();
        render(<CurrencyInput value={0} onValueChange={handleChange} max={100} />);
        const input = screen.getByRole('textbox');

        // Try to input 20000 (which becomes 200.00)
        fireEvent.change(input, { target: { value: '20000' } });

        // Should be capped at 100
        expect(handleChange).toHaveBeenCalledWith(100);
    });

    it('should allow values below max', () => {
        const handleChange = vi.fn();
        render(<CurrencyInput value={0} onValueChange={handleChange} max={100} />);
        const input = screen.getByRole('textbox');

        // Input 5000 (which becomes 50.00)
        fireEvent.change(input, { target: { value: '5000' } });

        expect(handleChange).toHaveBeenCalledWith(50);
    });
});
