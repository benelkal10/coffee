import { Worker, Job } from 'bullmq';
import { redisConnection } from '../config/redis';
import { Order } from '../models/order';
import { startMockWorker } from '../mock/mockStore';

export const startCoffeeWorker = () => {
  if (process.env.USE_MOCK === 'true') {
    startMockWorker();
    return null as any;
  }

  const worker = new Worker(
    'coffee-preparation',
    async (job: Job) => {
      const { orderId } = job.data;
      console.log(`[Worker] Started preparing order: ${orderId}`);

      // Fetch order from DB
      const order = await Order.findById(orderId);
      if (!order) {
        console.error(`[Worker] Order not found: ${orderId}`);
        throw new Error(`Order ${orderId} not found`);
      }

      // Simulate preparation delay (5 seconds)
      await new Promise((resolve) => setTimeout(resolve, 5000));

      // Update order status to done
      order.done = true;
      order.completedAt = new Date();
      await order.save();

      console.log(`[Worker] Order completed: ${orderId}`);
    },
    {
      connection: redisConnection,
      concurrency: 1, // Prepare one coffee at a time
    }
  );

  worker.on('completed', (job) => {
    console.log(`[Worker] Job ${job.id} completed successfully`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[Worker] Job ${job?.id} failed with error:`, err);
  });

  return worker;
};
