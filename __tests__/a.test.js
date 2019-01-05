const sleep = waitTimeInMs =>
  new Promise(resolve => setTimeout(resolve, waitTimeInMs));

it("a test", () => {
  expect(2 + 2).toBe(4);
});

it("sleep", async () => {
  await sleep(2000);
});
