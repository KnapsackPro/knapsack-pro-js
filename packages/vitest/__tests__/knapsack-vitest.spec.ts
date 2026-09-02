import { mkdtemp, realpath, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Writable } from 'node:stream';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { startVitest as runVitest, type Vitest } from 'vitest/node';

import { closeWithTimeout, extractState, normalizePaths } from '../src/utils';

const startVitest = (
  root: string,
  testFile: string | string[],
  options: {
    includeTaskLocation?: boolean;
    setupFiles?: string[];
  } = {},
) => {
  const output = new Writable({
    write(_chunk, _encoding, callback) {
      callback();
    },
  });

  return runVitest(
    'test',
    Array.isArray(testFile) ? testFile : [testFile],
    {
      globals: true,
      root,
      watch: false,
      ...options,
    },
    undefined,
    { stdout: output, stderr: output },
  );
};

describe('#closeWithTimeout', () => {
  describe('when vitest.close() resolves', () => {
    let root: string;
    let originalExitCode: typeof process.exitCode;

    beforeEach(async () => {
      root = await realpath(await mkdtemp(join(tmpdir(), 'knapsack-vitest-')));
      originalExitCode = process.exitCode;
    });

    afterEach(async () => {
      await rm(root, { recursive: true, force: true });
      process.exitCode = originalExitCode;
    });

    it('reports no timeout', async () => {
      const testFile = join(root, 'example.test.js');
      await writeFile(
        testFile,
        `test('passes', () => { expect(true).toBe(true); });`,
      );

      const vitest = await startVitest(root, [testFile]);

      const { timedOut } = await closeWithTimeout(vitest, 5_000);
      expect(timedOut).toBe(false);
    }, 5_000);
  });

  it('when timedOut it returns without waiting for the close', async () => {
    let closed = false;
    const vitest = {
      close: () =>
        new Promise<void>(() => {
          setTimeout(() => (closed = true), 20);
        }),
    } as Vitest;

    const { timedOut } = await closeWithTimeout(vitest, 10);

    expect(closed).toBe(false);
    expect(timedOut).toBe(true);
  });
});

