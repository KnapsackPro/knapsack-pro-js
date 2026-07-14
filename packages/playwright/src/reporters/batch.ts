import { writeFileSync, mkdirSync } from 'fs';
import type {
  FullConfig,
  FullResult,
  TestCase,
  TestResult,
  Suite,
} from '@playwright/test/reporter';

import type { ReporterV2 } from './reporterV2.js';
import { pathWithRootDir } from './utils.js';

export type Batch = {
  recordedPaths: Record<string, number>;
  failedPaths: string[];
  isTestSuiteGreen: boolean;
};

class BatchReporter implements ReporterV2 {
  config!: FullConfig;
  recordedPaths: Map<string, number>;
  failedPathsRoot: Set<string>;
  failedPathsByProject: Map<string, Set<string>>;
  serialPaths: Set<string>;

  constructor() {
    this.recordedPaths = new Map();
    this.failedPathsRoot = new Set();
    this.failedPathsByProject = new Map();
    this.serialPaths = new Set();
  }

  version(): 'v2' {
    return 'v2';
  }

  printsToStdio?() {
    // Allow Playwright to add a standard terminal reporter
    // https://github.com/microsoft/playwright/blob/485aaf7fff96e4c9505e26af27e6db283622da62/packages/playwright/src/runner/reporters.ts#L72-L79
    return false;
  }

  onConfigure(config: FullConfig) {
    this.config = config;
    config.projects.forEach((project) =>
      this.failedPathsByProject.set(project.name, new Set()),
    );
  }

  // Executed per project per retry
  onTestEnd(test: TestCase, result: TestResult) {
    const project = test.parent.project();
    const failedPaths =
      (project && this.failedPathsByProject.get(project.name)) ??
      this.failedPathsRoot;
    const filePath = pathWithRootDir(test, this.config);
    const linePath = `${filePath}:${test.location.line}`;

    const duration =
      (this.recordedPaths.get(linePath) ?? 0) + result.duration / 1000;
    this.recordedPaths.set(linePath, duration);

    if (result.status === 'failed' || result.status === 'timedOut') {
      failedPaths.add(linePath);
    }

    if (result.status === 'passed') {
      failedPaths.delete(linePath); // If it was marked failed on a previous retry, remove it.
    }

    if (this._isSerial(test.parent)) {
      this.serialPaths.add(linePath);
    }
  }

  _isSerial(suite: (Suite & { _parallelMode?: string }) | undefined): boolean {
    if (suite === undefined) return false;
    if (suite._parallelMode === 'serial') {
      return true;
    }
    return this._isSerial(suite.parent);
  }

  onEnd(result: FullResult) {
    const failedPaths = new Set(this.failedPathsRoot);
    this.failedPathsByProject.forEach((paths) => {
      paths.forEach((path) => {
        if (this.serialPaths.has(path)) {
          failedPaths.add(path.replace(/:\d+$/, ''));
        } else {
          failedPaths.add(path);
        }
      });
    });

    const batch: Batch = {
      recordedPaths: Object.fromEntries(this.recordedPaths),
      failedPaths: Array.from(failedPaths),
      isTestSuiteGreen: result.status === 'passed',
    };

    // Ensure .knapsack-pro dir exists since this reporter may run outside of
    // @knapsack-pro/playwright (because it's configured in Playwright config).
    mkdirSync('.knapsack-pro', { recursive: true });
    writeFileSync('.knapsack-pro/batch.json', JSON.stringify(batch));
  }
}

export default BatchReporter;
