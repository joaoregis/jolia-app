// src/components/Card.tsx

import React from 'react';

export const Card: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
    <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden ${className}`}>
        {children}
    </div>
);

export const CardHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        {children}
    </div>
);

export const CardTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h3 className="text-sm font-medium text-slate-800 dark:text-slate-200">
        {children}
    </h3>
);

export const CardContent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="p-4">
        {children}
    </div>
);
