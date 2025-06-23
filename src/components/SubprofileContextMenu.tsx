// src/components/SubprofileContextMenu.tsx

import React, { useEffect, useRef } from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { Subprofile } from '../types';

interface SubprofileContextMenuProps {
    subprofile: Subprofile;
    x: number;
    y: number;
    onClose: () => void;
    onEdit: (subprofile: Subprofile) => void;
    onArchive: (subprofile: Subprofile) => void;
}

export const SubprofileContextMenu: React.FC<SubprofileContextMenuProps> = ({
    subprofile,
    x,
    y,
    onClose,
    onEdit,
    onArchive,
}) => {
    const menuRef = useRef<HTMLDivElement>(null);

    // Efeito para fechar o menu ao clicar fora dele
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    return (
        <div
            ref={menuRef}
            className="absolute z-50 w-48 rounded-md shadow-lg bg-card ring-1 ring-black ring-opacity-5 border border-border-color"
            style={{ top: y, left: x }}
        >
            <div className="py-1">
                <button
                    onClick={() => onEdit(subprofile)}
                    className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:bg-background"
                >
                    <Edit2 size={16} /> Editar
                </button>
                <button
                    onClick={() => onArchive(subprofile)}
                    className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-background"
                >
                    <Trash2 size={16} /> Arquivar
                </button>
            </div>
        </div>
    );
};
