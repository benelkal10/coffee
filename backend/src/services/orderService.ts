import { Queue } from 'bullmq';
import { redisConnection } from '../config/redis';
import { Order } from '../models/order';
import { mockOrders, mockQueue } from '../mock/mockStore';

export const coffeeQueue = process.env.USE_MOCK === 'true'
  ? null as any
  : new Queue('coffee-preparation', {
      connection: redisConnection,
    });

export const createOrder = async (orderData: {
  userName: string;
  role: 'employee' | 'boss';
  password?: string;
  timeType: 'now' | 'later';
  delayMinutes?: number;
}) => {
  const { userName, role, password, timeType, delayMinutes = 0 } = orderData;

  let priority = 2; // Default priority for employees
  
  if (role === 'boss') {
    const bossPassword = process.env.BOSS_PASSWORD || 'coffee_boss';
    if (password === bossPassword) {
      priority = 1; // Higher priority
    } else {
      throw new Error('Incorrect boss password');
    }
  }

  const delayMs = timeType === 'later' ? delayMinutes * 60 * 1000 : 0;

  if (process.env.USE_MOCK === 'true') {
    const mockOrder = {
      _id: Math.random().toString(36).substring(2, 9),
      userName,
      role,
      timeType,
      delayMinutes: timeType === 'later' ? delayMinutes : 0,
      priority,
      done: false,
      createdAt: new Date(),
    };
    mockOrders.push(mockOrder);
    mockQueue.push({
      orderId: mockOrder._id,
      priority,
      executeAt: Date.now() + delayMs,
    });
    console.log(`[Mock Queue] Order added: ${mockOrder._id} with delay ${delayMs}ms`);
    return mockOrder;
  }

  // Create order in MongoDB first
  const order = new Order({
    userName,
    role,
    timeType,
    delayMinutes: timeType === 'later' ? delayMinutes : 0,
    priority,
    done: false,
  });
  
  await order.save();

  try {
    // Add to BullMQ
    await coffeeQueue.add(
      'prepare-coffee',
      { orderId: order._id },
      {
        priority,
        delay: delayMs,
        attempts: 3,
        backoff: 5000,
      }
    );
  } catch (queueError) {
    // Rollback MongoDB write if enqueuing fails
    await Order.deleteOne({ _id: order._id });
    throw queueError;
  }

  return order;
};
