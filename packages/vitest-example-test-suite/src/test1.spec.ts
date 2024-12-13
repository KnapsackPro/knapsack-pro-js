import { expect, test } from "vitest";
import { add } from "./add";

test('adds 1 + 2 to equal 3', async () => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    expect(add(1, 2)).toBe(3);
}, 2000);
