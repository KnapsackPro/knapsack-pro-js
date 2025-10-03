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
    process.stdout.write(JSON.stringify(Array.from(paths)));
  }
}

export default ListReporter;
