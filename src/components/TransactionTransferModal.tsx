// src/components/TransferTransactionModal.tsx

import React from 'react';
import { X, ArrowRight, Home, Users } from 'lucide-react';
import { Transaction, Subprofile } from '../types';

interface TransferTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  subprofiles: Subprofile[];
  onConfirmTransfer: (transactionId: string, destination: { type: 'subprofile' | 'main'; id?: string }) => void;
}

export const TransferTransactionModal: React.FC<TransferTransactionModalProps> = ({
  isOpen,
  onClose,
  transaction,
  subprofiles,
  onConfirmTransfer,
}) => {
  if (!isOpen || !transaction) return null;

  const handleTransfer = (destination: { type: 'subprofile' | 'main'; id?: string }) => {
    onConfirmTransfer(transaction.id, destination);
    onClose();
  };

  // Filtra os subperfis para não mostrar o subperfil de origem
  const availableSubprofiles = subprofiles.filter(sp => sp.id !== transaction.subprofileId);
  const isCurrentlyInMain = !transaction.subprofileId || transaction.isShared;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div 
        className="bg-card rounded-lg shadow-xl w-full max-w-md animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border-color">
          <h2 className="text-lg font-semibold text-text-primary">Transferir Transação</h2>
          <button onClick={onClose} className="p-1 rounded-full text-text-secondary hover:bg-background">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="text-sm text-text-secondary">
            <span>Transferir: </span>
            <span className="font-bold text-text-primary block truncate">{transaction.description}</span>
          </div>
          
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {/* Opção para transferir para a Visão Geral (Perfil Principal) */}
            {!isCurrentlyInMain && (
              <button
                onClick={() => handleTransfer({ type: 'main' })}
                className="w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors hover:bg-background border border-border-color"
              >
                <div className="flex items-center gap-3">
                  <Users size={18} className="text-accent" />
                  <span className="font-medium text-text-primary">Visão Geral (Casa)</span>
                </div>
                <ArrowRight size={16} className="text-text-secondary" />
              </button>
            )}

            {/* Lista de outros subperfis */}
            {availableSubprofiles.map(subprofile => (
              <button
                key={subprofile.id}
                onClick={() => handleTransfer({ type: 'subprofile', id: subprofile.id })}
                className="w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors hover:bg-background border border-border-color"
              >
                <div className="flex items-center gap-3">
                  <Home size={18} className="text-accent" />
                  <span className="font-medium text-text-primary">{subprofile.name}</span>
                </div>
                <ArrowRight size={16} className="text-text-secondary" />
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 bg-background/50 flex justify-end gap-3 rounded-b-lg border-t border-border-color">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-card text-text-primary hover:opacity-80 border border-border-color"
          >
            Cancelar
          </button>
        </div>
        <style>{`
            @keyframes fade-in-up {
                from { opacity: 0; transform: scale(0.95); }
                to { opacity: 1; transform: scale(1); }
            }
            .animate-fade-in-up {
                animation: fade-in-up 0.2s ease-out forwards;
            }
        `}</style>
      </div>
    </div>
  );
};