import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'glass' | 'default';
}

export default function Card({ children, variant = 'default', style, ...props }: CardProps) {
  const cardStyle: React.CSSProperties = {
    borderRadius: '16px',
    background: variant === 'glass' ? 'rgba(255, 255, 255, 0.03)' : 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    backdropFilter: variant === 'glass' ? 'blur(12px)' : 'none',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    ...style,
  };

  return (
    <div style={cardStyle} {...props}>
      {children}
    </div>
  );
}
