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

for (const [label, unit] of [['ASCII', 'a'], ['astral Unicode', '😀']]) {
  test(`UC-001 BR-002 accepts 200 ${label} code points`, () => {
    const store = new InMemoryExpenseStore();
    const description = unit.repeat(200);
    const record = submitExpense(store, { amount: 12000, description });
    assert.equal(record.description, description);
    assert.equal(Array.from(record.description).length, 200);
    assert.deepEqual(store.list(), [record]);
  });
  test(`UC-001 BR-002/A3 rejects 201 ${label} code points without mutation`, () => {
    const store = new InMemoryExpenseStore();
    submitExpense(store, { amount: 25, description: 'earlier' });
    const before = store.list();
    assert.throws(() => submitExpense(store, { amount: 12000, description: unit.repeat(201) }), {
      name: 'RangeError', message: 'Description must be at most 200 Unicode code points',
    });
    assert.deepEqual(store.list(), before);
  });
}

for (const [label, description] of [['number', 42], ['array', []], ['object', {}]]) {
  test(`UC-001 BR-002/A3 rejects ${label} description without mutation`, () => {
    const store = new InMemoryExpenseStore();
    submitExpense(store, { amount: 25, description: 'earlier' });
    const before = store.list();
    assert.throws(() => submitExpense(store, { amount: 12000, description }), {
      name: 'TypeError', message: 'Description must be a string',
    });
    assert.deepEqual(store.list(), before);
  });
}

for (const [label, description] of [['omitted', undefined], ['null', null], ['empty', '']]) {
  test(`UC-001 BR-002 normalizes ${label} optional description to empty string`, () => {
    const store = new InMemoryExpenseStore();
    const input = { amount: 12000 };
    if (label !== 'omitted') input.description = description;
    const record = submitExpense(store, input);
    assert.equal(record.description, '');
    assert.deepEqual(store.list(), [record]);
  });
}

test('TC-002 service slice corrects 201 to 200 and preserves earlier records', () => {
  const store = new InMemoryExpenseStore();
  const first = submitExpense(store, { amount: 25, description: 'earlier' });
  const before = store.list();
  assert.throws(() => submitExpense(store, { amount: 12000, description: 'a'.repeat(201) }), RangeError);
  assert.deepEqual(store.list(), before);
  const corrected = submitExpense(store, { amount: 12000, description: 'a'.repeat(200) });
  assert.equal(corrected.description, 'a'.repeat(200));
  assert.notEqual(corrected.receiptId, first.receiptId);
  assert.deepEqual(store.list(), [first, corrected]);
});
