import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SettingsModal } from './SettingsModal';
import { Profile } from '../types';

describe('SettingsModal', () => {
    const mockProfile: Profile = {
        id: 'p1',
        name: 'Test Profile',
        icon: '🏠',
        status: 'active',
        subprofiles: [
            { id: 'sub1', name: 'Sub 1', status: 'active' },
            { id: 'sub2', name: 'Sub 2', status: 'active' }
        ],
        apportionmentMethod: 'manual'
    };

    const defaultProps = {
        isOpen: true,
        onClose: vi.fn(),
        onSave: vi.fn(),
        profile: mockProfile
    };

    it('renders correctly', () => {
        render(<SettingsModal {...defaultProps} />);
        expect(screen.getByText('Configurações do Perfil')).toBeInTheDocument();
        expect(screen.getByLabelText('Manual (Padrão)')).toBeChecked();
    });

    it('does not render when isOpen is false', () => {
        render(<SettingsModal {...defaultProps} isOpen={false} />);
        expect(screen.queryByText('Configurações do Perfil')).not.toBeInTheDocument();
    });

    it('calls onClose when cancel button is clicked', () => {
        render(<SettingsModal {...defaultProps} />);
        fireEvent.click(screen.getByText('Cancelar'));
        expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('calls onSave with manual method', () => {
        render(<SettingsModal {...defaultProps} />);
        fireEvent.click(screen.getByText('Salvar'));
        expect(defaultProps.onSave).toHaveBeenCalledWith({ apportionmentMethod: 'manual', subprofileApportionmentPercentages: undefined });
    });

    it('switches to proportional method', () => {
        render(<SettingsModal {...defaultProps} />);
        fireEvent.click(screen.getByLabelText('Proporcional à Receita'));
        fireEvent.click(screen.getByText('Salvar'));
        expect(defaultProps.onSave).toHaveBeenCalledWith({ apportionmentMethod: 'proportional', subprofileApportionmentPercentages: undefined });
    });

    it('switches to percentage method and shows inputs', () => {
        render(<SettingsModal {...defaultProps} />);
        fireEvent.click(screen.getByLabelText('Percentual Fixo'));

        expect(screen.getByText('Distribuição (%)')).toBeInTheDocument();
        expect(screen.getByText('Sub 1')).toBeInTheDocument();
        expect(screen.getByText('Sub 2')).toBeInTheDocument();
    });

    it('validates percentage sum equal to 100', () => {
        render(<SettingsModal {...defaultProps} />);
        fireEvent.click(screen.getByLabelText('Percentual Fixo'));

        // Initial split should be 50/50 (handled by component logic for clean slate)
        const inputs = screen.getAllByRole('spinbutton');
        expect(inputs[0]).toHaveValue(50);
        expect(inputs[1]).toHaveValue(50);

        // Change values to make sum != 100
        fireEvent.change(inputs[0], { target: { value: '40' } });
        // Sum is 90

        expect(screen.getByText('Total: 90%')).toHaveClass('text-red-500');
        expect(screen.getByText('Salvar')).toBeDisabled();
    });

    it('saves percentage method with correct values', () => {
        render(<SettingsModal {...defaultProps} />);
        fireEvent.click(screen.getByLabelText('Percentual Fixo'));

        const inputs = screen.getAllByRole('spinbutton');

        // Change to 60/40
        fireEvent.change(inputs[0], { target: { value: '60' } });
        fireEvent.change(inputs[1], { target: { value: '40' } });

        expect(screen.getByText('Total: 100%')).toHaveClass('text-green-500');
        expect(screen.getByText('Salvar')).not.toBeDisabled();

        fireEvent.click(screen.getByText('Salvar'));

        expect(defaultProps.onSave).toHaveBeenCalledWith({
            apportionmentMethod: 'percentage',
            subprofileApportionmentPercentages: {
                'sub1': 60,
                'sub2': 40
            }
        });
    });

    it('initializes with existing percentages if present', () => {
        const profileWithPercentages: Profile = {
            ...mockProfile,
            apportionmentMethod: 'percentage',
            subprofileApportionmentPercentages: { 'sub1': 70, 'sub2': 30 }
        };

        render(<SettingsModal {...defaultProps} profile={profileWithPercentages} />);

        // Wait for inputs to be available (though render is sync usually)
        expect(screen.getByLabelText('Percentual Fixo')).toBeChecked();

        const inputs = screen.getAllByRole('spinbutton');
        expect(inputs[0]).toHaveValue(70);
        expect(inputs[1]).toHaveValue(30);
    });
});
