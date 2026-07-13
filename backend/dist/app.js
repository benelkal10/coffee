"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const db_1 = require("./config/db");
const coffeeWorker_1 = require("./workers/coffeeWorker");
const orderController_1 = require("./controllers/orderController");
const reportsController_1 = require("./controllers/reportsController");
const histogramController_1 = require("./controllers/histogramController");
const rateLimiter_1 = require("./middleware/rateLimiter");
const app = (0, express_1.default)();
const port = process.env.PORT || 5000;
// Connect to Database
(0, db_1.connectDB)();
// Start Queue Worker
(0, coffeeWorker_1.startCoffeeWorker)();
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.post('/api/orders', (0, rateLimiter_1.orderRateLimiter)(10, 60 * 1000), orderController_1.handleCreateOrder);
app.get('/api/orders', orderController_1.handleGetOrders);
app.get('/api/reports', reportsController_1.handleGetReports);
app.get('/api/histogram', histogramController_1.handleGetHistogram);
// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date() });
});
// Start Server
app.listen(port, () => {
    console.log(`Backend server running on port ${port}`);
});
