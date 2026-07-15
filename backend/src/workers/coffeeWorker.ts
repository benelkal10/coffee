import { Worker, Job } from 'bullmq';
import { redisConnection } from '../config/redis';
import { Order } from '../models/order';
import { startMockWorker } from '../mock/mockStore';
import { logger } from '../utils/logger';
import { getIO } from '../config/socket';

export const startCoffeeWorker = () => {
  if (process.env.USE_MOCK === 'true') {
    startMockWorker();
    return null as any;
  }

  const worker = new Worker(
    'coffee-preparation',
    async (job: Job) => {
      const { orderId } = job.data;
      logger.info(`[Worker] Started preparing order: ${orderId}`);

      // Fetch order from DB
      const order = await Order.findById(orderId);
      if (!order) {
        logger.error(`[Worker] Order not found: ${orderId}`);
        throw new Error(`Order ${orderId} not found`);
      }

      // Update order status to brewing
      order.status = 'brewing';
      order.brewingStartedAt = new Date();
      await order.save();
      
      try {
        getIO().emit('order:updated', order);
      } catch (e: any) {
        logger.error(`[Worker Socket Error] ${e.message}`);
      }

      // Simulate preparation delay (5 seconds)
      await new Promise((resolve) => setTimeout(resolve, 5000));

      // Update order status to done
      order.done = true;
      order.status = 'done';
      order.completedAt = new Date();
      await order.save();

      try {
        getIO().emit('order:updated', order);
      } catch (e: any) {
        logger.error(`[Worker Socket Error] ${e.message}`);
      }

      logger.info(`[Worker] Order completed: ${orderId}`);
    },
    {
      connection: redisConnection,
      concurrency: 1, // Prepare one coffee at a time
    }
  );

  worker.on('completed', (job) => {
    logger.info(`[Worker] Job ${job.id} completed successfully`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`[Worker] Job ${job?.id} failed: ${err.message}`);
  });

  return worker;
};

