// src/hooks/useDashboardState.ts
import { useState } from 'react';
import { Subprofile, Transaction } from '../types';

/**
 * Hook para gerir os estados da UI do Dashboard (modais, seleções, etc.).
 */
export function useDashboardState() {
    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
    const [isSubprofileModalOpen, setIsSubprofileModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [isCloseMonthModalOpen, setIsCloseMonthModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [isEditSubprofileModalOpen, setIsEditSubprofileModalOpen] = useState(false);
    const [isArchiveSubprofileModalOpen, setIsArchiveSubprofileModalOpen] = useState(false);
    const [isDeleteTransactionModalOpen, setIsDeleteTransactionModalOpen] = useState(false);


    const [modalInitialValues, setModalInitialValues] = useState<Partial<Transaction> | null>(null);
    const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
    const [transactionToTransfer, setTransactionToTransfer] = useState<Transaction | null>(null);
    const [subprofileToArchive, setSubprofileToArchive] = useState<Subprofile | null>(null);
    const [subprofileToEdit, setSubprofileToEdit] = useState<Subprofile | null>(null);
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; subprofile: Subprofile } | null>(null);

    const openTransactionModal = (initialValues?: Partial<Transaction>) => {
        setModalInitialValues(initialValues || null);
        setIsTransactionModalOpen(true);
    };

    const closeTransactionModal = () => setIsTransactionModalOpen(false);

    const openEditSubprofileModal = (subprofile: Subprofile) => {
        setSubprofileToEdit(subprofile);
        setIsEditSubprofileModalOpen(true);
    };

    const closeEditSubprofileModal = () => {
        setSubprofileToEdit(null);
        setIsEditSubprofileModalOpen(false);
    }

    const openArchiveSubprofileModal = (subprofile: Subprofile) => {
        setSubprofileToArchive(subprofile);
        setIsArchiveSubprofileModalOpen(true);
    };

    const closeArchiveSubprofileModal = () => {
        setSubprofileToArchive(null);
        setIsArchiveSubprofileModalOpen(false);
    }

    const openDeleteTransactionModal = (transaction: Transaction) => {
        setTransactionToDelete(transaction);
        setIsDeleteTransactionModalOpen(true);
    }

    const closeDeleteTransactionModal = () => {
        setTransactionToDelete(null);
        setIsDeleteTransactionModalOpen(false);
    }

    const openTransferModal = (transaction: Transaction) => {
        setTransactionToTransfer(transaction);
        setIsTransferModalOpen(true);
    }

    const closeTransferModal = () => {
        setTransactionToTransfer(null);
        setIsTransferModalOpen(false);
    }


    return {
        modals: {
            transaction: { isOpen: isTransactionModalOpen, open: openTransactionModal, close: closeTransactionModal, initialValues: modalInitialValues },
            addSubprofile: { isOpen: isSubprofileModalOpen, open: () => setIsSubprofileModalOpen(true), close: () => setIsSubprofileModalOpen(false) },
            editSubprofile: { isOpen: isEditSubprofileModalOpen, open: openEditSubprofileModal, close: closeEditSubprofileModal, subprofileToEdit },
            archiveSubprofile: { isOpen: isArchiveSubprofileModalOpen, open: openArchiveSubprofileModal, close: closeArchiveSubprofileModal, subprofileToArchive },
            import: { isOpen: isImportModalOpen, open: () => setIsImportModalOpen(true), close: () => setIsImportModalOpen(false) },
            export: { isOpen: isExportModalOpen, open: () => setIsExportModalOpen(true), close: () => setIsExportModalOpen(false) },
            closeMonth: { isOpen: isCloseMonthModalOpen, open: () => setIsCloseMonthModalOpen(true), close: () => setIsCloseMonthModalOpen(false) },
            settings: { isOpen: isSettingsModalOpen, open: () => setIsSettingsModalOpen(true), close: () => setIsSettingsModalOpen(false) },
            transfer: { isOpen: isTransferModalOpen, open: openTransferModal, close: closeTransferModal, transactionToTransfer },
            deleteTransaction: { isOpen: isDeleteTransactionModalOpen, open: openDeleteTransactionModal, close: closeDeleteTransactionModal, transactionToDelete },
        },
        contextMenu: {
            state: contextMenu,
            open: (x: number, y: number, subprofile: Subprofile) => setContextMenu({ x, y, subprofile }),
            close: () => setContextMenu(null),
        }
    };
}