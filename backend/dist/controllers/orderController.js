"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleGetOrders = exports.handleCreateOrder = void 0;
const orderService_1 = require("../services/orderService");
const order_1 = require("../models/order");
const mockStore_1 = require("../mock/mockStore");
const handleCreateOrder = async (req, res) => {
    try {
        const { userName, role, password, timeType, delayMinutes } = req.body;
        if (typeof userName !== 'string' || !userName.trim()) {
            return res.status(400).json({ error: 'Username must be a non-empty string' });
        }
        const trimmedName = userName.trim();
        if (trimmedName.length < 2 || trimmedName.length > 50) {
            return res.status(400).json({ error: 'Username must be between 2 and 50 characters' });
        }
        // Prevent Excel formula injection (starting with =, +, -, @)
        if (/^[=+\-@]/.test(trimmedName)) {
            return res.status(400).json({ error: 'Username cannot start with =, +, -, or @' });
        }
        if (role !== 'employee' && role !== 'boss') {
            return res.status(400).json({ error: 'Invalid role. Must be employee or boss' });
        }
        if (timeType !== 'now' && timeType !== 'later') {
            return res.status(400).json({ error: 'Invalid time type. Must be now or later' });
        }
        let parsedDelay = 0;
        if (timeType === 'later') {
            if (delayMinutes === undefined || delayMinutes === null) {
                return res.status(400).json({ error: 'Delay minutes is required when time type is later' });
            }
            parsedDelay = parseInt(delayMinutes.toString(), 10);
            if (isNaN(parsedDelay) || parsedDelay < 1 || parsedDelay > 1440) {
                return res.status(400).json({ error: 'Delay minutes must be an integer between 1 and 1440' });
            }
        }
        const order = await (0, orderService_1.createOrder)({
            userName: trimmedName,
            role,
            password,
            timeType,
            delayMinutes: parsedDelay,
        });
        return res.status(201).json(order);
    }
    catch (error) {
        console.error('Create order controller error:', error);
        return res.status(400).json({ error: error.message || 'Failed to create order' });
    }
};
exports.handleCreateOrder = handleCreateOrder;
const handleGetOrders = async (req, res) => {
    try {
        if (process.env.USE_MOCK === 'true') {
            const pendingMocks = mockStore_1.mockOrders.filter(o => !o.done).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
            const completedMocks = mockStore_1.mockOrders.filter(o => o.done).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 50);
            return res.status(200).json([...pendingMocks, ...completedMocks]);
        }
        // Fetch all unfinished orders to make sure they are always shown
        const pendingOrders = await order_1.Order.find({ done: false }).sort({ createdAt: -1 });
        // Fetch latest 50 completed orders
        const completedOrders = await order_1.Order.find({ done: true }).sort({ createdAt: -1 }).limit(50);
        return res.status(200).json([...pendingOrders, ...completedOrders]);
    }
    catch (error) {
        console.error('Get orders controller error:', error);
        return res.status(500).json({ error: 'Failed to fetch orders' });
    }
};
exports.handleGetOrders = handleGetOrders;
