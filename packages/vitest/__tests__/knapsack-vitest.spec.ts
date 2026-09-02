import { mkdtemp, realpath, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Writable } from 'node:stream';
import { describe, it, expect } from 'vitest';
import { startVitest as runVitest, type Vitest } from 'vitest/node';

import { closeWithTimeout, normalizePaths } from '../src/utils';

describe('#closeWithTimeout', () => {
  it('resolves once vitest.close() settles, well within the timeout', async () => {
    const root = await realpath(
      await mkdtemp(join(tmpdir(), 'knapsack-vitest-')),
    );
    const testFile = join(root, 'example.test.js');
    await writeFile(
      testFile,
      `test('passes', () => { expect(true).toBe(true); });`,
    );

    const output = new Writable({
      write(_chunk, _encoding, callback) {
        callback();
      },
    });

    const vitest = await runVitest(
      'test',
      [testFile],
      { globals: true, root, watch: false },
      undefined,
      { stdout: output, stderr: output },
    );

    try {
      const start = Date.now();
      const { timedOut } = await closeWithTimeout(vitest, 5_000);

      expect(timedOut).toBe(false);
      expect(Date.now() - start).toBeLessThan(5_000);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  }, 10_000);

  it('reports timedOut and does not wait for a hung close() to settle', async () => {
    let releaseClose: (() => void) | undefined;
    const hangingVitest = {
      close: () =>
        new Promise<void>((resolve) => {
          releaseClose = resolve;
        }),
    } as unknown as Vitest;

    const start = Date.now();
    const { timedOut } = await closeWithTimeout(hangingVitest, 50);

    expect(timedOut).toBe(true);
    expect(Date.now() - start).toBeLessThan(1_000);

    // Release the still-pending close() so it doesn't leak into later tests.
    releaseClose?.();
  });

  it('does not report timedOut when close() has already settled', async () => {
    const resolvedVitest = {
      close: () => Promise.resolve(),
    } as unknown as Vitest;

    const { timedOut } = await closeWithTimeout(resolvedVitest, 5_000);

    expect(timedOut).toBe(false);
  });

  it('does not leak an unhandled rejection if a hung close() later rejects after the timeout', async () => {
    let rejectClose: ((error: Error) => void) | undefined;
    const hangingVitest = {
      close: () =>
        new Promise<void>((_resolve, reject) => {
          rejectClose = reject;
        }),
    } as unknown as Vitest;

    const unhandledRejections: unknown[] = [];
    const onUnhandledRejection = (reason: unknown) => {
      unhandledRejections.push(reason);
    };
    process.on('unhandledRejection', onUnhandledRejection);

    try {
      const { timedOut } = await closeWithTimeout(hangingVitest, 20);
      expect(timedOut).toBe(true);

      rejectClose?.(new Error('close() failed after the timeout'));
      // Let the microtask queue flush so a leaked rejection would surface here.
      await new Promise((resolve) => setTimeout(resolve, 20));

      expect(unhandledRejections).toEqual([]);
    } finally {
      process.off('unhandledRejection', onUnhandledRejection);
    }
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
