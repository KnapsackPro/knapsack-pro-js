import { writeFileSync } from 'fs';
import type { FullConfig, Suite } from '@playwright/test/reporter';

import type { ReporterV2 } from './reporterV2.js';
import { pathWithRootDir } from './utils.js';

class ListReporter implements ReporterV2 {
  private config!: FullConfig;

  version(): 'v2' {
    return 'v2';
  }

  printsToStdio?() {
    // Prevent Playwright from adding a standard terminal reporter
    // https://github.com/microsoft/playwright/blob/485aaf7fff96e4c9505e26af27e6db283622da62/packages/playwright/src/runner/reporters.ts#L72-L79
    return true;
  }

  onConfigure(config: FullConfig) {
    this.config = config;
  }

  onBegin(suite: Suite): void {
    const paths = new Set();
    suite
      .allTests()
      .forEach((test) => paths.add(pathWithRootDir(test, this.config)));
    writeFileSync('.knapsack-pro/list.json', JSON.stringify(Array.from(paths)));
  }
}

export default ListReporter;
