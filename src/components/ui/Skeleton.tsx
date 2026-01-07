import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    className?: string;
    width?: string | number;
    height?: string | number;
}

export default function Skeleton({ className = '', width, height, style, ...props }: SkeletonProps) {
    return (
        <div
            className={`skeleton ${className}`}
            style={{
                width: width,
                height: height,
                ...style // Allow overriding logic
            }}
            {...props}
        />
    );
}

// Add these styles to globals.css
