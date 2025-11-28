// src/components/RatingsList.tsx
import React from 'react';
import { StarRating } from './StarRating';
import { Subprofile } from '../types';

interface RatingsListProps {
    subprofiles: Subprofile[];
    ratings: Record<string, number>;
    onRatingChange?: (subprofileId: string, rating: number) => void;
    readOnly?: boolean;
}

export const RatingsList: React.FC<RatingsListProps> = ({
    subprofiles,
    ratings,
    onRatingChange,
    readOnly = false
}) => {
    return (
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {subprofiles.map(sp => (
                <div key={sp.id} className="flex items-center justify-between bg-background/50 p-2 rounded border border-border/50">
                    <span className="text-sm text-text-primary">{sp.name}</span>
                    <StarRating
                        rating={ratings[sp.id] || 0}
                        onChange={onRatingChange ? (r) => onRatingChange(sp.id, r) : undefined}
                        readOnly={readOnly}
                        size={16}
                    />
                </div>
            ))}
        </div>
    );
};
