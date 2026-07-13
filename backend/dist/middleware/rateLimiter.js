"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderRateLimiter = void 0;
const rateLimitMap = new Map();
const orderRateLimiter = (limit, windowMs) => {
    return (req, res, next) => {
        const ip = req.ip || req.socket.remoteAddress || 'unknown';
        const now = Date.now();
        const rateData = rateLimitMap.get(ip);
        if (!rateData || now > rateData.resetTime) {
            rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
            return next();
        }
        if (rateData.count >= limit) {
            return res.status(429).json({ error: 'Too many requests. Please try again later.' });
        }
        rateData.count++;
        return next();
    };
};
exports.orderRateLimiter = orderRateLimiter;
