"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleGetHistogram = void 0;
const histogramService_1 = require("../services/histogramService");
const handleGetHistogram = async (req, res) => {
    try {
        const histogramData = await (0, histogramService_1.getOrdersHistogram)();
        return res.status(200).json(histogramData);
    }
    catch (error) {
        console.error('Histogram controller error:', error);
        return res.status(500).json({ error: 'Failed to fetch histogram data' });
    }
};
exports.handleGetHistogram = handleGetHistogram;
