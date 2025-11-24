import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TransactionModal } from './TransactionModal';

describe('TransactionModal', () => {
    it('should render when isOpen is true', () => {
        render(
            <TransactionModal isOpen={true} onClose={vi.fn()} title="Test Title">
                <div>Modal Content</div>
            </TransactionModal>
        );

        expect(screen.getByText('Test Title')).toBeInTheDocument();
        expect(screen.getByText('Modal Content')).toBeInTheDocument();
    });

    it('should not render when isOpen is false', () => {
        const { container } = render(
            <TransactionModal isOpen={false} onClose={vi.fn()} title="Test Title">
                <div>Modal Content</div>
            </TransactionModal>
        );

        expect(container.firstChild).toBeNull();
    });

    it('should call onClose when close button is clicked', async () => {
        const user = userEvent.setup();
        const onClose = vi.fn();

        render(
            <TransactionModal isOpen={true} onClose={onClose} title="Test Title">
                <div>Modal Content</div>
            </TransactionModal>
        );

        const closeButton = screen.getByRole('button');
        await user.click(closeButton);

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should render children correctly', () => {
        render(
            <TransactionModal isOpen={true} onClose={vi.fn()} title="Test">
                <input placeholder="Test Input" />
                <button>Test Button</button>
            </TransactionModal>
        );

        expect(screen.getByPlaceholderText('Test Input')).toBeInTheDocument();
        expect(screen.getByText('Test Button')).toBeInTheDocument();
    });
});
