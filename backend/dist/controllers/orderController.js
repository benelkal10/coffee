"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleGetOrders = exports.handleCreateOrder = void 0;
const orderService_1 = require("../services/orderService");
const order_1 = require("../models/order");
const mockStore_1 = require("../mock/mockStore");
const handleCreateOrder = async (req, res) => {
    try {
        const { userName, role, password, timeType, delayMinutes } = req.body;
        if (!userName || !role || !timeType) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const order = await (0, orderService_1.createOrder)({
            userName,
            role,
            password,
            timeType,
            delayMinutes: delayMinutes ? parseInt(delayMinutes.toString()) : 0,
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
            const sortedMocks = [...mockStore_1.mockOrders].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
            return res.status(200).json(sortedMocks);
        }
        const orders = await order_1.Order.find().sort({ createdAt: -1 }).limit(50);
        return res.status(200).json(orders);
    }
    catch (error) {
        console.error('Get orders controller error:', error);
        return res.status(500).json({ error: 'Failed to fetch orders' });
    }
};
exports.handleGetOrders = handleGetOrders;
