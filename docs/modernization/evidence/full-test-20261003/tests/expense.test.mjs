import test from 'node:test';
import assert from 'node:assert/strict';
import { InMemoryExpenseStore, submitExpense } from '../src/expense.mjs';

test('UC-001 success persists amount, description, submitted state and receipt', () => {
  const store = new InMemoryExpenseStore();
  const first = submitExpense(store, { amount: 12000, description: '팀 회식' });
  assert.equal(first.amount, 12000);
  assert.equal(first.description, '팀 회식');
  assert.equal(first.status, 'submitted');
  assert.match(first.receiptId, /^\d+$/);
  assert.ok(Number.isFinite(Date.parse(first.submitted_at)));
  assert.deepEqual(store.list(), [first]);
  const second = submitExpense(store, { amount: 0.01 });
  assert.notEqual(second.receiptId, first.receiptId);
  assert.equal(store.list().length, 2);
  first.amount = 1;
  const snapshot = store.list();
  snapshot[0].description = 'changed';
  snapshot.pop();
  assert.equal(store.list()[0].amount, 12000);
  assert.equal(store.list()[0].description, '팀 회식');
  assert.equal(store.list().length, 2);
});

for (const amount of [0, -1, -100, NaN, Infinity, -Infinity, '12000', null, undefined]) {
  test(`UC-001 BR-001/A1 rejects ${String(amount)} without changing prior state`, () => {
    const store = new InMemoryExpenseStore();
    submitExpense(store, { amount: 25, description: 'earlier' });
    const before = store.list();
    assert.throws(() => submitExpense(store, { amount }), {
      name: 'RangeError', message: 'Amount must be a positive finite number',
    });
    assert.deepEqual(store.list(), before);
  });
}

test('TC-001 service slice permits correction from -100 to 12000', () => {
  const store = new InMemoryExpenseStore();
  assert.throws(() => submitExpense(store, { amount: -100, description: '팀 회식' }), RangeError);
  assert.deepEqual(store.list(), []);
  const record = submitExpense(store, { amount: 12000, description: '팀 회식' });
  assert.deepEqual(store.list(), [record]);
  assert.equal(record.amount, 12000);
  assert.equal(record.description, '팀 회식');
  assert.equal(record.status, 'submitted');
  assert.ok(record.receiptId);
});

test('UC-001 A2 storage failure preserves earlier records and permits recovery', () => {
  const store = new InMemoryExpenseStore();
  const first = submitExpense(store, { amount: 100, description: 'earlier' });
  const before = store.list();
  store.failNextWrite();
  assert.throws(() => submitExpense(store, { amount: 200, description: 'failed' }),
    { message: 'Expense persistence failed' });
  assert.deepEqual(store.list(), before);
  const recovered = submitExpense(store, { amount: 300, description: 'recovered' });
  assert.notEqual(recovered.receiptId, first.receiptId);
  assert.deepEqual(store.list(), [first, recovered]);
});
