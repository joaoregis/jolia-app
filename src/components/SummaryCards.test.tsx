import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SummaryCards } from './SummaryCards';
import { AppData, Transaction } from '../types';

// Mock helper to create transactions
const createTransaction = (amount: number, type: 'income' | 'expense'): Transaction => ({
    id: 't1',
    description: 'Test',
    planned: amount,
    actual: amount,
    type,
    date: '2023-01-01',
    profileId: 'p1',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
});

describe('SummaryCards', () => {
    const mockData: AppData = {
        receitas: [
            createTransaction(3000, 'income'),
            createTransaction(2000.50, 'income')
        ],
        despesas: [
            createTransaction(1000, 'expense'),
            createTransaction(1000.25, 'expense')
        ],
        transacoes: [] // Not used in SummaryCards directly but part of AppData
    };

    it('should render all summary cards with correct calculated values', () => {
        render(
            <SummaryCards
                data={mockData}
                activeTab="subprofile-1"
            />
        );

        // Total Income: 3000 + 2000.50 = 5000.50
        // Total Expense: 1000 + 1000.25 = 2000.25
        // Balance: 5000.50 - 2000.25 = 3000.25

        // Check labels
        expect(screen.getByText('Receitas')).toBeInTheDocument();
        expect(screen.getByText('Despesas')).toBeInTheDocument();
        expect(screen.getByText('Balanço')).toBeInTheDocument();

        // Check formatted values (Brazilian format)
        // Since planned and actual are the same in mock data, we expect multiple occurrences
        expect(screen.getAllByText(/5\.000,50/)).toHaveLength(2); // Previsto and Efetivo
        expect(screen.getAllByText(/2\.000,25/)).toHaveLength(2); // Previsto and Efetivo
        expect(screen.getAllByText(/3\.000,25/)).toHaveLength(2); // Previsto and Efetivo
    });

    it('should render "Geral" tab view correctly', () => {
        render(
            <SummaryCards
                data={mockData}
                activeTab="geral"
            />
        );

        // In "geral" tab, it shows "Total Previsto (Despesas da Casa)" and "Total Efetivo (Despesas da Casa)"
        expect(screen.getByText('Total Previsto (Despesas da Casa)')).toBeInTheDocument();
        expect(screen.getByText('Total Efetivo (Despesas da Casa)')).toBeInTheDocument();

        // Should NOT show "Receitas" card
        expect(screen.queryByText('Receitas')).not.toBeInTheDocument();

        // Values
        const values = screen.getAllByText(/2\.000,25/);
        expect(values).toHaveLength(2); // One for Previsto, one for Efetivo
    });

    it('should handle zero values', () => {
        const zeroData: AppData = {
            receitas: [],
            despesas: [],
            transacoes: []
        };

        render(
            <SummaryCards
                data={zeroData}
                activeTab="subprofile-1"
            />
        );

        expect(screen.getAllByText(/0,00/)).toHaveLength(6); // 3 main values + 3 "Previsto" values
    });
});
