"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Order = void 0;
const mongoose_1 = require("mongoose");
const OrderSchema = new mongoose_1.Schema({
    userName: { type: String, required: true },
    role: { type: String, enum: ['employee', 'boss'], required: true },
    timeType: { type: String, enum: ['now', 'later'], required: true },
    delayMinutes: { type: Number, default: 0 },
    priority: { type: Number, default: 0 },
    done: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    completedAt: { type: Date }
});
exports.Order = (0, mongoose_1.model)('Order', OrderSchema);
