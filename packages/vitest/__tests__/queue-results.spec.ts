import { spawnSync } from 'node:child_process';
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';

const testFileDir = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(testFileDir, '..');
const repoRoot = resolve(packageRoot, '../..');
const testDirs: string[] = [];

afterEach(() => {
  testDirs.splice(0).forEach((testDir) => {
    rmSync(testDir, { force: true, recursive: true });
  });
});

const runInlineVitestBatches = (
  files: Record<string, string>,
  batches: string[][],
) => {
  const testDir = mkdtempSync(join(tmpdir(), 'knapsack-pro-vitest-'));
  testDirs.push(testDir);
  symlinkSync(
    join(repoRoot, 'node_modules'),
    join(testDir, 'node_modules'),
    'dir',
  );
  writeFileSync(
    join(testDir, 'package.json'),
    JSON.stringify({ type: 'module' }),
  );
  writeFileSync(join(testDir, 'manifest.txt'), batches.flat().join('\n'));
  writeFileSync(
    join(testDir, 'vitest.config.mjs'),
    `export default {
  test: {
    include: ['**/*.test.js'],
    includeTaskLocation: true,
    reporters: ['dot'],
    teardownTimeout: 1000,
  },
};
`,
  );
  Object.entries(files).forEach(([fileName, content]) => {
    const filePath = join(testDir, fileName);
    mkdirSync(dirname(filePath), { recursive: true });
    writeFileSync(filePath, content);
  });
  writeFileSync(
    join(testDir, 'run.mjs'),
    `import { writeFileSync } from 'node:fs';
import { KnapsackProAPI } from ${JSON.stringify(pathToFileURL(join(repoRoot, 'packages/core/lib/knapsack-pro-api.js')).href)};
const batches = ${JSON.stringify(batches)};
const requests = [];
KnapsackProAPI.prototype.fetchTestsFromQueue = function (
  allPaths, initializeQueue, attemptConnectToQueue, failedPaths, nodeUuid, batchId, batchIndex,
) {
  requests.push({ failedPaths: [...failedPaths] });
  return Promise.resolve({ data: { paths: batches[batchIndex] ?? [], batch_id: batchIndex + 1 } });
};
KnapsackProAPI.prototype.createBuildSubset = function (testFiles) {
  writeFileSync('queue-results.json', JSON.stringify({
    requests,
    recordedPaths: testFiles.map(file => file.path),
  }));
  return Promise.resolve({});
};
await import(${JSON.stringify(pathToFileURL(join(packageRoot, 'lib/knapsack-vitest.js')).href)});
`,
  );
  const result = spawnSync(process.execPath, [join(testDir, 'run.mjs')], {
    cwd: testDir,
    encoding: 'utf8',
    env: {
      ...process.env,
      FORCE_COLOR: '0',
      KNAPSACK_PRO_TEST_FILE_LIST_SOURCE_FILE: join(testDir, 'manifest.txt'),
      KNAPSACK_PRO_TEST_SUITE_TOKEN: 'test-token',
      NODE_OPTIONS: '',
    },
    timeout: 30000,
  });
  expect(result.error).toBeUndefined();
  const queue: unknown = JSON.parse(
    readFileSync(join(testDir, 'queue-results.json'), 'utf8'),
  );
  return { ...result, queue };
};

describe('Knapsack Vitest queue results', () => {
  it('reports startup errors for retry instead of treating empty results as green', () => {
    const result = runInlineVitestBatches(
      {
        'passing.test.js': `import { test } from 'vitest';
test('passes', () => {});
`,
        'global-setup.js': `export default function () {
  throw new Error('intentional startup failure');
}
`,
        'vitest.config.mjs': `export default {
  test: { globalSetup: ['./global-setup.js'] },
};
`,
      },
      [['passing.test.js']],
    );
    expect(result.stderr).toContain('intentional startup failure');
    expect(result.queue).toEqual({
      requests: [{ failedPaths: [] }, { failedPaths: ['passing.test.js'] }],
      recordedPaths: ['passing.test.js'],
    });
    expect(result.status).toBe(1);
  }, 40000);

  it('reports incomplete paths for retry and stays failed after a passing batch', () => {
    const result = runInlineVitestBatches(
      {
        'passing.test.js': `import { test } from 'vitest';
test('passes', () => {});
`,
        'later.test.js': `import { test } from 'vitest';
test('passes later', () => {});
`,
      },
      [['passing.test.js', 'missing.test.js'], ['later.test.js']],
    );
    expect(result.stdout + result.stderr).toContain('missing.test.js');
    expect(result.queue).toEqual({
      requests: [
        { failedPaths: [] },
        { failedPaths: ['missing.test.js'] },
        { failedPaths: [] },
      ],
      recordedPaths: expect.arrayContaining([
        'passing.test.js',
        'missing.test.js',
        'later.test.js',
      ]),
    });
    expect(result.status).toBe(1);
  }, 40000);

  it('accepts passing and explicitly skipped files, including route-group paths', () => {
    const result = runInlineVitestBatches(
      {
        '(routes)/passing.test.js': `import { test } from 'vitest';
test('passes', () => {});
`,
        'skipped.test.js': `import { test } from 'vitest';
test.skip('skips', () => {});
`,
      },
      [['(routes)/passing.test.js', 'skipped.test.js']],
    );
    expect(result.queue).toMatchObject({
      requests: [{ failedPaths: [] }, { failedPaths: [] }],
    });
    expect(result.status, result.stdout + result.stderr).toBe(0);
  }, 40000);

  it('reports the whole batch for retry on unhandled errors and stays failed after a passing batch', () => {
    const result = runInlineVitestBatches(
      {
        'unhandled.test.js': `import { test } from 'vitest';
test('reports an unhandled error', async () => {
  process.emit('unhandledRejection', new Error('intentional unhandled rejection'), Promise.resolve());
  await new Promise(resolve => setTimeout(resolve, 20));
});
`,
        'passing.test.js': `import { test } from 'vitest';
test('passes', () => {});
`,
        'later.test.js': `import { test } from 'vitest';
test('passes later', () => {});
`,
      },
      [['unhandled.test.js', 'passing.test.js'], ['later.test.js']],
    );
    expect(result.stderr).toContain('intentional unhandled rejection');
    expect(result.queue).toEqual({
      requests: [
        { failedPaths: [] },
        {
          failedPaths: expect.arrayContaining([
            'unhandled.test.js',
            'passing.test.js',
          ]),
        },
        { failedPaths: [] },
      ],
      recordedPaths: expect.arrayContaining([
        'unhandled.test.js',
        'passing.test.js',
        'later.test.js',
      ]),
    });
    expect(result.status).toBe(1);
  }, 40000);

  it('preserves ordinary failures for retry and stays failed after a passing batch', () => {
    const result = runInlineVitestBatches(
      {
        'failing.test.js': `import { test, expect } from 'vitest';
test('fails', () => expect(1).toBe(2));
`,
        'later.test.js': `import { test } from 'vitest';
test('passes later', () => {});
`,
      },
      [['failing.test.js'], ['later.test.js']],
    );
    expect(result.queue).toMatchObject({
      requests: [
        { failedPaths: [] },
        { failedPaths: ['failing.test.js:2'] },
        { failedPaths: [] },
      ],
    });
    expect(result.status).toBe(1);
  }, 40000);
});
