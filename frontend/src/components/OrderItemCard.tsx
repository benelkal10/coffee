import { useState, useEffect } from 'react';
import { Clock, CheckCircle2, User } from 'lucide-react';
import Card from './Card';

export interface OrderItem {
  _id: string;
  userName: string;
  role: 'employee' | 'boss';
  timeType: 'now' | 'later';
  delayMinutes: number;
  priority: number;
  done: boolean;
  status: 'pending' | 'brewing' | 'done';
  brewingStartedAt?: string;
  createdAt: string;
}

interface OrderItemCardProps {
  order: OrderItem;
  isBrewing: boolean;
}

export default function OrderItemCard({ order, isBrewing }: OrderItemCardProps) {
  const [progress, setProgress] = useState(0);
  const isCurrentlyBrewing = order.status === 'brewing' || (isBrewing && !order.done);

  useEffect(() => {
    if (!isCurrentlyBrewing) return;

    const calculateProgress = () => {
      const started = order.brewingStartedAt ? new Date(order.brewingStartedAt).getTime() : Date.now();
      const elapsed = Date.now() - started;
      const percentage = Math.min(100, Math.max(0, (elapsed / 5000) * 100));
      setProgress(percentage);
    };

    calculateProgress();
    const interval = setInterval(calculateProgress, 100);

    return () => clearInterval(interval);
  }, [isCurrentlyBrewing, order.brewingStartedAt]);

  return (
    <Card 
      className="fade-in"
      style={{
        position: 'relative',
        padding: '1.25rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        borderLeft: order.priority === 1 ? '4px solid var(--accent-primary)' : '1px solid var(--border-color)',
        overflow: 'hidden'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{
          background: 'rgba(217, 119, 6, 0.05)',
          padding: '0.75rem',
          borderRadius: '50%',
          color: 'var(--accent-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <User size={20} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontWeight: 600 }}>{order.userName}</span>
            <span style={{
              fontSize: '0.7rem',
              background: order.role === 'boss' ? 'rgba(217, 119, 6, 0.2)' : 'var(--border-color)',
              color: order.role === 'boss' ? 'var(--accent-secondary)' : 'var(--text-secondary)',
              padding: '0.15rem 0.4rem',
              borderRadius: '4px',
              textTransform: 'uppercase',
              fontWeight: 700
            }}>
              {order.role}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            <Clock size={12} />
            <span>{new Date(order.createdAt).toLocaleTimeString()}</span>
            {order.timeType === 'later' && (
              <span style={{ color: 'var(--accent-secondary)' }}>
                • Delayed {order.delayMinutes}m
              </span>
            )}
          </div>
        </div>
      </div>

      <div>
        {order.done || order.status === 'done' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)' }}>
            <CheckCircle2 size={18} style={{ color: 'var(--success)' }} />
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--success)' }}>Ready</span>
          </div>
        ) : isCurrentlyBrewing ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)' }}>
            <div className="pulse-indicator"></div>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--accent-secondary)' }}>
              Brewing... {progress > 0 && `(${Math.round(progress)}%)`}
            </span>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
            <Clock size={18} />
            <span style={{ fontSize: '0.9rem' }}>In Queue</span>
          </div>
        )}
      </div>

      {isCurrentlyBrewing && (
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '4px',
          background: 'rgba(255, 255, 255, 0.05)',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            background: 'linear-gradient(to right, var(--accent-primary), var(--accent-secondary))',
            transition: 'width 0.1s linear',
            boxShadow: '0 0 8px var(--accent-glow)'
          }} />
        </div>
      )}
    </Card>
  );
}
