"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startCoffeeWorker = void 0;
const bullmq_1 = require("bullmq");
const redis_1 = require("../config/redis");
const order_1 = require("../models/order");
const mockStore_1 = require("../mock/mockStore");
const startCoffeeWorker = () => {
    if (process.env.USE_MOCK === 'true') {
        (0, mockStore_1.startMockWorker)();
        return null;
    }
    const worker = new bullmq_1.Worker('coffee-preparation', async (job) => {
        const { orderId } = job.data;
        console.log(`[Worker] Started preparing order: ${orderId}`);
        // Fetch order from DB
        const order = await order_1.Order.findById(orderId);
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
    }, {
        connection: redis_1.redisConnection,
        concurrency: 1, // Prepare one coffee at a time
    });
    worker.on('completed', (job) => {
        console.log(`[Worker] Job ${job.id} completed successfully`);
    });
    worker.on('failed', (job, err) => {
        console.error(`[Worker] Job ${job?.id} failed with error:`, err);
    });
    return worker;
};
exports.startCoffeeWorker = startCoffeeWorker;
