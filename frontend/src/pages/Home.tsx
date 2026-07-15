import { useOrders } from '../context/OrderContext';
import { Coffee, RotateCcw } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import OrderItemCard from '../components/OrderItemCard';

export default function Home() {
  const { orders, loading, error, fetchOrders, activeOrder, activeProgress } = useOrders();

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0, background: 'linear-gradient(to right, var(--text-primary), var(--accent-primary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Smart Bar Dashboard
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 0 0' }}>Monitor real-time coffee orders and brewing queues.</p>
        </div>
        <Button 
          variant="secondary"
          onClick={fetchOrders}
          icon={<RotateCcw size={16} />}
        >
          Refresh
        </Button>
      </header>

      {/* Queue Monitoring Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        <Card style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Pending Orders
          </span>
          <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
            {orders.filter(order => !order.done).length}
          </span>
        </Card>
        <Card style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Completed Orders
          </span>
          <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--success)' }}>
            {orders.filter(order => order.done).length}
          </span>
        </Card>
        <Card style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Total Orders Logged
          </span>
          <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {orders.length}
          </span>
        </Card>
      </div>

      {/* Coffee Machine Visual State */}
      <Card variant="glass" style={{ padding: '2rem', display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: activeOrder ? 'radial-gradient(circle, rgba(217, 119, 6, 0.2) 0%, var(--bg-secondary) 70%)' : 'var(--bg-secondary)',
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
            {activeOrder && activeOrder.status === 'brewing'
              ? 'Machine Status: Brewing'
              : activeOrder
              ? 'Machine Status: Preparing'
              : 'Machine Status: Idle'}
          </h2>
          {activeOrder ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                Preparing coffee for <strong style={{ color: 'var(--text-primary)' }}>{activeOrder.userName}</strong> ({activeOrder.role}).
                {activeOrder.timeType === 'later' && ' (Delayed scheduled job)'}
              </p>
              {activeOrder.status === 'brewing' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600 }}>
                    <span style={{ color: 'var(--accent-secondary)' }}>Brewing Progress</span>
                    <span style={{ color: 'var(--accent-secondary)' }}>{Math.round(activeProgress)}%</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${activeProgress}%`,
                      height: '100%',
                      background: 'linear-gradient(to right, var(--accent-primary), var(--accent-secondary))',
                      transition: 'width 0.1s linear',
                      boxShadow: '0 0 8px var(--accent-glow)'
                    }} />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
              The brewer is ready. Place an order to start.
            </p>
          )}
        </div>
      </Card>

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
          <Card variant="glass" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No orders found. Use the menu to submit one.
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {orders.map((order) => {
              const isBrewing = activeOrder?._id === order._id;
              return (
                <OrderItemCard 
                  key={order._id} 
                  order={order}
                  isBrewing={isBrewing}
                />
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
