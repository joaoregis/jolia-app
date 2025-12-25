import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PercentageInput } from './PercentageInput';

describe('PercentageInput', () => {
    it('renders with initial value', () => {
        render(<PercentageInput value={50} onChange={() => { }} />);
        const input = screen.getByRole('spinbutton');
        expect(input).toHaveValue(50);
    });

    it('calls onChange when increment button is clicked', () => {
        const handleChange = vi.fn();
        render(<PercentageInput value={50} onChange={handleChange} />);

        const buttons = screen.getAllByRole('button');
        const incrementBtn = buttons[1]; // Second button is plus

        fireEvent.click(incrementBtn);
        expect(handleChange).toHaveBeenCalledWith(51);
    });

    it('calls onChange when decrement button is clicked', () => {
        const handleChange = vi.fn();
        render(<PercentageInput value={50} onChange={handleChange} />);

        const buttons = screen.getAllByRole('button');
        const decrementBtn = buttons[0]; // First button is minus

        fireEvent.click(decrementBtn);
        expect(handleChange).toHaveBeenCalledWith(49);
    });

    it('respects max value', () => {
        const handleChange = vi.fn();
        render(<PercentageInput value={100} onChange={handleChange} max={100} />);

        const buttons = screen.getAllByRole('button');
        const incrementBtn = buttons[1];

        fireEvent.click(incrementBtn);
        expect(handleChange).not.toHaveBeenCalled();
        expect(incrementBtn).toBeDisabled();
    });

    it('respects min value', () => {
        const handleChange = vi.fn();
        render(<PercentageInput value={0} onChange={handleChange} min={0} />);

        const buttons = screen.getAllByRole('button');
        const decrementBtn = buttons[0];

        fireEvent.click(decrementBtn);
        expect(handleChange).not.toHaveBeenCalled();
        expect(decrementBtn).toBeDisabled();
    });

    it('handles manual input change', () => {
        const handleChange = vi.fn();
        render(<PercentageInput value={50} onChange={handleChange} />);

        const input = screen.getByRole('spinbutton');
        fireEvent.change(input, { target: { value: '75' } });

        expect(handleChange).toHaveBeenCalledWith(75);
    });

    it('clamps manual input to max', () => {
        const handleChange = vi.fn();
        render(<PercentageInput value={50} onChange={handleChange} max={100} />);

        const input = screen.getByRole('spinbutton');
        fireEvent.change(input, { target: { value: '150' } });

        expect(handleChange).toHaveBeenCalledWith(100);
    });

    it('clamps manual input to min', () => {
        const handleChange = vi.fn();
        render(<PercentageInput value={50} onChange={handleChange} min={0} />);

        const input = screen.getByRole('spinbutton');
        fireEvent.change(input, { target: { value: '-10' } });

        expect(handleChange).toHaveBeenCalledWith(0);
    });

    it('is disabled when disabled prop is true', () => {
        const handleChange = vi.fn();
        render(<PercentageInput value={50} onChange={handleChange} disabled />);

        const input = screen.getByRole('spinbutton');
        const buttons = screen.getAllByRole('button');

        expect(input).toBeDisabled();
        buttons.forEach(btn => expect(btn).toBeDisabled());

        fireEvent.click(buttons[1]);
        expect(handleChange).not.toHaveBeenCalled();
    });
});
