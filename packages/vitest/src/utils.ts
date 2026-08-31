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

export const extractState = (testModules: TestModule[]) => {
  const recordedPaths: Record<string, number> = {};
  const failedPaths: Set<string> = new Set();
  for (const testModule of testModules) {
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
      recordedPaths[path] =
        (recordedPaths[path] ?? 0) +
        (testCase.diagnostic()?.duration ?? 0) / 1000;
      if (testCase.result().state === 'failed') {
        failedPaths.add(path);
      }
    }
  }

  // `testCase.diagnostic().duration` above is test/hook run time only. It excludes
  // importing and transforming the test file and its dependencies, which can dwarf
  // the run time itself and is invisible to queue-mode's balancer otherwise. Fold in
  // each file's collect (import + transform + suite-collection) and setup-file-import
  // time once per file so shard balancing reflects real wall-clock cost.
  for (const testModule of testModules) {
    const filePath = relative(
      testModule.project.vitest.config.root,
      testModule.moduleId,
    );
    const diagnostic = testModule.diagnostic();
    recordedPaths[filePath] =
      (recordedPaths[filePath] ?? 0) +
      ((diagnostic.collectDuration ?? 0) + (diagnostic.setupDuration ?? 0)) /
        1000;
  }

  return { recordedPaths, failedPaths };
};
