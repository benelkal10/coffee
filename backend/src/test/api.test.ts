// Set environment variables before importing app
process.env.NODE_ENV = 'test';
process.env.USE_MOCK = 'true';

import test from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import { app } from '../app';
import { mockOrders, stopMockWorker } from '../mock/mockStore';


test('API Integration Tests', async (t) => {
  mockOrders.length = 0;

  await t.test('POST /api/orders - Should create order and return 201', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({
        userName: 'John Doe',
        role: 'employee',
        timeType: 'now',
      });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.userName, 'John Doe');
    assert.strictEqual(res.body.role, 'employee');
    assert.strictEqual(res.body.done, false);
  });

  await t.test('POST /api/orders - Should fail with 400 on empty username', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({
        userName: '   ',
        role: 'employee',
        timeType: 'now',
      });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.error, 'Username must be a non-empty string');
  });

  await t.test('GET /api/orders - Should fetch orders log', async () => {
    const res = await request(app).get('/api/orders');
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.body));
    assert.strictEqual(res.body.length, 1);
    assert.strictEqual(res.body[0].userName, 'John Doe');
  });

  await t.test('GET /api/reports - Should query monthly reports', async () => {
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;

    const res = await request(app)
      .get(`/api/reports?year=${year}&month=${month}`);

    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.body));
  });

  await t.test('GET /api/histogram - Should fetch analytics histogram', async () => {
    const res = await request(app).get('/api/histogram');
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.body.labels));
    assert.ok(Array.isArray(res.body.data));
  });

  // Teardown
  stopMockWorker();
});

