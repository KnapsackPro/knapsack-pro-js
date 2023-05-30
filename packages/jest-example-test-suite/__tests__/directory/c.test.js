const cModule = require('../../src/c');

it("c test", () => {
  expect(2 + 2).toBe(4);
});

it("to text", () => {
  expect(cModule.toText(123)).toBe('123');
});
