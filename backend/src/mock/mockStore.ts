export interface MockOrder {
  _id: string;
  userName: string;
  role: 'employee' | 'boss';
  timeType: 'now' | 'later';
  delayMinutes: number;
  priority: number;
  done: boolean;
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
        console.log(`[Mock Worker] Brewing coffee for: ${order.userName} (ID: ${order._id})`);
        // Simulate 5 seconds coffee preparation
        await new Promise((resolve) => setTimeout(resolve, 5000));
        order.done = true;
        order.completedAt = new Date();
        console.log(`[Mock Worker] Coffee ready for: ${order.userName} (ID: ${order._id})`);
      }
    }
  } catch (err) {
    console.error('[Mock Worker] Error:', err);
  } finally {
    isProcessing = false;
  }
};

// Tick every 1 second
export const startMockWorker = () => {
  console.log('[Mock Worker] Scheduled worker queue started.');
  setInterval(processMockQueue, 1000);
};
