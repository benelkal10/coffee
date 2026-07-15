import { Queue } from 'bullmq';
import { redisConnection } from '../config/redis';
import { Order } from '../models/order';
import { mockOrders, mockQueue } from '../mock/mockStore';
import { logger } from '../utils/logger';
import { UnauthorizedError } from '../utils/errors';

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
      throw new UnauthorizedError('Incorrect boss password');
    }
  }

  const delayMs = timeType === 'later' ? delayMinutes * 60 * 1000 : 0;

  if (process.env.USE_MOCK === 'true') {
    const mockOrder: any = {
      _id: Math.random().toString(36).substring(2, 9),
      userName,
      role,
      timeType,
      delayMinutes: timeType === 'later' ? delayMinutes : 0,
      priority,
      done: false,
      status: 'pending',
      createdAt: new Date(),
    };
    mockOrders.push(mockOrder);
    mockQueue.push({
      orderId: mockOrder._id,
      priority,
      executeAt: Date.now() + delayMs,
    });
    logger.info(`[Mock Queue] Order added: ${mockOrder._id} with delay ${delayMs}ms`);
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
  logger.info(`[OrderService] Created new order: ${order._id} for user: ${order.userName} (role: ${order.role}, timeType: ${order.timeType})`);

  try {
    // Add to BullMQ
    await coffeeQueue.add(
      'prepare-coffee',
      { orderId: order._id },
      {
        jobId: order._id.toString(),
        priority,
        delay: delayMs,
        attempts: 3,
        backoff: 5000,
      }
    );
  } catch (queueError: any) {
    logger.error(`[OrderService] Queue enqueue failed for order ${order._id}: ${queueError.message}`);
    // Rollback MongoDB write if enqueuing fails
    await Order.deleteOne({ _id: order._id });
    throw queueError;
  }

  return order;
};

export const recoverPendingOrders = async () => {
  if (process.env.USE_MOCK === 'true') {
    const pendingMock = mockOrders.filter(o => !o.done);
    for (const order of pendingMock) {
      const elapsed = Date.now() - new Date(order.createdAt).getTime();
      const delayMs = order.timeType === 'later' 
        ? Math.max(0, (order.delayMinutes * 60 * 1000) - elapsed)
        : 0;
      
      mockQueue.push({
        orderId: order._id,
        priority: order.priority,
        executeAt: Date.now() + delayMs,
      });
      logger.info(`[Mock Recovery] Re-enqueued order: ${order._id} with delay ${delayMs}ms`);
    }
    return;
  }

  try {
    const pendingOrders = await Order.find({ done: false });
    logger.info(`[Recovery] Found ${pendingOrders.length} incomplete orders in database`);

    for (const order of pendingOrders) {
      try {
        const existingJob = await coffeeQueue.getJob(order._id.toString());
        if (existingJob) {
          await existingJob.remove();
        }
      } catch (err: any) {
        logger.error(`[Recovery] Error checking/removing existing job ${order._id}: ${err.message}`);
      }

      const elapsed = Date.now() - order.createdAt.getTime();
      const delayMs = order.timeType === 'later'
        ? Math.max(0, (order.delayMinutes * 60 * 1000) - elapsed)
        : 0;

      await coffeeQueue.add(
        'prepare-coffee',
        { orderId: order._id },
        {
          jobId: order._id.toString(),
          priority: order.priority,
          delay: delayMs,
          attempts: 3,
          backoff: 5000,
        }
      );
      logger.info(`[Recovery] Re-enqueued order ${order._id} with updated delay ${delayMs}ms`);
    }
  } catch (error: any) {
    logger.error(`[Recovery] Failed to recover pending orders: ${error.message}`);
  }
};


