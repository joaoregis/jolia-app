import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditSubprofileModal } from './EditSubprofileModal';
import { Profile, Subprofile } from '../types';
import { themes } from '../lib/themes';

// Mock child components
vi.mock('./ThemeCustomizer', () => ({
    ThemeCustomizer: ({ onThemeChange }: any) => (
        <div data-testid="theme-customizer">
            <button onClick={() => onThemeChange({ '--background': '#123456' })}>Change Theme</button>
        </div>
    )
}));

vi.mock('./SaveThemeModal', () => ({
    SaveThemeModal: ({ isOpen, onSave }: any) => isOpen ? (
        <div data-testid="save-theme-modal">
            <button onClick={() => onSave('New Theme Name')}>Save Theme</button>
        </div>
    ) : null
}));

// Mock ToastContext
const mockShowToast = vi.fn();
vi.mock('../contexts/ToastContext', () => ({
    useToast: () => ({ showToast: mockShowToast })
}));

describe('EditSubprofileModal', () => {
    const mockOnClose = vi.fn();
    const mockOnSave = vi.fn();
    const mockOnSaveTheme = vi.fn();
    const mockOnDeleteTheme = vi.fn();

    const mockProfile: Profile = {
        id: 'p1',
        name: 'Test Profile',
        icon: '👤',
        status: 'active',
        subprofiles: [],
        savedThemes: [
            {
                id: 'saved-theme-1',
                name: 'My Saved Theme',
                variables: themes.default.variables
            }
        ]
    };

    const mockSubprofile: Subprofile = {
        id: 's1',
        name: 'Sub 1',
        status: 'active',
        themeId: 'default'
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should not render when isOpen is false', () => {
        render(
            <EditSubprofileModal
                isOpen={false}
                onClose={mockOnClose}
                onSave={mockOnSave}
                subprofile={mockSubprofile}
                profile={mockProfile}
                onSaveTheme={mockOnSaveTheme}
                onDeleteTheme={mockOnDeleteTheme}
            />
        );

        expect(screen.queryByText('Editar Subperfil')).not.toBeInTheDocument();
    });

    it('should render with subprofile data pre-filled', () => {
        render(
            <EditSubprofileModal
                isOpen={true}
                onClose={mockOnClose}
                onSave={mockOnSave}
                subprofile={mockSubprofile}
                profile={mockProfile}
                onSaveTheme={mockOnSaveTheme}
                onDeleteTheme={mockOnDeleteTheme}
            />
        );

        expect(screen.getByText('Editar Subperfil')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Sub 1')).toBeInTheDocument();
    });

    it('should update name', async () => {
        const user = userEvent.setup();
        render(
            <EditSubprofileModal
                isOpen={true}
                onClose={mockOnClose}
                onSave={mockOnSave}
                subprofile={mockSubprofile}
                profile={mockProfile}
                onSaveTheme={mockOnSaveTheme}
                onDeleteTheme={mockOnDeleteTheme}
            />
        );

        const nameInput = screen.getByLabelText('Nome do Subperfil');
        await user.clear(nameInput);
        await user.type(nameInput, 'New Name');
        expect(nameInput).toHaveValue('New Name');
    });

    it('should select a theme', async () => {
        const user = userEvent.setup();
        render(
            <EditSubprofileModal
                isOpen={true}
                onClose={mockOnClose}
                onSave={mockOnSave}
                subprofile={mockSubprofile}
                profile={mockProfile}
                onSaveTheme={mockOnSaveTheme}
                onDeleteTheme={mockOnDeleteTheme}
            />
        );

        // Click on a theme (e.g., Padrão Claro)
        // The component renders themes by iterating object entries.
        // We can find by text "Padrão Claro"
        await user.click(screen.getByText('Padrão Claro'));

        // Verify selection visually (border-accent class) - hard to test class directly without implementation detail
        // But we can verify saving uses the new theme ID
        await user.click(screen.getByRole('button', { name: /salvar alterações/i }));

        expect(mockOnSave).toHaveBeenCalledWith('s1', 'Sub 1', 'padrao_claro', undefined);
    });

    it('should handle custom theme selection and customization', async () => {
        const user = userEvent.setup();
        render(
            <EditSubprofileModal
                isOpen={true}
                onClose={mockOnClose}
                onSave={mockOnSave}
                subprofile={mockSubprofile}
                profile={mockProfile}
                onSaveTheme={mockOnSaveTheme}
                onDeleteTheme={mockOnDeleteTheme}
            />
        );

        // Select "Personalizar Cores" radio
        await user.click(screen.getByLabelText('Personalizar Cores'));

        expect(screen.getByTestId('theme-customizer')).toBeInTheDocument();

        // Interact with customizer mock
        await user.click(screen.getByText('Change Theme'));

        // Save changes
        await user.click(screen.getByRole('button', { name: /salvar alterações/i }));

        expect(mockOnSave).toHaveBeenCalledWith(
            's1',
            'Sub 1',
            'custom',
            expect.objectContaining({ '--background': '#123456' })
        );
    });

    it('should save a new custom theme', async () => {
        const user = userEvent.setup();
        render(
            <EditSubprofileModal
                isOpen={true}
                onClose={mockOnClose}
                onSave={mockOnSave}
                subprofile={mockSubprofile}
                profile={mockProfile}
                onSaveTheme={mockOnSaveTheme}
                onDeleteTheme={mockOnDeleteTheme}
            />
        );

        // Select custom theme to show "Salvar Tema" button
        await user.click(screen.getByLabelText('Personalizar Cores'));

        // Click "Salvar Tema"
        await user.click(screen.getByRole('button', { name: /salvar tema/i }));

        expect(screen.getByTestId('save-theme-modal')).toBeInTheDocument();

        // Save in modal mock
        await user.click(screen.getByText('Save Theme'));

        expect(mockOnSaveTheme).toHaveBeenCalledWith('New Theme Name', expect.any(Object));
        expect(mockShowToast).toHaveBeenCalledWith(expect.stringContaining('salvo com sucesso'), 'success');
    });

    it('should delete a saved theme', async () => {
        const user = userEvent.setup();
        render(
            <EditSubprofileModal
                isOpen={true}
                onClose={mockOnClose}
                onSave={mockOnSave}
                subprofile={mockSubprofile}
                profile={mockProfile}
                onSaveTheme={mockOnSaveTheme}
                onDeleteTheme={mockOnDeleteTheme}
            />
        );

        // Find delete button for saved theme
        const deleteButton = screen.getByTitle('Excluir tema "My Saved Theme"');
        await user.click(deleteButton);

        expect(mockOnDeleteTheme).toHaveBeenCalledWith('saved-theme-1');
        expect(mockShowToast).toHaveBeenCalledWith('Tema excluído.', 'info');
    });
});
