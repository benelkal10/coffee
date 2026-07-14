// Enable mock mode for testing before importing services
process.env.USE_MOCK = 'true';

import test from 'node:test';
import assert from 'node:assert';
import { createOrder } from '../services/orderService';
import { mockOrders, mockQueue } from '../mock/mockStore';
import { getMonthlyOrders } from '../services/reportsService';
import { UnauthorizedError } from '../utils/errors';


test('Order Service Unit Tests', async (t) => {
  // Clear mock database before each test suite action
  mockOrders.length = 0;
  mockQueue.length = 0;

  await t.test('1. Should create employee order successfully', async () => {
    const order = await createOrder({
      userName: 'Alice',
      role: 'employee',
      timeType: 'now',
    });

    assert.strictEqual(order.userName, 'Alice');
    assert.strictEqual(order.role, 'employee');
    assert.strictEqual(order.priority, 2);
    assert.strictEqual(order.done, false);
    assert.strictEqual(mockOrders.length, 1);
    assert.strictEqual(mockQueue.length, 1);
  });

  await t.test('2. Should create boss order with high priority when password is correct', async () => {
    mockOrders.length = 0;
    mockQueue.length = 0;

    const order = await createOrder({
      userName: 'Bob',
      role: 'boss',
      password: 'coffee_boss',
      timeType: 'now',
    });

    assert.strictEqual(order.userName, 'Bob');
    assert.strictEqual(order.role, 'boss');
    assert.strictEqual(order.priority, 1); // VIP priority
    assert.strictEqual(mockOrders.length, 1);
  });

  await t.test('3. Should fail to create boss order if password incorrect', async () => {
    await assert.rejects(
      async () => {
        await createOrder({
          userName: 'Charlie',
          role: 'boss',
          password: 'wrong_password',
          timeType: 'now',
        });
      },
      (err: any) => {
        assert.ok(err instanceof UnauthorizedError);
        assert.strictEqual(err.message, 'Incorrect boss password');
        return true;
      }
    );
  });

  await t.test('4. Should query monthly orders correctly', async () => {
    mockOrders.length = 0;
    
    // Add custom mock orders with different dates
    mockOrders.push({
      _id: '1',
      userName: 'Alice',
      role: 'employee',
      timeType: 'now',
      delayMinutes: 0,
      priority: 2,
      done: true,
      createdAt: new Date(2026, 5, 15), // June 15, 2026
    });

    mockOrders.push({
      _id: '2',
      userName: 'Bob',
      role: 'employee',
      timeType: 'now',
      delayMinutes: 0,
      priority: 2,
      done: true,
      createdAt: new Date(2026, 6, 1), // July 1, 2026
    });

    const juneOrders = await getMonthlyOrders(2026, 6); // Month 6 = June
    assert.strictEqual(juneOrders.length, 1);
    assert.strictEqual(juneOrders[0].userName, 'Alice');

    const julyOrders = await getMonthlyOrders(2026, 7); // Month 7 = July
    assert.strictEqual(julyOrders.length, 1);
    assert.strictEqual(julyOrders[0].userName, 'Bob');
  });
});
