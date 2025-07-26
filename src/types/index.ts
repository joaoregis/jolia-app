// src/types/index.ts

import type { Theme } from "../lib/themes";
export type { Theme } from "../lib/themes";

export interface Subprofile {
    id: string;
    name: string;
    status: 'active' | 'archived';
    themeId?: string;
    customTheme?: Theme['variables'];
}

export interface CustomTheme {
  id: string;
  name: string;
  variables: Theme['variables'];
}

export interface Profile {
    id:string;
    name: string;
    icon: string;
    subprofiles: Subprofile[];
    status: 'active' | 'archived';
    closedMonths?: string[];
    apportionmentMethod?: 'proportional' | 'manual';
    savedThemes?: CustomTheme[];
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
  // Campos para parcelamento
  seriesId?: string;
  currentInstallment?: number;
  totalInstallments?: number;
  originalDate?: string;
}

export interface AppData {
  receitas: Transaction[];
  despesas: Transaction[];
}

export type TransactionFormState = Omit<Transaction, 'id' | 'profileId' | 'createdAt' | 'parentId' | 'isApportioned' | 'skippedInMonths' | 'originalDate' | 'seriesId' | 'currentInstallment'> & {
    isInstallmentPurchase?: boolean;
    scope?: 'one' | 'future';
};

export interface SortConfig {
    key: keyof Transaction;
    direction: 'ascending' | 'descending';
}

// Tipos para a nova funcionalidade de Wishlist
export interface WishlistItem {
    id: string;
    title: string;
    description?: string;
    notes?: string;
    budget?: number;
    isDone: boolean;
    createdAt: any; // serverTimestamp
}

export interface Wishlist {
    id: string;
    name: string;
    profileId: string;
    // Opcional: para vincular a um subperfil específico
    subprofileId?: string;
    // Para listas compartilhadas (visíveis para todos no perfil)
    isShared: boolean;
    createdAt: any; // serverTimestamp
}

// Tipos para o sistema de Toast
export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}