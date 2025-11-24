import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeCustomizer } from './ThemeCustomizer';
import { themes } from '../lib/themes';

// Mock ToastContext
const mockShowToast = vi.fn();
vi.mock('../contexts/ToastContext', () => ({
    useToast: () => ({ showToast: mockShowToast })
}));

describe('ThemeCustomizer', () => {
    const mockOnThemeChange = vi.fn();
    const initialVariables = themes.default.variables;

    it('should render color pickers for all variables', () => {
        render(
            <ThemeCustomizer
                customTheme={initialVariables}
                onThemeChange={mockOnThemeChange}
            />
        );

        // Check for some key labels
        expect(screen.getByText('Fundo Principal')).toBeInTheDocument();
        expect(screen.getByText('Layout (Sidebar/Header)')).toBeInTheDocument();
        expect(screen.getByText('Cards e Elementos')).toBeInTheDocument();
        expect(screen.getByText('Texto Principal')).toBeInTheDocument();
        expect(screen.getByText('Destaque (Accent)')).toBeInTheDocument();
    });

    it('should call onThemeChange when a color is changed', () => {
        render(
            <ThemeCustomizer
                customTheme={initialVariables}
                onThemeChange={mockOnThemeChange}
            />
        );

        // Find color input for Background (first one usually, or by label)
        // The component structure is Label -> Input[type=color]
        // We can find the input associated with "Fundo Principal"
        const bgInput = screen.getByLabelText('Fundo Principal');

        fireEvent.change(bgInput, { target: { value: '#ffffff' } });

        expect(mockOnThemeChange).toHaveBeenCalledWith(expect.objectContaining({
            '--background': '#ffffff'
        }));
    });

    it('should initialize with current theme values', () => {
        const customTheme = { ...initialVariables, '--background': '#123456' };
        render(
            <ThemeCustomizer
                customTheme={customTheme}
                onThemeChange={mockOnThemeChange}
            />
        );

        const bgInput = screen.getByLabelText('Fundo Principal');
        expect(bgInput).toHaveValue('#123456');
    });
});
