import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerDocument } from './config/swagger';
import { connectDB } from './config/db';
import { startCoffeeWorker } from './workers/coffeeWorker';
import { recoverPendingOrders } from './services/orderService';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';
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

// Swagger API Documentation (mounted at /api)
app.use('/api', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Centralized error handler
app.use(errorHandler);

// Start Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    logger.info(`Backend server running on port ${port}`);
  });
}

export { app };



