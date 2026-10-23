#!/usr/bin/env node

import pkg from '@knapsack-pro/vitest/package.json' with { type: 'json' };
import { resolve } from 'node:path';
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
import 'vitest/config'; // Needed for the ResolvedConfig.test type
import { v4 as uuidv4 } from 'uuid';
import { minimatch } from 'minimatch';
import { glob } from 'glob';

import * as Urls from './urls.js';
import { closeWithTimeout, extractState, normalizePaths } from './utils.js';

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

  const viteConfig = await resolveConfig();
  const resolvedConfig =
    viteConfig.test ?? // vitest 5.0.0 or later
    (viteConfig as unknown as Record<'vitestConfig', ResolvedConfig>)
      .vitestConfig;

  const knapsackPro = new KnapsackProCore(
    pkg.name,
    pkg.version,
    allPaths(resolvedConfig),
  );

  // When running test:line the test cases in the same file that are not run are reported as skipped
  const onSuccess: onQueueSuccessType = async (paths: string[]) => {
    const cliOptions = {
      ...cliArguments.options,
      outputFile: withBatchedBlobOutputFile(cliArguments, resolvedConfig),
      watch: false,
    };
    knapsackProLogger.debug(`Filters: ${JSON.stringify(paths)}`);
    knapsackProLogger.debug(`CLIOptions: ${JSON.stringify(cliOptions)}`);
    const vitest = await startVitest('test', paths, cliOptions);

    if (!vitest) {
      throw new Error('[@knapsack-pro/vitest] Vitest failed to start');
    }

    const { timedOut } = await closeWithTimeout(
      vitest,
      resolvedConfig.teardownTimeout,
    );
    if (timedOut) {
      knapsackProLogger.error(
        `[@knapsack-pro/vitest] vitest.close() timed out after ${resolvedConfig.teardownTimeout}ms.`,
      );
      process.exit(1);
    }

    const testModules = vitest.state.getTestModules();
    const unhandledErrors = vitest.state.getUnhandledErrors();
    const incompletePaths = paths.filter((path) => {
      const moduleId = resolve(vitest.config.root, path.replace(/:\d+$/, ''));
      const modules = testModules.filter(
        (testModule) => testModule.moduleId === moduleId,
      );
      return (
        modules.length === 0 ||
        modules.some(
          (testModule) =>
            !['passed', 'failed', 'skipped'].includes(testModule.state()),
        )
      );
    });
    const { recordedPaths, failedPaths } = extractState(testModules);

    if (unhandledErrors.length > 0) {
      knapsackProLogger.error(
        `[@knapsack-pro/vitest] Vitest reported ${unhandledErrors.length} unhandled error(s).`,
      );
    }
    if (incompletePaths.length > 0) {
      knapsackProLogger.error(
        `[@knapsack-pro/vitest] Assigned test files did not finish:\n${incompletePaths.join('\n')}`,
      );
    }
    for (const path of unhandledErrors.length > 0 ? paths : incompletePaths) {
      failedPaths.add(path);
    }

    return {
      recordedPaths: normalizePaths(paths, recordedPaths),
      isTestSuiteGreen:
        unhandledErrors.length === 0 &&
        incompletePaths.length === 0 &&
        testModules.every((testModule) => testModule.ok()),
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
