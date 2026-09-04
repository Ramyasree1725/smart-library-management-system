import assert from 'node:assert';
import test from 'node:test';
import { analyzeBookDemand } from '../server/utils/predictor.js';

test('analyzeBookDemand correctly analyzes turnover ratio', () => {
  const book = { _id: 'b_test', title: 'Test Volume', totalCopies: 5, availableCopies: 2, borrowCount: 20 };
  const res = analyzeBookDemand(book, []);
  assert.strictEqual(res.turnoverRatio, 4);
});
