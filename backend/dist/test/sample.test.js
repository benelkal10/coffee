"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const node_assert_1 = __importDefault(require("node:assert"));
(0, node_test_1.default)('Math operations check', () => {
    node_assert_1.default.strictEqual(2 + 2, 4);
});
(0, node_test_1.default)('Database URI validation', () => {
    const dummyUri = 'mongodb://localhost:27017/coffee';
    node_assert_1.default.ok(dummyUri.startsWith('mongodb://'));
});
