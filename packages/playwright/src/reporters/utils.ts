import { relative, basename, join } from 'path';
import type { FullConfig, TestCase } from '@playwright/test/reporter';

// Given       /Users/john/code/project/tests/example.spec.ts
// and rootDir /Users/john/code/project/tests
// returns     tests/example.spec.ts
export const pathWithRootDir = (test: TestCase, config: FullConfig): string => {
  const relativeFile = relative(config.rootDir, test.location.file);
  return join(basename(config.rootDir), relativeFile);
};
