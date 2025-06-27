// src/types/index.ts

export interface Subprofile {
    id: string;
    name: string;
    status: 'active' | 'archived';
    themeId?: string;
}

export interface Profile {
    id:string;
    name: string;
    icon: string;
    subprofiles: Subprofile[];
    status: 'active' | 'archived';
    closedMonths?: string[];
    apportionmentMethod?: 'proportional' | 'manual'; // NOVO: Método de rateio
}

export interface Transaction {
  id: string;
  description: string;
  type: 'income' | 'expense';
  planned: number;
  actual: number;
  paid?: boolean;
  isShared?: boolean;
  isRecurring?: boolean;
  subprofileId?: string;
  date: string;
  paymentDate?: string;
  profileId: string;
  createdAt?: any; // Alterado para 'any' para ser compatível com serverTimestamp
  parentId?: string; // NOVO: ID da transação "pai"
  isApportioned?: boolean; // NOVO: Indica se é uma transação gerada por rateio
  skippedInMonths?: string[]; // NOVO: Array de meses (YYYY-MM) em que a transação foi pulada
}

export interface AppData {
  receitas: Transaction[];
  despesas: Transaction[];
}

export type TransactionFormState = Omit<Transaction, 'id' | 'profileId' | 'createdAt' | 'parentId' | 'isApportioned' | 'skippedInMonths'>;

export interface SortConfig {
    key: keyof Transaction;
    direction: 'ascending' | 'descending';
}