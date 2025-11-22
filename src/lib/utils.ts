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
 * Formata uma data string (yyyy-MM-dd) para um formato curto (dd/MM).
 * @param dateString A data no formato "yyyy-MM-dd".
 * @returns A data formatada como "dd/MM" (ex: "20/06").
 */
export const formatShortDate = (dateString?: string): string => {
    if (!dateString) {
        return '-'; // Retorna um traço se a data não existir
    }
    try {
        const date = new Date(dateString + 'T00:00:00'); // Adiciona T00:00:00 para evitar problemas de fuso horário
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
        }).format(date);
    } catch (e) {
        console.error("Erro ao formatar data:", e);
        return '-';
    }
};

/**
 * Formata uma data string (yyyy-MM-dd) para o formato completo (dd/MM/yyyy).
 * @param dateString A data no formato "yyyy-MM-dd".
 * @returns A data formatada como "dd/MM/yyyy" (ex: "20/06/2025").
 */
export const formatFullDate = (dateString?: string): string => {
    if (!dateString) {
        return '-';
    }
    try {
        const date = new Date(dateString + 'T00:00:00');
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        }).format(date);
    } catch (e) {
        console.error("Erro ao formatar data:", e);
        return '-';
    }
};

/**
 * Adiciona meses a uma data, tratando casos de borda (ex: 31/01 + 1 mês = 28/02 ou 29/02).
 * @param date A data base.
 * @param months O número de meses a adicionar.
 * @returns Uma nova data ajustada.
 */
export const addMonths = (date: Date, months: number): Date => {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    if (d.getDate() !== date.getDate()) {
        d.setDate(0);
    }
    return d;
};

/**
 * Retorna a data atual no formato YYYY-MM-DD, respeitando o fuso horário local.
 * @returns String da data no formato "yyyy-MM-dd".
 */
export const getLocalDateISOString = (): string => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};