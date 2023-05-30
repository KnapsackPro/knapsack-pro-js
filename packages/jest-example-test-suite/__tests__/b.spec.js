const bModule = require('../src/b');

describe("b spec described", () => {
  it("b spec", () => {
    expect(2 + 2).toBe(4);
  });

  it("yet another b spec", () => {
    expect(2 + 2).toBe(4);
  });

  it("multiple test", () => {
    expect(bModule.multiple(2, 3)).toBe(6);
  });
});
