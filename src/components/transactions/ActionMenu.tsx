import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { MoreVertical, Edit, ArrowRightLeft, SkipForward, Trash2 } from 'lucide-react';
import { Transaction, TransactionActions } from '../../types';

export const ActionMenu: React.FC<{ item: Transaction; actions: Pick<TransactionActions, 'onEdit' | 'onDelete' | 'onSkip' | 'onTransfer'>; }> = ({ item, actions }) => {
    const [isOpen, setIsOpen] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        if (isOpen && buttonRef.current && menuRef.current) {
            const { top, left, height, width } = buttonRef.current.getBoundingClientRect();
            const menuHeight = menuRef.current.offsetHeight;
            const windowHeight = window.innerHeight;
            let topPos = top + height + window.scrollY;
            if (topPos + menuHeight > windowHeight) topPos = top - menuHeight + window.scrollY;
            menuRef.current.style.top = `${topPos}px`;
            menuRef.current.style.left = `${left + window.scrollX + width - menuRef.current.offsetWidth}px`;
        }
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node) && !buttonRef.current?.contains(event.target as Node)) setIsOpen(false);
        };
        if (isOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    return (
        <>
            <button ref={buttonRef} onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-full text-text-secondary hover:bg-background"><MoreVertical size={18} /></button>
            {isOpen && ReactDOM.createPortal(
                <div ref={menuRef} className="fixed w-48 rounded-md shadow-lg bg-card ring-1 ring-black ring-opacity-5 z-50 border border-border animate-fade-in">
                    <div className="py-1">
                        <button onClick={() => { actions.onEdit(item); setIsOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:bg-background"><Edit size={16} /> Editar</button>
                        <button onClick={() => { actions.onTransfer(item); setIsOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:bg-background"><ArrowRightLeft size={16} /> Transferir</button>
                        {(item.isRecurring || !!item.seriesId) && <button onClick={() => { actions.onSkip(item); setIsOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:bg-background"><SkipForward size={16} /> Ignorar neste mês</button>}
                        <button onClick={() => { actions.onDelete(item); setIsOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-background"><Trash2 size={16} /> Excluir</button>
                    </div>
                </div>, document.body
            )}
        </>
    );
};
