import { useEffect, useState } from 'react';
import { RotateCcw, User, CheckCircle2, Clock } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import Alert from '../components/Alert';

interface OrderItem {
  _id: string;
  userName: string;
  role: 'employee' | 'boss';
  timeType: 'now' | 'later';
  delayMinutes: number;
  priority: number;
  done: boolean;
  createdAt: string;
  completedAt?: string;
}

export default function HistoryPage() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters and sorting states
  const [searchName, setSearchName] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/api/orders');
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      setOrders(data);
    } catch (err: any) {
      setError(err.message || 'Failed to connect to server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter logic
  const filteredOrders = orders.filter((order) => {
    const matchesName = order.userName.toLowerCase().includes(searchName.toLowerCase());
    const statusStr = order.done ? 'ready' : 'pending';
    const matchesStatus = filterStatus === 'all' || statusStr === filterStatus;

    return matchesName && matchesStatus;
  });

  // Sorting logic
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (sortBy === 'date-desc') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortBy === 'date-asc') {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    if (sortBy === 'name-asc') {
      return a.userName.localeCompare(b.userName);
    }
    if (sortBy === 'name-desc') {
      return b.userName.localeCompare(a.userName);
    }
    if (sortBy === 'status') {
      return (a.done === b.done) ? 0 : a.done ? -1 : 1;
    }
    return 0;
  });

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'ready', label: 'Ready' },
    { value: 'pending', label: 'Pending' },
  ];

  const sortOptions = [
    { value: 'date-desc', label: 'Date: Newest First' },
    { value: 'date-asc', label: 'Date: Oldest First' },
    { value: 'name-asc', label: 'Name: A to Z' },
    { value: 'name-desc', label: 'Name: Z to A' },
    { value: 'status', label: 'Status: Ready First' },
  ];

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0, background: 'linear-gradient(to right, var(--text-primary), var(--accent-primary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Order History
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 0 0' }}>Search, filter, and review all office coffee orders.</p>
        </div>
        <Button 
          variant="secondary"
          onClick={fetchOrders}
          disabled={loading}
          icon={<RotateCcw size={16} />}
        >
          Refresh
        </Button>
      </header>

      {/* Filter Toolbar */}
      <Card style={{ padding: '1.5rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <Input 
          label="Filter by Name"
          placeholder="Type user name..."
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          containerStyle={{ flex: 1, minWidth: '200px' }}
        />

        <Select 
          label="Filter by Status"
          value={filterStatus}
          options={statusOptions}
          onChange={(e) => setFilterStatus(e.target.value)}
          containerStyle={{ width: '180px' }}
        />

        <Select 
          label="Sort by"
          value={sortBy}
          options={sortOptions}
          onChange={(e) => setSortBy(e.target.value)}
          containerStyle={{ width: '200px' }}
        />
      </Card>

      {error && <Alert type="error" message={error} />}

      {loading ? (
        <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '3rem' }}>Loading order history...</div>
      ) : sortedOrders.length === 0 ? (
        <Card variant="glass" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          No orders match the selected filters.
        </Card>
      ) : (
        <Card style={{ overflowX: 'auto', padding: '1rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '1rem' }}>User Name</th>
                <th style={{ padding: '1rem' }}>Role</th>
                <th style={{ padding: '1rem' }}>Prep Time</th>
                <th style={{ padding: '1rem' }}>Delay</th>
                <th style={{ padding: '1rem' }}>Ordered At</th>
                <th style={{ padding: '1rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {sortedOrders.map((order) => (
                <tr key={order._id} style={{ borderBottom: '1px solid rgba(217, 119, 6, 0.08)', transition: 'background 0.2s' }} className="table-row-hover">
                  <td style={{ padding: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <User size={16} style={{ color: 'var(--accent-primary)' }} />
                    <span>{order.userName}</span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      fontSize: '0.75rem',
                      background: order.role === 'boss' ? 'rgba(217, 119, 6, 0.2)' : 'var(--border-color)',
                      color: order.role === 'boss' ? 'var(--accent-secondary)' : 'var(--text-secondary)',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '4px',
                      textTransform: 'uppercase',
                      fontWeight: 700
                    }}>
                      {order.role}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textTransform: 'capitalize' }}>{order.timeType}</td>
                  <td style={{ padding: '1rem' }}>
                    {order.timeType === 'later' ? `${order.delayMinutes} min` : '—'}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                      <span style={{ fontSize: '0.9rem' }}>{new Date(order.createdAt).toLocaleDateString()}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{new Date(order.createdAt).toLocaleTimeString()}</span>
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {order.done ? (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--success)' }}>
                        <CheckCircle2 size={16} />
                        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Ready</span>
                      </div>
                    ) : (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}>
                        <Clock size={16} />
                        <span style={{ fontSize: '0.9rem' }}>Pending</span>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
