import { writeFileSync } from 'fs';
import type {
  FullConfig,
  FullResult,
  TestCase,
  TestResult,
} from '@playwright/test/reporter';

import type { ReporterV2 } from './reporterV2.js';
import { pathWithRootDir } from './utils.js';

class BatchReporter implements ReporterV2 {
  config!: FullConfig;
  tally: Map<string, number>;

  constructor() {
    this.tally = new Map();
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
  }

  onTestEnd(test: TestCase, result: TestResult) {
    if (result.status !== 'passed') return;

    const duration = result.duration / 1000;
    const path = pathWithRootDir(test, this.config);
    const current = this.tally.get(path);
    if (current) {
      this.tally.set(path, current + duration);
    } else {
      this.tally.set(path, duration);
    }
  }

  onEnd(result: FullResult) {
    const recordedTestFiles = Array.from(this.tally).map(
      ([path, duration]) => ({
        path,
        time_execution: duration,
      }),
    );

    const res = {
      recordedTestFiles,
      isTestSuiteGreen: result.status === 'passed',
    };

    writeFileSync('.knapsack-pro/batch.json', JSON.stringify(res));
  }
}

export default BatchReporter;
