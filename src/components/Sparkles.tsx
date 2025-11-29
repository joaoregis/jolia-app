import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SparklesProps {
    active: boolean;
    type?: 'small' | 'large';
    duration?: number;
}

const randomRange = (min: number, max: number) => Math.random() * (max - min) + min;

export const Sparkles: React.FC<SparklesProps> = ({ active, type = 'small', duration = 1000 }) => {
    // Increased particle count for better visibility
    const particleCount = type === 'large' ? 80 : 30;

    // Generate particles with random properties
    const particles = React.useMemo(() => Array.from({ length: particleCount }).map((_, i) => ({
        id: i,
        x: randomRange(-100, 100), // Spread relative to center
        y: randomRange(-100, 100),
        scale: randomRange(0.5, 1.5),
        color: type === 'large'
            ? ['#FFD700', '#FFA500', '#FF4500', '#00CED1', '#FF69B4', '#FFFFFF'][Math.floor(Math.random() * 6)]
            : ['#FFD700', '#FFA500'][Math.floor(Math.random() * 2)],
        delay: randomRange(0, 0.2)
    })), [particleCount, type]);

    const containerStyle: React.CSSProperties = type === 'large'
        ? {
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            background: 'radial-gradient(circle, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0) 70%)' // Subtle highlight
        }
        : {
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            overflow: 'visible'
        };

    return (
        <AnimatePresence>
            {active && (
                <motion.div
                    key="sparkles-container"
                    style={containerStyle}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {particles.map((particle) => (
                        <motion.div
                            key={particle.id}
                            initial={{
                                x: 0,
                                y: 0,
                                opacity: 1,
                                scale: 0
                            }}
                            animate={{
                                x: particle.x * (type === 'large' ? 10 : 3), // Increased spread
                                y: particle.y * (type === 'large' ? 10 : 3),
                                opacity: 0,
                                scale: particle.scale * (type === 'large' ? 2 : 1.2) // Increased scale
                            }}
                            transition={{
                                duration: (duration / 1000) * randomRange(0.8, 1.2),
                                ease: "easeOut",
                                delay: particle.delay
                            }}
                            style={{
                                position: 'absolute',
                                width: type === 'large' ? '10px' : '4px',
                                height: type === 'large' ? '10px' : '4px',
                                borderRadius: '50%',
                                backgroundColor: particle.color,
                                boxShadow: `0 0 ${type === 'large' ? '20px' : '8px'} ${particle.color}`
                            }}
                        />
                    ))}
                </motion.div>
            )}
        </AnimatePresence>
    );
};
