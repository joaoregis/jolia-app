import React, { useState, useRef, useLayoutEffect } from 'react';
import ReactDOM from 'react-dom';

export const Tooltip: React.FC<{ content: React.ReactNode, children: React.ReactNode }> = ({ content, children }) => {
    const triggerRef = useRef<HTMLDivElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useLayoutEffect(() => {
        if (isVisible && triggerRef.current && tooltipRef.current) {
            const { top, left, width } = triggerRef.current.getBoundingClientRect();
            const { width: tooltipWidth, height: tooltipHeight } = tooltipRef.current.getBoundingClientRect();
            tooltipRef.current.style.left = `${left + window.scrollX + width / 2 - tooltipWidth / 2}px`;
            tooltipRef.current.style.top = `${top + window.scrollY - tooltipHeight - 8}px`;
        }
    }, [isVisible]);

    return (
        <div ref={triggerRef} onMouseEnter={() => setIsVisible(true)} onMouseLeave={() => setIsVisible(false)} className="relative flex items-center">
            {children}
            {isVisible && ReactDOM.createPortal(
                <div ref={tooltipRef} className="fixed bg-card text-text-primary text-xs rounded-md py-1.5 px-2.5 z-50 shadow-lg pointer-events-none animate-fade-in border border-border-color">
                    {content}
                </div>, document.body
            )}
        </div>
    );
};
