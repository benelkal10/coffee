import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import { Snackbar, Alert } from '@mui/material';
import { OrderItem } from '../components/OrderItemCard';

interface OrderContextProps {
  orders: OrderItem[];
  loading: boolean;
  error: string | null;
  fetchOrders: () => Promise<void>;
  addOrder: (orderData: {
    userName: string;
    role: 'employee' | 'boss';
    password?: string;
    timeType: 'now' | 'later';
    delayMinutes: number;
  }) => Promise<void>;
  activeOrder: OrderItem | undefined;
  activeProgress: number;
  toast: { message: string; severity: 'success' | 'info' | 'error' } | null;
  clearToast: () => void;
}

const OrderContext = createContext<OrderContextProps | undefined>(undefined);

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeProgress, setActiveProgress] = useState(0);
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'info' | 'error' } | null>(null);

  const clearToast = useCallback((event?: any, reason?: string) => {
    console.log('[Toast Debug] clearToast called. Reason:', reason, 'Event:', event);
    if (reason === 'clickaway') {
      return;
    }
    setToast(null);
  }, []);

  useEffect(() => {
    console.log('[Toast Debug] State changed to:', toast);
  }, [toast]);

  // Request browser Notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      const response = await fetch('/api/orders');
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      setOrders(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error connecting to backend');
    } finally {
      setLoading(false);
    }
  }, []);

  const addOrder = useCallback(async (orderData: {
    userName: string;
    role: 'employee' | 'boss';
    password?: string;
    timeType: 'now' | 'later';
    delayMinutes: number;
  }) => {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    let result;
    try {
      result = await response.json();
    } catch {
      throw new Error(`Server returned an invalid response (HTTP ${response.status}).`);
    }

    if (!response.ok) {
      throw new Error(result.error || 'Failed to place order.');
    }

    // Save order ID to trace for completion notification
    if (result._id) {
      try {
        const stored = JSON.parse(localStorage.getItem('myOrderIds') || '[]');
        localStorage.setItem('myOrderIds', JSON.stringify([...stored, result._id]));
      } catch (err) {
        console.error('[LocalStorage Error]', err);
      }
    }

    // Instantly refresh list to show newly added order
    await fetchOrders();
  }, [fetchOrders]);

  // WebSocket + fallback polling loop
  useEffect(() => {
    fetchOrders();

    // Connect to backend via proxy path /socket.io
    const socket = io({
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('[Socket] Connected to server successfully');
    });

    socket.on('order:updated', (updatedOrder: OrderItem) => {
      console.log('[Socket Event] Received updated order:', updatedOrder);
      
      setOrders(prev => {
        const exists = prev.some(o => o._id === updatedOrder._id);
        if (exists) {
          return prev.map(o => o._id === updatedOrder._id ? updatedOrder : o);
        } else {
          return [updatedOrder, ...prev];
        }
      });

      // Show Desktop Notification when the user's specific order is done
      try {
        const storedOrderIds = JSON.parse(localStorage.getItem('myOrderIds') || '[]');
        console.log('[Socket Event] storedOrderIds in localStorage:', storedOrderIds);
        console.log('[Socket Event] orderId:', updatedOrder._id);
        console.log('[Socket Event] is in storedOrderIds?:', storedOrderIds.includes(updatedOrder._id));
        console.log('[Socket Event] status:', updatedOrder.status);

        if (updatedOrder.status === 'done' && storedOrderIds.includes(updatedOrder._id)) {
          console.log('[Socket Event] Notification trigger matched!');
          // Trigger in-app toast fallback
          setToast({
            message: `☕ Your coffee is ready, ${updatedOrder.userName}!`,
            severity: 'success'
          });

          // Trigger native desktop notification (if allowed)
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('☕ Coffee Ready!', {
              body: `Hey ${updatedOrder.userName}, your coffee is ready for pickup!`,
              requireInteraction: true
            });
          }
        }
      } catch (err) {
        console.error('[Notification Error]', err);
      }
    });

    // 5-second fallback poll loop in case socket disconnects
    const fallbackInterval = setInterval(fetchOrders, 5000);

    return () => {
      socket.disconnect();
      clearInterval(fallbackInterval);
    };
  }, [fetchOrders]);

  // Determine active brewing order (the one with status === 'brewing' or oldest unfinished)
  const activeOrder = orders.find(order => order.status === 'brewing') || 
                      [...orders].reverse().find(order => !order.done && order.status !== 'done');

  // Brewing progress loop
  useEffect(() => {
    if (!activeOrder || activeOrder.status !== 'brewing') {
      setActiveProgress(0);
      return;
    }

    const calculateProgress = () => {
      const started = activeOrder.brewingStartedAt ? new Date(activeOrder.brewingStartedAt).getTime() : Date.now();
      const elapsed = Date.now() - started;
      const percentage = Math.min(100, Math.max(0, (elapsed / 5000) * 100));
      setActiveProgress(percentage);
    };

    calculateProgress();
    const progressInterval = setInterval(calculateProgress, 100);
    return () => clearInterval(progressInterval);
  }, [activeOrder?._id, activeOrder?.status, activeOrder?.brewingStartedAt]);

  return (
    <OrderContext.Provider value={{
      orders,
      loading,
      error,
      fetchOrders,
      addOrder,
      activeOrder,
      activeProgress,
      toast,
      clearToast
    }}>
      {children}
      {toast && (
        <Snackbar
          open={true}
          autoHideDuration={6000}
          onClose={clearToast}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{ zIndex: 9999, mt: 8 }}
        >
          <Alert onClose={clearToast} severity={toast.severity} sx={{ width: '100%', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
            {toast.message}
          </Alert>
        </Snackbar>
      )}
    </OrderContext.Provider>
  );
}

// Custom Hook to separate UI from Logic
export function useOrders() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
}
