// src/lib/utils.ts

/**
 * Formata um número para a moeda BRL (Real Brasileiro).
 * @param value O número a ser formatado.
 * @returns Uma string formatada como moeda.
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

/**
 * --- NOVA FUNÇÃO ---
 * Formata uma data string (yyyy-MM-dd) para um formato curto (dd/MMM).
 * @param dateString A data no formato "yyyy-MM-dd".
 * @returns A data formatada como "dd/MêsAbreviado" (ex: "20/Jun").
 */
export const formatShortDate = (dateString?: string): string => {
    if (!dateString) {
        return '-'; // Retorna um traço se a data não existir
    }
    try {
        const date = new Date(dateString + 'T00:00:00'); // Adiciona T00:00:00 para evitar problemas de fuso horário
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: 'short',
        }).format(date).replace('.', ''); // Remove o ponto que alguns navegadores adicionam
    } catch (e) {
        console.error("Erro ao formatar data:", e);
        return '-';
    }
};
