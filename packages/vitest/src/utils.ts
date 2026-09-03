import { relative } from 'path';
import type { TestModule } from 'vitest/node';

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
