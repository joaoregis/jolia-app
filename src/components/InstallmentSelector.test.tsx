import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InstallmentSelector } from './InstallmentSelector';

describe('InstallmentSelector', () => {
    it('should render with initial value', () => {
        const handleChange = vi.fn();
        render(<InstallmentSelector value={5} onChange={handleChange} />);

        const input = screen.getByRole('spinbutton');
        expect(input).toHaveValue(5);
    });

    it('should call onChange when increment button is clicked', async () => {
        const handleChange = vi.fn();
        const user = userEvent.setup();
        render(<InstallmentSelector value={5} onChange={handleChange} />);

        // The increment button is the second button (plus icon)
        const buttons = screen.getAllByRole('button');
        await user.click(buttons[1]);

        expect(handleChange).toHaveBeenCalledWith(6);
    });

    it('should call onChange when decrement button is clicked', async () => {
        const handleChange = vi.fn();
        const user = userEvent.setup();
        render(<InstallmentSelector value={5} onChange={handleChange} />);

        // The decrement button is the first button (minus icon)
        const buttons = screen.getAllByRole('button');
        await user.click(buttons[0]);

        expect(handleChange).toHaveBeenCalledWith(4);
    });

    it('should not increment beyond max', async () => {
        const handleChange = vi.fn();
        const user = userEvent.setup();
        render(<InstallmentSelector value={10} max={10} onChange={handleChange} />);

        const buttons = screen.getAllByRole('button');
        expect(buttons[1]).toBeDisabled();

        await user.click(buttons[1]);
        expect(handleChange).not.toHaveBeenCalled();
    });

    it('should not decrement below min', async () => {
        const handleChange = vi.fn();
        const user = userEvent.setup();
        render(<InstallmentSelector value={2} min={2} onChange={handleChange} />);

        const buttons = screen.getAllByRole('button');
        expect(buttons[0]).toBeDisabled();

        await user.click(buttons[0]);
        expect(handleChange).not.toHaveBeenCalled();
    });

    it('should handle direct input change', () => {
        const handleChange = vi.fn();
        render(<InstallmentSelector value={5} onChange={handleChange} />);

        const input = screen.getByRole('spinbutton');
        fireEvent.change(input, { target: { value: '8' } });

        expect(handleChange).toHaveBeenCalledWith(8);
    });

    it('should ignore invalid input', () => {
        const handleChange = vi.fn();
        render(<InstallmentSelector value={5} onChange={handleChange} />);

        const input = screen.getByRole('spinbutton');
        fireEvent.change(input, { target: { value: 'abc' } });

        expect(handleChange).not.toHaveBeenCalled();
    });

    it('should have no-spinner class', () => {
        const handleChange = vi.fn();
        render(<InstallmentSelector value={5} onChange={handleChange} />);

        const input = screen.getByRole('spinbutton');
        expect(input).toHaveClass('no-spinner');
    });
});
