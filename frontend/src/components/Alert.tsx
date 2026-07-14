import React from 'react';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

interface AlertProps {
  type: 'error' | 'success' | 'info';
  message: string;
  style?: React.CSSProperties;
}

export default function Alert({ type, message, style }: AlertProps) {
  const getStyles = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      padding: '1rem',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      fontSize: '0.95rem',
      border: '1px solid transparent',
      ...style,
    };

    if (type === 'error') {
      return {
        ...base,
        background: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid var(--danger)',
        color: 'var(--text-primary)',
      };
    }

    if (type === 'success') {
      return {
        ...base,
        background: 'rgba(16, 185, 129, 0.1)',
        border: '1px solid var(--success)',
        color: 'var(--text-primary)',
      };
    }

    // info type
    return {
      ...base,
      background: 'rgba(59, 130, 246, 0.1)',
      border: '1px solid #3b82f6',
      color: 'var(--text-primary)',
    };
  };

  const renderIcon = () => {
    switch (type) {
      case 'error':
        return <AlertCircle size={20} style={{ color: 'var(--danger)', flexShrink: 0 }} />;
      case 'success':
        return <CheckCircle2 size={20} style={{ color: 'var(--success)', flexShrink: 0 }} />;
      case 'info':
      default:
        return <Info size={20} style={{ color: '#3b82f6', flexShrink: 0 }} />;
    }
  };

  return (
    <div className="fade-in" style={getStyles()}>
      {renderIcon()}
      <span>{message}</span>
    </div>
  );
}
