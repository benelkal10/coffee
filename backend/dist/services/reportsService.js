"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMonthlyOrders = void 0;
const order_1 = require("../models/order");
const mockStore_1 = require("../mock/mockStore");
const getMonthlyOrders = async (year, month) => {
    if (process.env.USE_MOCK === 'true') {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59, 999);
        return mockStore_1.mockOrders
            .filter((order) => {
            const time = order.createdAt.getTime();
            return time >= startDate.getTime() && time <= endDate.getTime();
        })
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
    // month is 1-indexed (1-12)
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);
    return await order_1.Order.find({
        createdAt: {
            $gte: startDate,
            $lte: endDate,
        },
    }).sort({ createdAt: -1 });
};
exports.getMonthlyOrders = getMonthlyOrders;
