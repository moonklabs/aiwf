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
  return store.insert({
    amount,
    description,
    status: 'submitted',
    submitted_at: new Date().toISOString(),
  });
}
