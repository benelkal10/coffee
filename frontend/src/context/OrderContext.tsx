import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
}

const OrderContext = createContext<OrderContextProps | undefined>(undefined);

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeProgress, setActiveProgress] = useState(0);

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

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to place order.');
    }

    // Instantly refresh list to show newly added order
    await fetchOrders();
  }, [fetchOrders]);

  // Polling loop
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 1000);
    return () => clearInterval(interval);
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
      activeProgress
    }}>
      {children}
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
