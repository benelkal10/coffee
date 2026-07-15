import { logger } from '../utils/logger';

export interface MockOrder {
  _id: string;
  userName: string;
  role: 'employee' | 'boss';
  timeType: 'now' | 'later';
  delayMinutes: number;
  priority: number;
  done: boolean;
  status?: 'pending' | 'brewing' | 'done';
  brewingStartedAt?: Date;
  createdAt: Date;
  completedAt?: Date;
}

export const mockOrders: MockOrder[] = [];

// Simple mock queue array
export const mockQueue: { orderId: string; priority: number; executeAt: number }[] = [];

let isProcessing = false;

const processMockQueue = async () => {
  if (isProcessing) return;
  isProcessing = true;

  try {
    const now = Date.now();
    // Filter jobs that are ready to execute
    const readyJobs = mockQueue
      .filter((job) => job.executeAt <= now)
      .sort((a, b) => {
        // Lower priority number = VIP (Boss = 1, Employee = 2)
        if (a.priority !== b.priority) {
          return a.priority - b.priority;
        }
        return a.executeAt - b.executeAt;
      });

    if (readyJobs.length > 0) {
      const nextJob = readyJobs[0];
      
      // Remove from queue
      const index = mockQueue.indexOf(nextJob);
      if (index > -1) {
        mockQueue.splice(index, 1);
      }

      const order = mockOrders.find((o) => o._id === nextJob.orderId);
      if (order) {
        order.status = 'brewing';
        order.brewingStartedAt = new Date();
        logger.info(`[Mock Worker] Brewing coffee for: ${order.userName} (ID: ${order._id})`);
        // Simulate 5 seconds coffee preparation
        await new Promise((resolve) => setTimeout(resolve, 5000));
        order.done = true;
        order.status = 'done';
        order.completedAt = new Date();
        logger.info(`[Mock Worker] Coffee ready for: ${order.userName} (ID: ${order._id})`);
      }
    }
  } catch (err: any) {
    logger.error(`[Mock Worker] Error: ${err.message}`);
  } finally {
    isProcessing = false;
  }
};

let mockInterval: NodeJS.Timeout | null = null;

// Tick every 1 second
export const startMockWorker = () => {
  logger.info('[Mock Worker] Scheduled worker queue started.');
  mockInterval = setInterval(processMockQueue, 1000);
  if (mockInterval && typeof mockInterval.unref === 'function') {
    mockInterval.unref();
  }
};

export const stopMockWorker = () => {
  if (mockInterval) {
    clearInterval(mockInterval);
    mockInterval = null;
    logger.info('[Mock Worker] Scheduled worker queue stopped.');
  }
};

