// src/components/NoteModal.tsx

import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

interface NoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (note: string) => void;
    initialNote?: string;
}

export const NoteModal: React.FC<NoteModalProps> = ({ isOpen, onClose, onSave, initialNote = '' }) => {
    const [note, setNote] = useState('');

    useEffect(() => {
        if (isOpen) {
            setNote(initialNote);
        }
    }, [isOpen, initialNote]);

    const handleSave = () => {
        onSave(note);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-card rounded-lg shadow-xl w-full max-w-md animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-border-color">
                    <h3 className="text-xl font-semibold text-text-primary">Nota da Transação</h3>
                    <button onClick={onClose} className="text-text-secondary hover:opacity-75">
                        <X size={24} />
                    </button>
                </div>
                <div className="p-6">
                    <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        rows={6}
                        className="w-full p-2 mt-1 font-mono text-sm border rounded-md bg-background text-text-primary border-border-color focus:ring-accent focus:border-accent"
                        placeholder="Adicione uma observação..."
                        autoFocus
                    />
                </div>
                <div className="flex justify-end gap-3 p-4 bg-background/50 rounded-b-lg">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-lg bg-card text-text-primary hover:opacity-80 border border-border-color">
                        Cancelar
                    </button>
                    <button type="button" onClick={handleSave} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg bg-accent hover:bg-accent-hover">
                        <Save size={16} /> Salvar Nota
                    </button>
                </div>
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
    );
};