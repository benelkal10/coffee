import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export default function Button({
  variant = 'primary',
  children,
  icon,
  style,
  disabled,
  ...props
}: ButtonProps) {
  const getStyles = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      border: 'none',
      borderRadius: '8px',
      cursor: disabled ? 'not-allowed' : 'pointer',
      fontWeight: 700,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      padding: '1rem',
      fontSize: '0.95rem',
      opacity: disabled ? 0.6 : 1,
    };

    if (variant === 'primary') {
      return {
        ...base,
        background: 'linear-gradient(to right, var(--accent-primary), var(--accent-secondary))',
        color: '#fff',
        boxShadow: disabled ? 'none' : '0 4px 14px 0 var(--accent-glow)',
      };
    }

    if (variant === 'secondary') {
      return {
        ...base,
        background: 'rgba(217, 119, 6, 0.1)',
        border: '1px solid var(--border-color)',
        color: 'var(--text-primary)',
      };
    }

    // ghost variant
    return {
      ...base,
      background: 'transparent',
      color: 'var(--text-secondary)',
    };
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (variant === 'primary') {
      e.currentTarget.style.opacity = '0.9';
    } else if (variant === 'secondary') {
      e.currentTarget.style.background = 'rgba(217, 119, 6, 0.2)';
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (variant === 'primary') {
      e.currentTarget.style.opacity = '1';
    } else if (variant === 'secondary') {
      e.currentTarget.style.background = 'rgba(217, 119, 6, 0.1)';
    }
  };

  return (
    <button
      style={{ ...getStyles(), ...style }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      disabled={disabled}
      {...props}
    >
      {icon && <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>}
      <span>{children}</span>
    </button>
  );
}
