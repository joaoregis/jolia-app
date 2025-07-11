// src/components/Card.tsx

import React from 'react';

// --- CORREÇÃO: Removida a classe "overflow-hidden" ---
export const Card: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
    <div className={`bg-card rounded-xl shadow-md ${className}`}>
        {children}
    </div>
);

export const CardHeader: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
    <div className={`p-4 border-b border-border-color ${className || ''}`}>
        {children}
    </div>
);

export const CardTitle: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
    <h3 className={`text-sm font-medium text-text-primary ${className || ''}`}>
        {children}
    </h3>
);

export const CardContent: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
    <div className={`p-4 ${className || ''}`}>
        {children}
    </div>
);