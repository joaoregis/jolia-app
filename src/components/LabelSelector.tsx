// src/components/LabelSelector.tsx

import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Label } from '../types';

interface LabelSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    availableLabels: Label[];
    selectedLabelIds: string[];
    onToggleLabel: (labelId: string) => void;
    anchorEl: HTMLElement | null;
}

export const LabelSelector: React.FC<LabelSelectorProps> = ({
    isOpen,
    onClose,
    availableLabels,
    selectedLabelIds,
    onToggleLabel,
    anchorEl
}) => {
    const popoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node) && !anchorEl?.contains(event.target as Node)) {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose, anchorEl]);
    
    useEffect(() => {
        if (isOpen && popoverRef.current && anchorEl) {
            const rect = anchorEl.getBoundingClientRect();
            popoverRef.current.style.left = `${rect.left}px`;
            popoverRef.current.style.top = `${rect.bottom + window.scrollY + 4}px`;
        }
    }, [isOpen, anchorEl]);

    if (!isOpen || !anchorEl) return null;

    return ReactDOM.createPortal(
        <div ref={popoverRef} className="fixed z-50 w-64 bg-card border border-border-color rounded-lg shadow-lg p-2 animate-fade-in">
             <style>{` @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } } .animate-fade-in { animation: fade-in 0.1s ease-out forwards; } `}</style>
            <div className="max-h-60 overflow-y-auto space-y-1">
                {availableLabels.map(label => {
                    const isSelected = selectedLabelIds.includes(label.id);
                    return (
                        <div
                            key={label.id}
                            onClick={() => onToggleLabel(label.id)}
                            className={`flex items-center justify-between p-2 rounded cursor-pointer text-sm ${isSelected ? 'bg-accent/20' : 'hover:bg-background'}`}
                        >
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: label.color }}></span>
                                <span className="text-text-primary">{label.name}</span>
                            </div>
                            {isSelected && <span className="text-accent text-xs">✓</span>}
                        </div>
                    );
                })}
                 {availableLabels.length === 0 && (
                    <p className="text-center text-xs text-text-secondary p-4">Nenhum rótulo criado. Vá para as Configurações para adicionar.</p>
                )}
            </div>
        </div>,
        document.body
    );
};