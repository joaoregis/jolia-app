// src/types/index.ts

export interface Subprofile {
    id: string;
    name: string;
    status: 'active' | 'archived';
}

export interface Profile {
    id:string;
    name: string;
    icon: string; 
    subprofiles: Subprofile[];
    status: 'active' | 'archived';
    closedMonths?: string[];
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
  date: string; // Data de Lançamento
  paymentDate?: string; // --- NOVO CAMPO: Data de Pagamento ---
  profileId: string;
}

export interface AppData {
  receitas: Transaction[];
  despesas: Transaction[];
}

// Omit<> garante que o novo campo seja incluído no tipo do formulário
export type TransactionFormState = Omit<Transaction, 'id' | 'profileId'>;

export interface SortConfig {
    key: keyof Transaction;
    direction: 'ascending' | 'descending';
}
