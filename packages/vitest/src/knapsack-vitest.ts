#!/usr/bin/env node

import {
  KnapsackProCore,
  KnapsackProLogger,
  onQueueFailureType,
  onQueueSuccessType,
  TestFile,
} from '@knapsack-pro/core';

import {
  startVitest,
  parseCLI,
  UserConfig,
  createVitest,
  ResolvedConfig,
  Vitest,
} from 'vitest/node';

import { v4 as uuidv4 } from 'uuid';
import { minimatch } from 'minimatch';
import { glob } from 'glob';
import * as path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

if (process.env.KNAPSACK_PRO_TEST_SUITE_TOKEN_VITEST) {
  process.env.KNAPSACK_PRO_TEST_SUITE_TOKEN =
    process.env.KNAPSACK_PRO_TEST_SUITE_TOKEN_VITEST;
}

const knapsackProLogger = new KnapsackProLogger();
const projectPath = process.cwd();

async function main() {
  const filePath = fileURLToPath(import.meta.url);
  const dirName = dirname(filePath);
  const pkg = JSON.parse(
    fs.readFileSync(path.join(dirName, '..', 'package.json'), 'utf8'),
  );
  knapsackProLogger.debug(`Running ${pkg.name}@${pkg.version}`);

  const resolvedConfig = await getResolvedConfig();
  const knapsackPro = new KnapsackProCore(
    pkg.name,
    pkg.version,
    makeGetAllTestFiles(resolvedConfig),
  );

  const onSuccess: onQueueSuccessType = async (testFiles: TestFile[]) => {
    const vitest = await startVitest('test', undefined, {
      include: testFiles.map((testFile) => testFile.path),
      watch: false,
      ...generateCoverageConfig(resolvedConfig),
    });

    if (!vitest) {
      throw new Error('[@knapsack-pro/vitest] Vitest failed to start');
    }

    await vitest.close();

    return getTestResults(vitest);
  };

  const onError: onQueueFailureType = () => {};

  knapsackPro.runQueueMode(onSuccess, onError);
}

main();

/**
 * Processes the test results and converts them to a format vitest
 * understands
 * @param vitest
 */
function getTestResults(vitest: Vitest) {
  const recordedTestFiles = vitest.state.getFiles().map<TestFile>((file) => {
    const testFile = vitest.state.getReportedEntity(file);
    if (testFile?.type !== 'module') {
      throw new Error('[@knapsack-pro/vitest] Vitest reported non-module file');
    }

    const path =
      process.platform === 'win32'
        ? file.filepath.replace(`${projectPath}\\`, '').replace(/\\/g, '/')
        : file.filepath.replace(`${projectPath}/`, '');

    const diagnostic = testFile.diagnostic();
    return {
      path,
      time_execution: diagnostic.duration / 1000,
    };
  });

  const isTestSuiteGreen = process.exitCode !== 1;

  return {
    recordedTestFiles,
    isTestSuiteGreen,
  };
}

/**
 * Gets the resolved vitest configuration after combining the CLI options and
 * the vite.config.ts file(s)
 */
async function getResolvedConfig() {
  const cliArguments = parseCLI(`vitest ${process.argv.slice(2)}`);
  knapsackProLogger.debug(
    `Vitest CLI options:\n${KnapsackProLogger.objectInspect(cliArguments)}`,
  );

  if (cliArguments.filter.length > 0) {
    throw new Error(
      '[@knapsack-pro/vitest] Passing list of files to test from command line is not supported',
    );
  }

  const resolvedConfig = (
    await createVitest('test', { ...cliArguments.options, watch: false })
  ).config;

  return resolvedConfig;
}

/**
 * Returns a function that returns all test files in the test suite
 */
function makeGetAllTestFiles(resolvedConfig: ResolvedConfig) {
  return () => {
    const testFileIncludePattern =
      process.env.KNAPSACK_PRO_TEST_FILE_PATTERN ||
      resolvedConfig.include ||
      '**\/*.{test,spec}.?(c|m)[jt]s?(x)';

    const testFileExcludePattern = process.env
      .KNAPSACK_PRO_TEST_FILE_EXCLUDE_PATTERN
      ? [process.env.KNAPSACK_PRO_TEST_FILE_EXCLUDE_PATTERN]
      : resolvedConfig.exclude || [];

    const testFiles = glob
      .sync(testFileIncludePattern)
      .filter((testFilePath) =>
        testFileExcludePattern.every(
          (excludePattern) =>
            !minimatch(testFilePath, excludePattern, {
              matchBase: true,
            }),
        ),
      )
      .filter((testFilePath) => !testFilePath.match(/node_modules/))
      .map((testFilePath) => ({ path: testFilePath }));

    if (testFiles.length === 0) {
      const errorMessage = `[@knapsack-pro/vitest] Test files cannot be found.\nPlease set KNAPSACK_PRO_TEST_FILE_PATTERN matching your test directory structure.\nLearn more: https://knapsackpro.com/perma/jest/no-tests-found`;

      knapsackProLogger.error(errorMessage);
      throw new Error(errorMessage);
    }

    return testFiles;
  };
}

/**
 * Generates the coverage configuration to pass to vitest
 *
 * @note The reportsDirectory is set to a unique directory to avoid conflicts
 * between multiple test runs
 */
function generateCoverageConfig(resolvedConfig: ResolvedConfig): UserConfig {
  const coverageDirectory =
    process.env.KNAPSACK_PRO_COVERAGE_DIRECTORY ||
    resolvedConfig.coverage.reportsDirectory;
  if (resolvedConfig.coverage.enabled) {
    return {
      coverage: {
        reportsDirectory: path.join(coverageDirectory, uuidv4()),
      },
    };
  }

  return {};
}
