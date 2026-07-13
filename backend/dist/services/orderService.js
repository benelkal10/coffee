"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrder = exports.coffeeQueue = void 0;
const bullmq_1 = require("bullmq");
const redis_1 = require("../config/redis");
const order_1 = require("../models/order");
const mockStore_1 = require("../mock/mockStore");
exports.coffeeQueue = process.env.USE_MOCK === 'true'
    ? null
    : new bullmq_1.Queue('coffee-preparation', {
        connection: redis_1.redisConnection,
    });
const createOrder = async (orderData) => {
    const { userName, role, password, timeType, delayMinutes = 0 } = orderData;
    let priority = 2; // Default priority for employees
    if (role === 'boss') {
        const bossPassword = process.env.BOSS_PASSWORD || 'coffee_boss';
        if (password === bossPassword) {
            priority = 1; // Higher priority
        }
        else {
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
        mockStore_1.mockOrders.push(mockOrder);
        mockStore_1.mockQueue.push({
            orderId: mockOrder._id,
            priority,
            executeAt: Date.now() + delayMs,
        });
        console.log(`[Mock Queue] Order added: ${mockOrder._id} with delay ${delayMs}ms`);
        return mockOrder;
    }
    // Create order in MongoDB first
    const order = new order_1.Order({
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
        await exports.coffeeQueue.add('prepare-coffee', { orderId: order._id }, {
            priority,
            delay: delayMs,
            attempts: 3,
            backoff: 5000,
        });
    }
    catch (queueError) {
        // Rollback MongoDB write if enqueuing fails
        await order_1.Order.deleteOne({ _id: order._id });
        throw queueError;
    }
    return order;
};
exports.createOrder = createOrder;
