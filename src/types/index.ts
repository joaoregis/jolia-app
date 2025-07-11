// src/types/index.ts

import { Theme } from "../lib/themes";

export interface Subprofile {
    id: string;
    name: string;
    status: 'active' | 'archived';
    themeId?: string;
    customTheme?: Theme['variables'];
}

export interface Profile {
    id:string;
    name: string;
    icon: string;
    subprofiles: Subprofile[];
    status: 'active' | 'archived';
    closedMonths?: string[];
    apportionmentMethod?: 'proportional' | 'manual'; 
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
  dueDate?: string;
  profileId: string;
  createdAt?: any; 
  parentId?: string; 
  isApportioned?: boolean;
  skippedInMonths?: string[]; 
  notes?: string; 
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