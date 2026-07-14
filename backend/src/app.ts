import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db';
import { startCoffeeWorker } from './workers/coffeeWorker';
import { recoverPendingOrders } from './services/orderService';
import { handleCreateOrder, handleGetOrders } from './controllers/orderController';
import { handleGetReports } from './controllers/reportsController';
import { handleGetHistogram } from './controllers/histogramController';
import { orderRateLimiter } from './middleware/rateLimiter';

const app = express();
const port = process.env.PORT || 5000;

// Connect to Database & recover state
connectDB().then(() => {
  recoverPendingOrders();
});

// Start Queue Worker
startCoffeeWorker();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.post('/api/orders', orderRateLimiter(10, 60 * 1000), handleCreateOrder);
app.get('/api/orders', handleGetOrders);
app.get('/api/reports', handleGetReports);
app.get('/api/histogram', handleGetHistogram);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Start Server
app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
});
