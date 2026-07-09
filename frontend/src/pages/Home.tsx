import { useEffect, useState } from 'react';
import { Coffee, RotateCcw, Clock, CheckCircle2, User } from 'lucide-react';

interface OrderItem {
  _id: string;
  userName: string;
  role: 'employee' | 'boss';
  timeType: 'now' | 'later';
  delayMinutes: number;
  priority: number;
  done: boolean;
  createdAt: string;
}

export default function Home() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/orders');
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      setOrders(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error connecting to backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 3000);
    return () => clearInterval(interval);
  }, []);

  // Determine active order (the oldest unfinished order)
  const activeOrder = [...orders]
    .reverse()
    .find(order => !order.done);

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0, background: 'linear-gradient(to right, #f5efe6, #d97706)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Smart Bar Dashboard
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 0 0' }}>Monitor real-time coffee orders and brewing queues.</p>
        </div>
        <button 
          onClick={fetchOrders}
          style={{
            background: 'rgba(217, 119, 6, 0.1)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            padding: '0.75rem',
            borderRadius: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(217, 119, 6, 0.2)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(217, 119, 6, 0.1)'}
        >
          <RotateCcw size={16} />
          <span>Refresh</span>
        </button>
      </header>

      {/* Coffee Machine Visual State */}
      <section className="glass-panel" style={{ padding: '2rem', display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: activeOrder ? 'radial-gradient(circle, rgba(217, 119, 6, 0.2) 0%, rgba(22, 18, 16, 0.8) 70%)' : 'rgba(22, 18, 16, 0.8)',
          border: `2px solid ${activeOrder ? 'var(--accent-primary)' : 'var(--border-color)'}`,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: activeOrder ? 'var(--accent-secondary)' : 'var(--text-secondary)',
          boxShadow: activeOrder ? '0 0 20px var(--accent-glow)' : 'none',
          position: 'relative'
        }}>
          {activeOrder && (
            <>
              <span className="steam-line steam-line-1" style={{ position: 'absolute', top: '15px', left: '45px', width: '2px', height: '10px', background: 'rgba(255,255,255,0.4)', borderRadius: '50%' }}></span>
              <span className="steam-line steam-line-2" style={{ position: 'absolute', top: '10px', left: '60px', width: '2px', height: '10px', background: 'rgba(255,255,255,0.4)', borderRadius: '50%' }}></span>
              <span className="steam-line steam-line-3" style={{ position: 'absolute', top: '15px', left: '75px', width: '2px', height: '10px', background: 'rgba(255,255,255,0.4)', borderRadius: '50%' }}></span>
            </>
          )}
          <Coffee size={48} className={activeOrder ? 'steam-icon' : ''} />
        </div>

        <div style={{ flex: 1, minWidth: '250px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            {activeOrder ? 'Machine Status: Brewing' : 'Machine Status: Idle'}
          </h2>
          {activeOrder ? (
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
              Preparing coffee for <strong style={{ color: 'var(--text-primary)' }}>{activeOrder.userName}</strong> ({activeOrder.role}).
              {activeOrder.timeType === 'later' && ' (Delayed scheduled job)'}
            </p>
          ) : (
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
              The brewer is ready. Place an order to start.
            </p>
          )}
        </div>
      </section>

      {/* Queue List */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Orders Log</h2>
        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', color: 'var(--text-primary)', padding: '1rem', borderRadius: '12px' }}>
            {error}
          </div>
        )}
        {loading ? (
          <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No orders found. Use the menu to submit one.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {orders.map((order) => {
              const isBrewing = activeOrder?._id === order._id;
              return (
                <div 
                  key={order._id} 
                  className="glass-panel fade-in"
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
                      color: 'var(--accent-primary)'
                    }}>
                      <User size={20} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 600 }}>{order.userName}</span>
                        <span style={{
                          fontSize: '0.7rem',
                          background: order.role === 'boss' ? 'rgba(217, 119, 6, 0.2)' : 'rgba(255,255,255,0.05)',
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
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
