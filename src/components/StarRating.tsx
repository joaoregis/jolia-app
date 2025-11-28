// src/components/StarRating.tsx
import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
    rating: number; // 0 to 10
    onChange?: (rating: number) => void;
    readOnly?: boolean;
    size?: number;
}

export const StarRating: React.FC<StarRatingProps> = ({
    rating,
    onChange,
    readOnly = false,
    size = 24
}) => {
    const [hoverRating, setHoverRating] = useState<number | null>(null);

    const displayRating = hoverRating !== null ? hoverRating : rating;

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, starIndex: number) => {
        if (readOnly) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const width = rect.width;

        // If mouse is on the left half, it's a half star (x.5)
        // If mouse is on the right half, it's a full star (x.0)
        // Rating is 0-10, so star 1 represents 1-2 points.
        // Index 0: 0.5 -> 1, 1.0 -> 2

        const isHalf = x < width / 2;
        const value = (starIndex * 2) + (isHalf ? 1 : 2);

        setHoverRating(value);
    };

    const handleMouseLeave = () => {
        if (readOnly) return;
        setHoverRating(null);
    };

    const handleClick = () => {
        if (readOnly || hoverRating === null || !onChange) return;
        onChange(hoverRating);
    };

    const stars = [];
    for (let i = 0; i < 5; i++) {
        const starValue = (i + 1) * 2;
        const isFull = displayRating >= starValue;
        const isHalf = displayRating >= starValue - 1 && displayRating < starValue;

        stars.push(
            <div
                key={i}
                className={`cursor-${readOnly ? 'default' : 'pointer'} relative`}
                onMouseMove={(e) => handleMouseMove(e, i)}
                onMouseLeave={handleMouseLeave}
                onClick={handleClick}
                style={{ width: size, height: size }}
            >
                {/* Background Star (Empty) */}
                <Star
                    size={size}
                    className="text-gray-300 absolute top-0 left-0"
                />

                {/* Foreground Star (Full or Half) */}
                {isFull && (
                    <Star
                        size={size}
                        className="text-yellow-400 fill-yellow-400 absolute top-0 left-0"
                    />
                )}
                {isHalf && (
                    <div className="absolute top-0 left-0 overflow-hidden" style={{ width: '50%' }}>
                        <Star
                            size={size}
                            className="text-yellow-400 fill-yellow-400"
                        />
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="flex gap-1">
            {stars}
            {!readOnly && (
                <span className="ml-2 text-sm text-gray-500 self-center">
                    {displayRating > 0 ? (displayRating / 2).toFixed(1) : '0.0'}
                </span>
            )}
        </div>
    );
};