describe('#extractState', () => {
  let root: string;
  let vitest: Vitest | undefined;
  let originalExitCode: typeof process.exitCode;

  beforeEach(async () => {
    root = await realpath(await mkdtemp(join(tmpdir(), 'knapsack-vitest-')));
    vitest = undefined;
    originalExitCode = process.exitCode;
  });

  afterEach(async () => {
    await vitest?.close();
    await rm(root, { recursive: true, force: true });
    process.exitCode = originalExitCode;
  });

  it('extracts recorded and failed paths from a Vitest run', async () => {
    const testFile = join(root, 'example.test.js');

    await writeFile(
      testFile,
      `test('passes', async () => {
          await new Promise(resolve => setTimeout(resolve, 10));
          expect(true).toBe(true);
        });`,
    );

    vitest = await startVitest(root, testFile);

    const { recordedPaths, failedPaths } = extractState(
      vitest.state.getTestModules(),
    );

    expect(recordedPaths).toEqual({
      'example.test.js': expect.toSatisfy((value) => parseFloat(value) > 0.01),
    });
    expect(failedPaths).toEqual(new Set());
  }, 5_000);

  it('extracts failed paths from a failed Vitest run', async () => {
    const testFile = join(root, 'example.test.js');

    await writeFile(
      testFile,
      `test('fails', async () => {
          expect(true).toBe(false);
        });`,
    );

    vitest = await startVitest(root, testFile);

    const { failedPaths } = extractState(vitest.state.getTestModules());

    expect(failedPaths).toEqual(new Set(['example.test.js']));
  }, 5_000);

  it('sums execution times for tests in the same file', async () => {
    const testFile = join(root, 'example.test.js');

    await writeFile(
      testFile,
      `test('first', async () => {
          await new Promise(resolve => setTimeout(resolve, 10));
        });
        test('second', async () => {
          await new Promise(resolve => setTimeout(resolve, 10));
        });`,
    );

    vitest = await startVitest(root, testFile);

    const { recordedPaths, failedPaths } = extractState(
      vitest.state.getTestModules(),
    );

    expect(recordedPaths).toEqual({
      'example.test.js': expect.toSatisfy((value) => parseFloat(value) > 0.02),
    });
    expect(failedPaths).toEqual(new Set());
  }, 5_000);

  it('includes test collection time in the recorded duration', async () => {
    const testFile = join(root, 'example.test.js');

    await writeFile(
      testFile,
      `await new Promise(resolve => setTimeout(resolve, 10));

        test('passes', () => {
          expect(true).toBe(true);
        });`,
    );

    vitest = await startVitest(root, testFile);

    const { recordedPaths } = extractState(vitest.state.getTestModules());

    expect(recordedPaths).toEqual({
      'example.test.js': expect.toSatisfy((value) => parseFloat(value) > 0.01),
    });
  }, 5_000);

  it('includes setup file time in the recorded duration', async () => {
    const setupFile = join(root, 'setup.js');
    const testFile = join(root, 'example.test.js');

    await writeFile(
      setupFile,
      `await new Promise(resolve => setTimeout(resolve, 10));`,
    );
    await writeFile(
      testFile,
      `test('passes', () => {
          expect(true).toBe(true);
        });`,
    );

    vitest = await startVitest(root, testFile, {
      setupFiles: [setupFile],
    });

    const { recordedPaths } = extractState(vitest.state.getTestModules());

    expect(recordedPaths).toEqual({
      'example.test.js': expect.toSatisfy((value) => parseFloat(value) > 0.01),
    });
  }, 5_000);

  it('includes setup file time for each test file', async () => {
    const setupFile = join(root, 'setup.js');
    const firstTestFile = join(root, 'first.test.js');
    const secondTestFile = join(root, 'second.test.js');

    await writeFile(
      setupFile,
      `await new Promise(resolve => setTimeout(resolve, 10));`,
    );
    await Promise.all([
      writeFile(firstTestFile, `test('first', () => {});`),
      writeFile(secondTestFile, `test('second', () => {});`),
    ]);

    vitest = await startVitest(root, [firstTestFile, secondTestFile], {
      setupFiles: [setupFile],
    });

    const { recordedPaths } = extractState(vitest.state.getTestModules());

    expect(recordedPaths).toEqual({
      'first.test.js': expect.toSatisfy((value) => parseFloat(value) > 0.01),
      'second.test.js': expect.toSatisfy((value) => parseFloat(value) > 0.01),
    });
  }, 5_000);

  it('counts setup file time only once for multiple tests in one file', async () => {
    const setupFile = join(root, 'setup.js');
    const testFile = join(root, 'example.test.js');

    await writeFile(
      setupFile,
      `await new Promise(resolve => setTimeout(resolve, 10));`,
    );
    await writeFile(
      testFile,
      `test('first', () => {});
        test('second', () => {});`,
    );

    vitest = await startVitest(root, testFile, {
      setupFiles: [setupFile],
    });

    const testModules = vitest.state.getTestModules();
    const testModule = testModules[0]!;
    const startupDuration =
      (testModule.diagnostic().collectDuration +
        testModule.diagnostic().setupDuration) /
      1000;
    const testDuration = testModule.children
      .allTests()
      .reduce(
        (duration, testCase) =>
          duration + (testCase.diagnostic()?.duration ?? 0) / 1000,
        0,
      );

    const { recordedPaths } = extractState(testModules);

    expect(recordedPaths['example.test.js']).toBeGreaterThan(0.01);
    expect(recordedPaths['example.test.js']).toBeCloseTo(
      startupDuration + testDuration,
    );
  }, 5_000);

  it('counts setup file time once for each line path', async () => {
    const setupFile = join(root, 'setup.js');
    const testFile = join(root, 'example.test.js');

    await writeFile(
      setupFile,
      `await new Promise(resolve => setTimeout(resolve, 10));`,
    );
    await writeFile(
      testFile,
      `test('first', () => {});
        test('second', () => {});`,
    );

    vitest = await startVitest(root, testFile, {
      includeTaskLocation: true,
      setupFiles: [setupFile],
    });

    const { recordedPaths } = extractState(vitest.state.getTestModules());

    expect(recordedPaths).toEqual({
      'example.test.js:1': expect.toSatisfy(
        (value) => parseFloat(value) > 0.01,
      ),
      'example.test.js:2': expect.toSatisfy(
        (value) => parseFloat(value) > 0.01,
      ),
    });
  }, 5_000);

  it('records line paths when task locations are enabled', async () => {
    const testFile = join(root, 'example.test.js');

    await writeFile(
      testFile,
      `test('passes', () => {
          expect(true).toBe(true);
        });

        test('fails', () => {
          expect(true).toBe(false);
        });`,
    );

    vitest = await startVitest(root, testFile, { includeTaskLocation: true });

    const { recordedPaths, failedPaths } = extractState(
      vitest.state.getTestModules(),
    );

    expect(recordedPaths).toEqual({
      'example.test.js:1': expect.any(Number),
      'example.test.js:5': expect.any(Number),
    });
    expect(failedPaths).toEqual(new Set(['example.test.js:5']));
  }, 5_000);

  it('returns empty state when there are no test modules', () => {
    expect(extractState([])).toEqual({
      recordedPaths: {},
      failedPaths: new Set(),
    });
  });
});

describe('#normalizePaths', () => {
  it('concatenates the recorded paths assigning 0 seconds to the scheduled ones', () => {
    const scheduledPaths = [
      'x.spec.js',
      'y.spec.js',
      'z.spec.js',
      'c.spec.js',
      'd.spec.js',
    ];

    const recordedPaths = {
      'c.spec.js': 4,
      'd.spec.js': 3,
    };

    const actual = normalizePaths(scheduledPaths, recordedPaths);
    const expected = {
      'x.spec.js': 0,
      'y.spec.js': 0,
      'z.spec.js': 0,
      'c.spec.js': 4,
      'd.spec.js': 3,
    };

    expect(actual).toEqual(expected);
  });

  it('transforms linePaths to filePaths', () => {
    const scheduledPaths = ['x.spec.js:1', 'y.spec.js'];

    const recordedPaths = {
      'x.spec.js:1': 4,
      'y.spec.js:1': 3,
    };

    const actual = normalizePaths(scheduledPaths, recordedPaths);
    const expected = {
      'x.spec.js:1': 4,
      'y.spec.js': 3,
    };

    expect(actual).toEqual(expected);
  });
});
