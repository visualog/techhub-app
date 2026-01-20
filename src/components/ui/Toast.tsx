import React from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
    message: string;
    type: ToastType;
    onClose: () => void;
}

export function Toast({ message, type, onClose }: ToastProps) {
    const styles = {
        success: 'bg-white dark:bg-zinc-800 border-l-4 border-green-500 text-zinc-900 dark:text-zinc-100',
        error: 'bg-white dark:bg-zinc-800 border-l-4 border-red-500 text-zinc-900 dark:text-zinc-100',
        info: 'bg-white dark:bg-zinc-800 border-l-4 border-blue-500 text-zinc-900 dark:text-zinc-100',
    };

    const icons = {
        success: <CheckCircle className="w-5 h-5 text-green-500" />,
        error: <AlertCircle className="w-5 h-5 text-red-500" />,
        info: <Info className="w-5 h-5 text-blue-500" />,
    };

    return (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-md shadow-lg border border-black/5 dark:border-white/5 min-w-[300px] max-w-sm ${styles[type]}`}>
            {icons[type]}
            <p className="flex-1 text-sm font-medium">{message}</p>
            <button onClick={onClose} className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors">
                <X className="w-4 h-4 opacity-50" />
            </button>
        </div>
    );
}
