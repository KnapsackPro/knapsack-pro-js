#!/usr/bin/env node

import pkg from '@knapsack-pro/vitest/package.json' with { type: 'json' };
import {
  KnapsackProCore,
  KnapsackProLogger,
  onQueueFailureType,
  onQueueSuccessType,
} from '@knapsack-pro/core';

import {
  startVitest,
  parseCLI,
  ResolvedConfig,
  resolveConfig,
} from 'vitest/node';
import { v4 as uuidv4 } from 'uuid';
import { minimatch } from 'minimatch';
import { glob } from 'glob';
import { relative } from 'path';

import * as Urls from './urls.js';
import { normalizePaths } from './utils.js';

if (process.env.KNAPSACK_PRO_TEST_SUITE_TOKEN_VITEST) {
  process.env.KNAPSACK_PRO_TEST_SUITE_TOKEN =
    process.env.KNAPSACK_PRO_TEST_SUITE_TOKEN_VITEST;
}

const knapsackProLogger = new KnapsackProLogger();

async function main() {
  knapsackProLogger.debug(`Running ${pkg.name}@${pkg.version}`);

  const cliArguments = parseCLI(`vitest ${process.argv.slice(2).join(' ')}`);
  if (cliArguments.filter.length > 0) {
    throw new Error(
      '[@knapsack-pro/vitest] Passing list of files to test from command line is not supported',
    );
  }

  const resolvedConfig = await resolveConfig();

  const knapsackPro = new KnapsackProCore(
    pkg.name,
    pkg.version,
    allPaths(resolvedConfig.vitestConfig),
  );

  // When running test:line the test cases in the same file that are not run are reported as skipped
  const onSuccess: onQueueSuccessType = async (paths: string[]) => {
    const cliOptions = {
      ...cliArguments.options,
      outputFile: withBatchedBlobOutputFile(
        cliArguments,
        resolvedConfig.vitestConfig,
      ),
      watch: false,
    };
    knapsackProLogger.debug(`Filters: ${JSON.stringify(paths)}`);
    knapsackProLogger.debug(`CLIOptions: ${JSON.stringify(cliOptions)}`);
    const vitest = await startVitest('test', paths, cliOptions);

    if (!vitest) {
      throw new Error('[@knapsack-pro/vitest] Vitest failed to start');
    }

    await vitest.close();

    const recordedPaths: Record<string, number> = {};
    const failedPaths: Set<string> = new Set();
    const testModules = vitest.state.getTestModules();
    for (const testModule of testModules) {
      for (const testCase of testModule.children.allTests()) {
        const filePath = relative(
          testCase.project.vitest.config.root,
          testCase.module.moduleId,
        );
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

    return {
      recordedPaths: normalizePaths(paths, recordedPaths),
      isTestSuiteGreen: testModules.every((testModule) => testModule.ok()),
      failedPaths,
    };
  };

  const onError: onQueueFailureType = () => {};

  knapsackPro.runQueueMode(onSuccess, onError);
}

main();

const allPaths = (resolvedConfig: ResolvedConfig) => {
  return () => {
    const testFileIncludePattern =
      process.env.KNAPSACK_PRO_TEST_FILE_PATTERN ||
      resolvedConfig.include ||
      '**/*.{test,spec}.?(c|m)[jt]s?(x)';

    const testFileExcludePattern = process.env
      .KNAPSACK_PRO_TEST_FILE_EXCLUDE_PATTERN
      ? [process.env.KNAPSACK_PRO_TEST_FILE_EXCLUDE_PATTERN]
      : resolvedConfig.exclude || [];

    const paths = glob
      .sync(testFileIncludePattern)
      .filter((path) =>
        testFileExcludePattern.every(
          (excludePattern) =>
            !minimatch(path, excludePattern, {
              matchBase: true,
            }),
        ),
      )
      .filter((path) => !path.match(/node_modules/));

    if (paths.length === 0) {
      const errorMessage = `[@knapsack-pro/vitest] Test files cannot be found.\nPlease set KNAPSACK_PRO_TEST_FILE_PATTERN matching your test directory structure.\nLearn more: ${Urls.NO_TESTS_FOUND}`;

      knapsackProLogger.error(errorMessage);
      throw new Error(errorMessage);
    }

    return paths;
  };
};

// Vitest uses the following priority when parsing the outputFile:
// - From CLI if string (e.g., vitest --outputFile=file.txt)
// - From config if string (e.g., outputFile: 'file.txt')
// - Merge objects; Example:
//     Input: vitest --outputFile.junit=junit.txt && outputFile: { json: 'json.txt', junit: 'ignored.txt' }
//     Output: { json: 'json.txt', junit: 'junit.txt' }
function withBatchedBlobOutputFile(
  cliArguments: ReturnType<typeof parseCLI>,
  resolvedConfig: ResolvedConfig,
): ReturnType<typeof parseCLI>['options']['outputFile'] {
  const cliOutputFile = cliArguments.options.outputFile;
  if (typeof cliOutputFile === 'string') return cliOutputFile;
  const configOutputFile = resolvedConfig.outputFile;
  if (typeof configOutputFile === 'string') return configOutputFile;
  const filename = [
    process.env.KNAPSACK_PRO_CI_NODE_INDEX,
    process.env.KNAPSACK_PRO_CI_NODE_TOTAL,
    uuidv4(),
  ].join('-');
  const blob = `.vitest-reports/blob-${filename}.json`;
  return { blob, ...configOutputFile, ...cliOutputFile };
}
