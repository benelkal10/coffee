"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisConnection = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = parseInt(process.env.REDIS_PORT || '6379');
exports.redisConnection = process.env.USE_MOCK === 'true'
    ? null
    : new ioredis_1.default({
        host: redisHost,
        port: redisPort,
        maxRetriesPerRequest: null,
    });
if (exports.redisConnection) {
    exports.redisConnection.on('connect', () => {
        console.log('Redis connected successfully');
    });
    exports.redisConnection.on('error', (err) => {
        console.error('Redis connection error:', err);
    });
}
else {
    console.log('Redis: Running in Mock Mode (Bypassed Connection)');
}
