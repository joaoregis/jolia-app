import { Transaction } from '../types';

export const calculateTotals = (transactions: Transaction[]) => {
    return {
        count: transactions.length,
        sumPlanned: transactions.reduce((acc, t) => acc + t.planned, 0),
        sumActual: transactions.reduce((acc, t) => acc + t.actual, 0),
    };
};

export const calculateBalance = (income: number, expense: number) => {
    return income - expense;
};

export const calculateDiff = (actual: number, planned: number) => {
    return actual - planned;
};
