import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SwipeableTabContentProps {
    activeTabId: string;
    tabs: { id: string; label?: string }[];
    onTabChange: (tabId: string) => void;
    children: React.ReactNode;
    className?: string;
}

const variants = {
    enter: (direction: number) => ({
        x: direction > 0 ? 300 : -300,
        opacity: 0
    }),
    center: {
        zIndex: 1,
        x: 0,
        opacity: 1
    },
    exit: (direction: number) => ({
        zIndex: 0,
        x: direction < 0 ? 300 : -300,
        opacity: 0
    })
};

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
};

export const SwipeableTabContent: React.FC<SwipeableTabContentProps> = ({
    activeTabId,
    tabs,
    onTabChange,
    children,
    className = ""
}) => {
    const prevTabIdRef = React.useRef(activeTabId);
    const [direction, setDirection] = useState(0);

    if (activeTabId !== prevTabIdRef.current) {
        const activeIndex = tabs.findIndex(t => t.id === activeTabId);
        const prevIndex = tabs.findIndex(t => t.id === prevTabIdRef.current);

        if (activeIndex > prevIndex) {
            setDirection(1);
        } else if (activeIndex < prevIndex) {
            setDirection(-1);
        }
        prevTabIdRef.current = activeTabId;
    }

    const handleDragEnd = (_: any, { offset, velocity }: any) => {
        const swipe = swipePower(offset.x, velocity.x);
        const activeIndex = tabs.findIndex(t => t.id === activeTabId);

        if (swipe < -swipeConfidenceThreshold) {
            // Swipe Left -> Next Tab
            if (activeIndex < tabs.length - 1) {
                onTabChange(tabs[activeIndex + 1].id);
            }
        } else if (swipe > swipeConfidenceThreshold) {
            // Swipe Right -> Prev Tab
            if (activeIndex > 0) {
                onTabChange(tabs[activeIndex - 1].id);
            }
        }
    };

    return (
        <div className={`relative overflow-hidden ${className}`}>
            <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                    key={activeTabId}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                        x: { type: "spring", stiffness: 500, damping: 30 },
                        opacity: { duration: 0.15 }
                    }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    onDragEnd={handleDragEnd}
                    className="w-full"
                >
                    {children}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};
