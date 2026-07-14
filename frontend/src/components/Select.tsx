import React, { useState } from 'react';

interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  containerStyle?: React.CSSProperties;
}

export default function Select({ label, options, containerStyle, style, ...props }: SelectProps) {
  const [focused, setFocused] = useState(false);

  const labelStyle: React.CSSProperties = {
    fontSize: '0.9rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
  };

  const selectStyle: React.CSSProperties = {
    background: 'var(--bg-secondary)',
    border: `1px solid ${focused ? 'var(--accent-primary)' : 'var(--border-color)'}`,
    borderRadius: '8px',
    padding: '0.75rem 1rem',
    color: 'var(--text-primary)',
    outline: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    fontSize: '0.95rem',
    ...style,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', ...containerStyle }}>
      {label && <label style={labelStyle}>{label}</label>}
      <select
        style={selectStyle}
        onFocus={(e) => {
          setFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          props.onBlur?.(e);
        }}
        {...props}
      />
    </div>
  );
}
