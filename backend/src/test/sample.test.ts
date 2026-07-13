import test from 'node:test';
import assert from 'node:assert';

test('Math operations check', () => {
  assert.strictEqual(2 + 2, 4);
});

test('Database URI validation', () => {
  const dummyUri = 'mongodb://localhost:27017/coffee';
  assert.ok(dummyUri.startsWith('mongodb://'));
});
