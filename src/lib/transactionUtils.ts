// src/lib/transactionUtils.ts
import { Transaction, TransactionFormState } from '../types';
import { serverTimestamp } from 'firebase/firestore';
import { addMonths } from './utils';

/**
 * Remove propriedades com valor `undefined` de um objeto.
 * O Firestore não aceita `undefined` como valor de campo.
 * @param obj O objeto a ser limpo.
 */
export const cleanUndefinedFields = <T extends object>(obj: T): T => {
    Object.keys(obj).forEach(key => (obj as any)[key] === undefined && delete (obj as any)[key]);
    return obj;
};

/**
 * Gera as parcelas para uma transação parcelada.
 * @param data Dados do formulário.
 * @param profileId ID do perfil.
 * @param activeTab Aba ativa (subperfil ou geral).
 */
export const generateInstallments = (
    data: TransactionFormState,
    profileId: string,
    activeTab?: string
): Omit<Transaction, 'id'>[] => {
    const installments: Omit<Transaction, 'id'>[] = [];
    const totalInstallments = data.totalInstallments || 1;
    const seriesId = crypto.randomUUID();

    // Data base para cálculo (evita problemas de fuso horário ao usar strings YYYY-MM-DD)
    const baseDate = new Date(data.date + 'T00:00:00');
    const basePaymentDate = data.paymentDate ? new Date(data.paymentDate + 'T00:00:00') : undefined;
    const baseDueDate = data.dueDate ? new Date(data.dueDate + 'T00:00:00') : undefined;

    for (let i = 0; i < totalInstallments; i++) {
        // Usando addMonths para cálculo seguro de datas
        const installmentDate = addMonths(baseDate, i);
        const paymentDate = basePaymentDate ? addMonths(basePaymentDate, i) : undefined;
        const dueDate = baseDueDate ? addMonths(baseDueDate, i) : undefined;

        const installmentData: Omit<Transaction, 'id'> = {
            ...data,
            profileId: profileId,
            date: installmentDate.toISOString().split('T')[0],
            paymentDate: paymentDate ? paymentDate.toISOString().split('T')[0] : undefined,
            dueDate: dueDate ? dueDate.toISOString().split('T')[0] : undefined,
            seriesId: seriesId,
            currentInstallment: i + 1,
            totalInstallments: totalInstallments,
            isRecurring: false,
            createdAt: serverTimestamp()
        };

        if (data.isShared) {
            delete (installmentData as Partial<TransactionFormState>).subprofileId;
        } else if (activeTab) {
            installmentData.subprofileId = activeTab;
        }

        // Remove campos auxiliares do form
        delete (installmentData as any).isInstallmentPurchase;

        installments.push(cleanUndefinedFields(installmentData));
    }

    return installments;
};

/**
 * Prepara os dados para uma transação filha (rateio).
 */
export const prepareApportionedChild = (
    parentData: Transaction,
    proportion: number,
    subId: string,
    parentId: string
): Omit<Transaction, 'id'> => {
    const { id, subprofileId, isShared, isApportioned, parentId: pId, ...restOfParent } = parentData;

    const childData: Omit<Transaction, 'id'> = {
        ...restOfParent,
        description: `[Rateio] ${parentData.description}`,
        planned: (parentData.planned || 0) * proportion,
        actual: (parentData.actual || 0) * proportion,
        isShared: false,
        isApportioned: true,
        parentId: parentId,
        subprofileId: subId,
        createdAt: serverTimestamp()
    };

    return cleanUndefinedFields(childData);
};
