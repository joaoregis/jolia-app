// src/components/SummaryCards.tsx
import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { AppData } from '../types';
import { formatCurrency } from '../lib/utils';
import { BalanceIndicator } from './BalanceIndicator'; // Importar o novo componente

interface SummaryCardsProps {
    data: AppData;
    activeTab: string;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ data, activeTab }) => {
    const {
        totalReceitaPrevisto,
        totalReceitaEfetivo,
        totalDespesaPrevisto,
        totalDespesaEfetivo,
        saldoPrevisto,
        saldoEfetivo
    } = useMemo(() => {
        // A data já vem filtrada do DashboardScreen para não incluir transações puladas
        const totalReceitaPrevisto = data.receitas.reduce((acc, r) => acc + r.planned, 0);
        const totalReceitaEfetivo = data.receitas.reduce((acc, r) => acc + r.actual, 0);
        const totalDespesaPrevisto = data.despesas.reduce((acc, d) => acc + d.planned, 0);
        const totalDespesaEfetivo = data.despesas.reduce((acc, d) => acc + d.actual, 0);
        const saldoPrevisto = totalReceitaPrevisto - totalDespesaPrevisto;
        const saldoEfetivo = totalReceitaEfetivo - totalDespesaEfetivo;
        return { totalReceitaPrevisto, totalReceitaEfetivo, totalDespesaPrevisto, totalDespesaEfetivo, saldoPrevisto, saldoEfetivo };
    }, [data]);

    if (activeTab === 'geral') {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader><CardTitle>Total Previsto (Despesas da Casa)</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-text-primary">{formatCurrency(totalDespesaPrevisto)}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Total Efetivo (Despesas da Casa)</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-red-600">{formatCurrency(totalDespesaEfetivo)}</div></CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
                <CardHeader><CardTitle>Receitas</CardTitle></CardHeader>
                <CardContent>
                    <div className="text-xl font-bold text-green-600">{formatCurrency(totalReceitaEfetivo)}</div>
                    <p className="text-xs text-text-secondary">Previsto: {formatCurrency(totalReceitaPrevisto)}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>Despesas</CardTitle></CardHeader>
                <CardContent>
                    <div className="text-xl font-bold text-red-600">{formatCurrency(totalDespesaEfetivo)}</div>
                    <p className="text-xs text-text-secondary">Previsto: {formatCurrency(totalDespesaPrevisto)}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>Balanço</CardTitle></CardHeader>
                <CardContent>
                    <BalanceIndicator effectiveBalance={saldoEfetivo} effectiveTotalIncome={totalReceitaEfetivo} />
                    <p className="text-xs text-text-secondary">Previsto: {formatCurrency(saldoPrevisto)}</p>
                </CardContent>
            </Card>
        </div>
    );
};