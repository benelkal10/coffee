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
  createdAt: string;
}

interface OrderItemCardProps {
  order: OrderItem;
  isBrewing: boolean;
}

export default function OrderItemCard({ order, isBrewing }: OrderItemCardProps) {
  return (
    <Card 
      className="fade-in"
      style={{
        padding: '1.25rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        borderLeft: order.priority === 1 ? '4px solid var(--accent-primary)' : '1px solid var(--border-color)'
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
        {order.done ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)' }}>
            <CheckCircle2 size={18} style={{ color: 'var(--success)' }} />
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--success)' }}>Ready</span>
          </div>
        ) : isBrewing ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)' }}>
            <div className="pulse-indicator"></div>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--accent-secondary)' }}>Brewing...</span>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
            <Clock size={18} />
            <span style={{ fontSize: '0.9rem' }}>In Queue</span>
          </div>
        )}
      </div>
    </Card>
  );
}
