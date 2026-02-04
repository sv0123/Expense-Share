import React, { useState } from 'react';

/**
 * Consistent "random" avatar per user: initial letter + hash-based background color
 * so each user gets a unique avatar that stays the same across the app.
 */
export default function Avatar({ userId, name, size = 'md', className = '', round = true, title }) {
    const displayName = name || '?';
    const initial = displayName[0]?.toUpperCase() || '?';
    const sizeClass = size === 'sm' ? 'w-8 h-8 text-xs' : size === 'lg' ? 'w-12 h-12 text-lg' : 'w-10 h-10 text-sm';
    const seed = (userId || name || '').toString();
    let hash = 0;
    for (let i = 0; i < seed.length; i++) hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    const hue = Math.abs(hash % 360);
    const bg = `hsl(${hue}, 52%, 42%)`;

    return (
        <div
            className={`${sizeClass} ${round ? 'rounded-full' : 'rounded-lg'} shrink-0 flex items-center justify-center font-semibold text-white select-none ${className}`}
            style={{ backgroundColor: bg }}
            title={title}
        >
            {initial}
        </div>
    );
}
