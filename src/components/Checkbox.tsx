import React, { useEffect, useRef } from 'react';

export const Checkbox: React.FC<{ checked: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; indeterminate?: boolean; title?: string }> = ({ checked, onChange, indeterminate, title }) => {
    const ref = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (ref.current) {
            ref.current.indeterminate = indeterminate || false;
        }
    }, [indeterminate]);

    return (
        <input
            ref={ref}
            type="checkbox"
            title={title}
            checked={checked}
            onChange={onChange}
            className="h-4 w-4 rounded border-border text-accent bg-background focus:ring-accent"
        />
    );
};
