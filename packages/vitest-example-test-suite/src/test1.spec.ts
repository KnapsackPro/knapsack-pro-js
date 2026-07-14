import { expect, test } from 'vitest';
import { add } from './add';

test('adds 1 + 2 to equal 3', async () => {
  await new Promise((resolve) => setTimeout(resolve, 1500));
  expect(add(1, 2)).toBe(3);
}, 2000);

test('adds 10 + 20 to equal 30', async () => {
  await new Promise((resolve) => setTimeout(resolve, 1500));
  expect(add(10, 20)).toBe(30);
}, 2000);
