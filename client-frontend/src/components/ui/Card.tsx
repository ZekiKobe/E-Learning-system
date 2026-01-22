import type { HTMLAttributes } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Optional compact variant for tighter padding */
  compact?: boolean;
}

/**
 * Simple Card wrapper used across the learner-facing UI for grouping content.
 * Keeps border / background styles consistent with the existing design.
 */
export function Card({ compact = false, className = '', children, ...rest }: CardProps) {
  const padding = compact ? 'p-4' : 'p-6';
  return (
    <div
      className={`bg-primary border border-primary rounded-xl shadow-sm card-hover ${padding} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}


