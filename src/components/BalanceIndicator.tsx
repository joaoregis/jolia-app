// src/components/BalanceIndicator.tsx

import React from 'react';
import { AlertCircle, TriangleAlert, Info, CheckCircle } from 'lucide-react';
import { formatCurrency } from '../lib/utils'; // Assumindo que formatCurrency está em utils

interface BalanceIndicatorProps {
    effectiveBalance: number;
    effectiveTotalIncome: number;
}

export const BalanceIndicator: React.FC<BalanceIndicatorProps> = ({ effectiveBalance, effectiveTotalIncome }) => {
    let IconComponent: React.ElementType;
    let textColorClass: string;
    let titleText: string;

    // Define os limites de percentagem da receita para os indicadores
    const LOW_BALANCE_PERCENTAGE = 0.20; // 20% da receita
    const MEDIUM_BALANCE_PERCENTAGE = 0.50; // 50% da receita

    if (effectiveBalance < 0) {
        IconComponent = AlertCircle;
        textColorClass = 'text-red-600';
        titleText = 'Balanço Negativo';
    } else {
        const balancePercentage = effectiveTotalIncome > 0 ? (effectiveBalance / effectiveTotalIncome) : 0;

        if (effectiveBalance === 0) { // Balanço exatamente zero
            IconComponent = Info;
            textColorClass = 'text-text-secondary'; // Cinza ou neutro
            titleText = 'Balanço Zerado';
        } else if (balancePercentage <= LOW_BALANCE_PERCENTAGE) {
            IconComponent = TriangleAlert;
            textColorClass = 'text-orange-500'; // Ou amarelo, dependendo da paleta
            titleText = 'Balanço Baixo (até ' + (LOW_BALANCE_PERCENTAGE * 100) + '% da receita)';
        } else if (balancePercentage <= MEDIUM_BALANCE_PERCENTAGE) {
            IconComponent = Info;
            textColorClass = 'text-blue-500';
            titleText = 'Balanço Médio (até ' + (MEDIUM_BALANCE_PERCENTAGE * 100) + '% da receita)';
        } else {
            IconComponent = CheckCircle;
            textColorClass = 'text-green-600';
            titleText = 'Balanço Alto (acima de ' + (MEDIUM_BALANCE_PERCENTAGE * 100) + '% da receita)';
        }
    }

    return (
        <div className={`flex items-center gap-2 ${textColorClass}`} title={titleText}>
            <IconComponent size={24} className="flex-shrink-0" />
            <span className="text-xl font-bold">{formatCurrency(effectiveBalance)}</span>
        </div>
    );
};