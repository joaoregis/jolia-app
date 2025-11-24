import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SaveThemeModal } from './SaveThemeModal';

describe('SaveThemeModal', () => {
    const mockOnClose = vi.fn();
    const mockOnSave = vi.fn();

    it('should not render when isOpen is false', () => {
        render(
            <SaveThemeModal
                isOpen={false}
                onClose={mockOnClose}
                onSave={mockOnSave}
            />
        );

        expect(screen.queryByText('Salvar Tema Personalizado')).not.toBeInTheDocument();
    });

    it('should render when isOpen is true', () => {
        render(
            <SaveThemeModal
                isOpen={true}
                onClose={mockOnClose}
                onSave={mockOnSave}
            />
        );

        expect(screen.getByText('Salvar Tema Personalizado')).toBeInTheDocument();
        expect(screen.getByLabelText('Nome do Tema')).toBeInTheDocument();
    });

    it('should update theme name input', async () => {
        const user = userEvent.setup();
        render(
            <SaveThemeModal
                isOpen={true}
                onClose={mockOnClose}
                onSave={mockOnSave}
            />
        );

        const input = screen.getByLabelText('Nome do Tema');
        await user.type(input, 'My New Theme');
        expect(input).toHaveValue('My New Theme');
    });

    it('should call onSave with theme name when form is submitted', async () => {
        const user = userEvent.setup();
        render(
            <SaveThemeModal
                isOpen={true}
                onClose={mockOnClose}
                onSave={mockOnSave}
            />
        );

        await user.type(screen.getByLabelText('Nome do Tema'), 'My New Theme');
        await user.click(screen.getByRole('button', { name: /salvar/i }));

        expect(mockOnSave).toHaveBeenCalledWith('My New Theme');
        // onClose is typically handled by the parent component after successful save
    });

    it('should call onClose when cancel button is clicked', async () => {
        const user = userEvent.setup();
        render(
            <SaveThemeModal
                isOpen={true}
                onClose={mockOnClose}
                onSave={mockOnSave}
            />
        );

        await user.click(screen.getByRole('button', { name: /cancelar/i }));
        expect(mockOnClose).toHaveBeenCalled();
    });
});
