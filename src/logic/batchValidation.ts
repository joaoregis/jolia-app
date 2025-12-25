import { Transaction } from '../types';

export const validateBatchSelection = (selectedTransactions: Transaction[]): { valid: boolean; message?: string } => {
    const invalidTransactions = selectedTransactions.filter(t => t.isApportioned || t.seriesId);

    if (invalidTransactions.length > 0) {
        const types = [];
        if (invalidTransactions.some(t => t.isApportioned)) types.push("transações de rateio (filhas/oriundas de visão geral)");
        if (invalidTransactions.some(t => t.seriesId)) types.push("transações parceladas");

        // Remove duplicates
        const uniqueTypes = [...new Set(types)];
        const message = `Ação não permitida para os seguintes tipos de itens selecionados:\n- ${uniqueTypes.join('\n- ')}\n\nPor favor, desmarque esses itens para continuar.`;

        return { valid: false, message };
    }
    return { valid: true };
};
