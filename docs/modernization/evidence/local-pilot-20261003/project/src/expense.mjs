/** Process-local persistence for the bounded UC-001 smoke. */
export class InMemoryExpenseStore {
  #records = [];
  #failNext = false;

  failNextWrite() {
    this.#failNext = true;
  }

  insert(expense) {
    // UC-001 A2: fail before mutation, preserving every earlier record.
    if (this.#failNext) {
      this.#failNext = false;
      throw new Error('Expense persistence failed');
    }
    const record = structuredClone({
      ...expense,
      receiptId: String(this.#records.length + 1),
    });
    this.#records.push(record);
    return structuredClone(record);
  }

  list() {
    return structuredClone(this.#records);
  }
}

export function submitExpense(store, { amount, description = '' }) {
  // UC-001 BR-001 / A1: no coercion or non-finite monetary amounts.
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new RangeError('Amount must be a positive finite number');
  }
  // Pilot UC-001 BR-002 / A3: validate before any store mutation.
  const normalizedDescription = description ?? '';
  if (typeof normalizedDescription !== 'string') {
    throw new TypeError('Description must be a string');
  }
  if (Array.from(normalizedDescription).length > 200) {
    throw new RangeError('Description must be at most 200 Unicode code points');
  }
  return store.insert({
    amount,
    description: normalizedDescription,
    status: 'submitted',
    submitted_at: new Date().toISOString(),
  });
}
