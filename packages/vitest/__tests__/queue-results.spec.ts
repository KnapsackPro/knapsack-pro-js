import { spawnSync } from 'node:child_process';
import {
  mkdirSync,
  mkdtempSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';

const repoRoot = fileURLToPath(new URL('../../../', import.meta.url));
const require = createRequire(import.meta.url);
const adapter = join(
  dirname(require.resolve('@knapsack-pro/vitest/package.json')),
  'lib/knapsack-vitest.js',
);
const api = join(
  dirname(createRequire(adapter).resolve('@knapsack-pro/core')),
  'knapsack-pro-api.js',
);
const roots: string[] = [];

afterEach(() => {
  for (const root of roots.splice(0)) {
    rmSync(root, { force: true, recursive: true });
  }
});

const runInlineVitestBatches = (
  batches: string[][],
  startupFailure = false,
) => {
  const root = mkdtempSync(join(tmpdir(), 'knapsack-vitest-'));
  roots.push(root);
  symlinkSync(
    join(repoRoot, 'node_modules'),
    join(root, 'node_modules'),
    'dir',
  );
  writeFileSync(join(root, 'package.json'), JSON.stringify({ type: 'module' }));
  writeFileSync(
    join(root, 'passing.test.js'),
    "import { test } from 'vitest'; test('passes', () => {});\n",
  );
  writeFileSync(
    join(root, 'later.test.js'),
    "import { test } from 'vitest'; test('passes later', () => {});\n",
  );
  writeFileSync(
    join(root, 'skipped.test.js'),
    "import { test } from 'vitest'; test.skip('skips', () => {});\n",
  );
  writeFileSync(
    join(root, 'failing.test.js'),
    "import { test, expect } from 'vitest'; test('fails', () => expect(1).toBe(2));\n",
  );
  writeFileSync(
    join(root, 'unhandled.test.js'),
    `
import { test } from 'vitest';
test('reports an unhandled error', async () => {
  process.emit('unhandledRejection', new Error('intentional unhandled rejection'), Promise.resolve());
  await new Promise(resolve => setTimeout(resolve, 20));
});
`,
  );
  writeFileSync(
    join(root, 'global-setup.js'),
    "export default function () { throw new Error('intentional startup failure'); }\n",
  );
  mkdirSync(join(root, '(routes)'));
  writeFileSync(
    join(root, '(routes)', 'passing.test.js'),
    "import { test } from 'vitest'; test('passes', () => {});\n",
  );
  writeFileSync(join(root, 'manifest.txt'), batches.flat().join('\n'));
  writeFileSync(
    join(root, 'vitest.config.mjs'),
    `
import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    include: ['**/*.test.js'],
    includeTaskLocation: true,
    reporters: ['dot'],
    teardownTimeout: 1000,
    ${startupFailure ? "globalSetup: ['./global-setup.js']," : ''}
  },
});
`,
  );
  writeFileSync(
    join(root, 'run.mjs'),
    `
import { KnapsackProAPI } from ${JSON.stringify(pathToFileURL(api).href)};
const batches = ${JSON.stringify(batches)};
KnapsackProAPI.prototype.fetchTestsFromQueue = function (
  allPaths, initializeQueue, attemptConnectToQueue, failedPaths, nodeUuid, batchId, batchIndex,
) {
  console.log('QUEUE_REQUEST ' + JSON.stringify({ batchId, batchIndex, failedPaths: [...failedPaths].sort() }));
  return Promise.resolve({ data: { paths: batches[batchIndex] ?? [], batch_id: batchIndex + 1 } });
};
KnapsackProAPI.prototype.createBuildSubset = function (testFiles) {
  console.log('BUILD_SUBSET ' + JSON.stringify(testFiles.map(file => file.path).sort()));
  return Promise.resolve({});
};
await import(${JSON.stringify(pathToFileURL(adapter).href)});
`,
  );
  return spawnSync(process.execPath, [join(root, 'run.mjs')], {
    cwd: root,
    encoding: 'utf8',
    env: {
      ...process.env,
      FORCE_COLOR: '0',
      KNAPSACK_PRO_TEST_FILE_LIST_SOURCE_FILE: join(root, 'manifest.txt'),
      KNAPSACK_PRO_TEST_SUITE_TOKEN: 'test-token',
      NODE_OPTIONS: '',
    },
    timeout: 30000,
  });
};

const queueRequest = (
  failedPaths: string[],
  batchId: number,
  batchIndex: number,
) => {
  return `QUEUE_REQUEST ${JSON.stringify({ batchId, batchIndex, failedPaths: failedPaths.toSorted() })}`;
};

const buildSubset = (paths: string[]) => {
  return `BUILD_SUBSET ${JSON.stringify(paths.toSorted())}`;
};

describe('Knapsack Vitest queue results', () => {
  it('reports startup errors for retry instead of treating empty results as green', () => {
    const result = runInlineVitestBatches([['passing.test.js']], true);
    expect(result.error).toBeUndefined();
    expect(result.stderr).toContain('intentional startup failure');
    expect(result.stdout).toContain(queueRequest(['passing.test.js'], 1, 1));
    expect(result.stdout).toContain(buildSubset(['passing.test.js']));
    expect(result.status).toBe(1);
  }, 40000);

  it('reports incomplete paths for retry and stays failed after a passing batch', () => {
    const result = runInlineVitestBatches([
      ['(routes)/passing.test.js', 'missing.test.js'],
      ['later.test.js'],
    ]);
    expect(result.error).toBeUndefined();
    expect(result.stdout + result.stderr).toContain('missing.test.js');
    expect(result.stdout).toContain(queueRequest(['missing.test.js'], 1, 1));
    expect(result.stdout).toContain(queueRequest([], 2, 2));
    expect(result.stdout).toContain(
      buildSubset([
        '(routes)/passing.test.js',
        'missing.test.js',
        'later.test.js',
      ]),
    );
    expect(result.status).toBe(1);
  }, 40000);

  it('accepts passing and explicitly skipped files, including route-group paths', () => {
    const result = runInlineVitestBatches([
      ['passing.test.js', 'skipped.test.js', '(routes)/passing.test.js'],
    ]);
    expect(result.error).toBeUndefined();
    expect(result.stdout).toContain(queueRequest([], 1, 1));
    expect(result.status, result.stdout + result.stderr).toBe(0);
  }, 40000);

  it('reports the whole batch for retry on unhandled errors and stays failed after a passing batch', () => {
    const result = runInlineVitestBatches([
      ['unhandled.test.js', 'skipped.test.js'],
      ['later.test.js'],
    ]);
    expect(result.error).toBeUndefined();
    expect(result.stderr).toContain('intentional unhandled rejection');
    expect(result.stdout).toContain(
      queueRequest(['unhandled.test.js', 'skipped.test.js'], 1, 1),
    );
    expect(result.stdout).toContain(queueRequest([], 2, 2));
    expect(result.stdout).toContain(
      buildSubset(['unhandled.test.js', 'skipped.test.js', 'later.test.js']),
    );
    expect(result.status).toBe(1);
  }, 40000);

  it('preserves ordinary failures for retry and stays failed after a passing batch', () => {
    const result = runInlineVitestBatches([
      ['failing.test.js'],
      ['later.test.js'],
    ]);
    expect(result.error).toBeUndefined();
    expect(result.stdout).toContain(queueRequest(['failing.test.js:1'], 1, 1));
    expect(result.stdout).toContain(queueRequest([], 2, 2));
    expect(result.status).toBe(1);
  }, 40000);
});
