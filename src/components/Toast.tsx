// src/components/Toast.tsx

import React from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { ToastMessage } from '../types';

interface ToastProps {
    toast: ToastMessage;
    onClose: () => void;
}

const icons = {
    success: <CheckCircle className="text-green-500" />,
    error: <AlertCircle className="text-red-500" />,
    info: <Info className="text-blue-500" />,
};

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
    return (
        <div className="bg-card text-text-primary rounded-lg shadow-lg p-4 flex items-start gap-4 animate-slide-in-right">
            <div className="flex-shrink-0">{icons[toast.type]}</div>
            <div className="flex-grow text-sm">{toast.message}</div>
            <button onClick={onClose} className="text-text-secondary hover:opacity-75">
                <X size={18} />
            </button>
        </div>
    );
};

interface ToastContainerProps {
    toasts: ToastMessage[];
    removeToast: (id: number) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => {
    return (
        <div className="fixed top-6 right-6 z-[100] space-y-3">
            {toasts.map(toast => (
                <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
            ))}
        </div>
    );
};