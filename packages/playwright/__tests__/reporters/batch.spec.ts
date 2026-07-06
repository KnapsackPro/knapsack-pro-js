import { spawnSync } from 'child_process';
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  symlinkSync,
  writeFileSync,
} from 'fs';
import { tmpdir } from 'os';
import { basename, dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import { describe, expect, it } from 'vitest';

const testFileDir = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(testFileDir, '../..');
const repoRoot = resolve(packageRoot, '../..');

const runInlinePlaywrightTest = (files: Record<string, string>) => {
  const testDir = mkdtempSync(join(tmpdir(), 'knapsack-pro-playwright-'));
  symlinkSync(
    join(repoRoot, 'node_modules'),
    join(testDir, 'node_modules'),
    'dir',
  );

  writeFileSync(
    join(testDir, 'playwright.config.ts'),
    `import { defineConfig } from '@playwright/test';

export default defineConfig({
  reporter: [[${JSON.stringify(join(packageRoot, 'src/reporters/batch.ts'))}]],
  projects: [
    { name: 'pass' },
    { name: 'fail' },
  ],
  workers: 1,
  retries: 1
});
`,
  );

  Object.entries(files).forEach(([fileName, content]) => {
    writeFileSync(join(testDir, fileName), content);
  });

  spawnSync(join(repoRoot, 'node_modules/.bin/playwright'), ['test'], {
    cwd: testDir,
    encoding: 'utf8',
    stdio: ['ignore', 'ignore', 'inherit'], // console.error from inside the reporter is printed
  });

  return {
    batch: JSON.parse(
      readFileSync(join(testDir, '.knapsack-pro/batch.json'), 'utf8'),
    ),
    testDir,
  };
};

describe('BatchReporter', () => {
  it('records the Knapsack Pro batch', { timeout: 10000 }, () => {
    const result = runInlinePlaywrightTest({
      'pass.spec.ts': `import { test, expect } from '@playwright/test';
test('passes', async () => {
  await new Promise(resolve => setTimeout(resolve, 10));
  expect(1).toBe(1);
});
`,
      'fail.spec.ts': `import { test, expect } from '@playwright/test';
test('fails', async () => {
  await new Promise(resolve => setTimeout(resolve, 10));
  expect(1).toBe(2);
});
`,
      'half.spec.ts': `import { test, expect } from '@playwright/test';
test('passes in one project and fails in another', async ({}, testInfo) => {
  await new Promise(resolve => setTimeout(resolve, 10));
  expect(testInfo.project.name).toBe('pass');
});
`,
      'retry.spec.ts': `import { test, expect } from '@playwright/test';
test('passes on the retry', async ({}, testInfo) => {
  await new Promise(resolve => setTimeout(resolve, 10));
  expect(testInfo.retry).toBe(1);
});
`,
    });
    expect(existsSync(join(result.testDir, '.knapsack-pro/batch.json'))).toBe(
      true,
    );
    expect(result.batch).toMatchObject({
      recordedPaths: {
        [`${basename(result.testDir)}/fail.spec.ts:2`]: expect.toSatisfy(
          (value) => parseFloat(value) > 0.04,
        ),
        [`${basename(result.testDir)}/half.spec.ts:2`]: expect.toSatisfy(
          (value) => parseFloat(value) > 0.03,
        ),
        [`${basename(result.testDir)}/pass.spec.ts:2`]: expect.toSatisfy(
          (value) => parseFloat(value) > 0.02,
        ),
        [`${basename(result.testDir)}/retry.spec.ts:2`]: expect.toSatisfy(
          (value) => parseFloat(value) > 0.04,
        ),
      },
      failedPaths: [
        `${basename(result.testDir)}/fail.spec.ts:2`,
        `${basename(result.testDir)}/half.spec.ts:2`,
      ],
      isTestSuiteGreen: false,
    });
  });

  it('records the Knapsack Pro batch', { timeout: 10000 }, () => {
    const result = runInlinePlaywrightTest({
      'fail.spec.ts': `import { test, expect } from '@playwright/test';
test('fails', async () => { expect(1).toBe(2); });
test('passes', async () => { expect(1).toBe(1); });
`,
    });
    expect(existsSync(join(result.testDir, '.knapsack-pro/batch.json'))).toBe(
      true,
    );
    expect(result.batch).toMatchObject({
      recordedPaths: {
        [`${basename(result.testDir)}/fail.spec.ts:2`]: expect.any(Number),
        [`${basename(result.testDir)}/fail.spec.ts:3`]: expect.any(Number),
      },
      failedPaths: [`${basename(result.testDir)}/fail.spec.ts:2`],
      isTestSuiteGreen: false,
    });
  });
});
