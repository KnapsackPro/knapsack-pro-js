import { relative } from 'path';
import type { Vitest, TestModule } from 'vitest/node';

// This is similar to `exit()` but does not `process.exit()` to allow Knapsack Pro to execute the next batch:
// https://github.com/vitest-dev/vitest/blob/f441c6fab25e579c5b7dd3dd50538416f415fbae/packages/vitest/src/node/core.ts#L1645
export const closeWithTimeout = async (
  vitest: Vitest,
  delay: number,
): Promise<{ timedOut: boolean }> => {
  let timer: NodeJS.Timeout | undefined = undefined;
  let timedOut = false;
  const timeoutPromise = new Promise<void>((resolve) => {
    timer = setTimeout(() => {
      timedOut = true;
      resolve();
    }, delay);
  });

  await Promise.race([vitest.close(), timeoutPromise]);

  clearTimeout(timer);

  return { timedOut };
};

// Extracts test states and folds the following durations:
//   - `duration` hooks and test
//   - `collectDuration` import and transform
//   - `setupDuration` setupFiles duration
export const extractState = (testModules: TestModule[]) => {
  const recordedPaths: Record<string, number> = {};
  const failedPaths: Set<string> = new Set();

  for (const testModule of testModules) {
    const startupDuration =
      (testModule.diagnostic().collectDuration +
        testModule.diagnostic().setupDuration) /
      1000;

    for (const testCase of testModule.children.allTests()) {
      const filePath = relative(
        testCase.project.vitest.config.root,
        testCase.module.moduleId,
      );

      // Vitest fills `location` when invoked with `--includeTaskLocation`
      const path =
        testCase.location === undefined
          ? filePath
          : `${filePath}:${testCase.location.line}`;

      const duration = (testCase.diagnostic()?.duration ?? 0) / 1000;

      if (path in recordedPaths) {
        recordedPaths[path] += duration;
      } else {
        recordedPaths[path] = startupDuration + duration;
      }

      if (testCase.result().state === 'failed') {
        failedPaths.add(path);
      }
    }
  }

  return { recordedPaths, failedPaths };
};

export const normalizePaths = (
  scheduledPaths: string[],
  recordedPaths: Record<string, number>,
) => {
  return Object.entries(recordedPaths).reduce<Record<string, number>>(
    (acc, [path, time]) => {
      if (scheduledPaths.includes(path)) {
        return { ...acc, [path]: (acc[path] ?? 0) + time };
      } else {
        const filePath = path.replace(/:\d+$/, '');
        return { ...acc, [filePath]: (acc[filePath] ?? 0) + time };
      }
    },
    scheduledPaths.reduce((acc, path) => ({ ...acc, [path]: 0 }), {}),
  );
};
