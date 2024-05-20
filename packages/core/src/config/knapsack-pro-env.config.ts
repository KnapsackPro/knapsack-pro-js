import childProcess = require('child_process');
import { CIProviderMethod, CIEnvConfig, isCI, detectCI } from '.';
import { KnapsackProLogger } from '../knapsack-pro-logger';
import * as Urls from '../urls';

const { spawnSync, execSync } = childProcess;

function logLevel(): string {
  if (process.env.KNAPSACK_PRO_LOG_LEVEL) {
    return process.env.KNAPSACK_PRO_LOG_LEVEL;
  }

  return 'info';
}

const knapsackProLogger = new KnapsackProLogger(logLevel());

const mask = (string: string): string => {
  const regexp = /(?<=\w{2})[a-zA-Z]/g;
  const maskingChar = '*';
  return string.replace(regexp, maskingChar);
};

export class KnapsackProEnvConfig {
  private static $fixedQueueSplit: boolean | undefined;

  private static $knapsackProLogger: KnapsackProLogger = knapsackProLogger;

  public static get endpoint(): string {
    if (process.env.KNAPSACK_PRO_ENDPOINT) {
      return process.env.KNAPSACK_PRO_ENDPOINT;
    }

    return 'https://api.knapsackpro.com';
  }

  public static get testSuiteToken(): string | never {
    if (process.env.KNAPSACK_PRO_TEST_SUITE_TOKEN) {
      return process.env.KNAPSACK_PRO_TEST_SUITE_TOKEN;
    }

    throw new Error(
      `Please set test suite API token in CI environment variables.
      Please check README for the Knapsack Pro client library.`,
    );
  }

  public static get fixedQueueSplit(): boolean {
    if (this.$fixedQueueSplit !== undefined) {
      return this.$fixedQueueSplit;
    }

    const envValue = this.envFor(
      'KNAPSACK_PRO_FIXED_QUEUE_SPLIT',
      'fixedQueueSplit',
    );

    this.$fixedQueueSplit =
      typeof envValue === 'string' ? this.parseBoolean(envValue) : envValue;

    if (!('KNAPSACK_PRO_FIXED_QUEUE_SPLIT' in process.env)) {
      this.$knapsackProLogger.info(
        `KNAPSACK_PRO_FIXED_QUEUE_SPLIT is not set. Using default value: ${this.$fixedQueueSplit}. Learn more at ${Urls.FIXED_QUEUE_SPLIT}`,
      );
    }

    return this.$fixedQueueSplit;
  }

  private static parseBoolean(value: string | undefined): boolean | null {
    switch (value?.toLowerCase()) {
      case 'true':
        return true;
      case 'false':
        return false;
      default:
        return null;
    }
  }

  private static logOverwrittenEnv(
    envName: string,
    envValue: string,
    ciEnvValue: string,
  ): void {
    this.$knapsackProLogger.info(
      `You have set the environment variable ${envName} to ${envValue} which could be automatically determined from the CI environment as ${ciEnvValue}.`,
    );
  }

  private static envFor<T extends CIProviderMethod>(
    knapsackEnvName: string,
    ciEnvFunction: T,
  ): string | (typeof CIEnvConfig)[T] {
    const knapsackEnvValue = process.env[knapsackEnvName];
    const ciEnvValue = CIEnvConfig[ciEnvFunction];

    if (
      knapsackEnvValue !== undefined &&
      ciEnvValue !== undefined &&
      knapsackEnvValue !== ciEnvValue.toString()
    ) {
      this.logOverwrittenEnv(
        knapsackEnvName,
        knapsackEnvValue,
        ciEnvValue.toString(),
      );
    }

    return knapsackEnvValue !== undefined ? knapsackEnvValue : ciEnvValue;
  }

  public static get ciNodeTotal(): number | never {
    const envValue = this.envFor('KNAPSACK_PRO_CI_NODE_TOTAL', 'ciNodeTotal');
    if (envValue) {
      return parseInt(envValue, 10);
    }

    throw new Error(
      'Undefined number of total CI nodes! Please set KNAPSACK_PRO_CI_NODE_TOTAL environment variable.',
    );
  }

  public static get ciNodeIndex(): number | never {
    const envValue = this.envFor('KNAPSACK_PRO_CI_NODE_INDEX', 'ciNodeIndex');
    if (envValue) {
      return parseInt(envValue, 10);
    }

    throw new Error(
      'Undefined CI node index! Please set KNAPSACK_PRO_CI_NODE_INDEX environment variable.',
    );
  }

  public static get ciNodeBuildId(): string | never {
    const envValue = this.envFor(
      'KNAPSACK_PRO_CI_NODE_BUILD_ID',
      'ciNodeBuildId',
    );
    if (envValue) {
      return envValue;
    }

    throw new Error(
      `Missing environment variable KNAPSACK_PRO_CI_NODE_BUILD_ID. Read more at ${Urls.KNAPSACK_PRO_CI_NODE_BUILD_ID}`,
    );
  }

  public static get ciNodeRetryCount(): number {
    const envValue = this.envFor(
      'KNAPSACK_PRO_CI_NODE_RETRY_COUNT',
      'ciNodeRetryCount',
    );
    if (envValue) {
      return parseInt(envValue, 10);
    }

    return 0;
  }

  public static get commitHash(): string | never {
    const envValue = this.envFor('KNAPSACK_PRO_COMMIT_HASH', 'commitHash');
    if (envValue) {
      return envValue;
    }

    const gitProcess = spawnSync('git', ['rev-parse', 'HEAD']);
    if (gitProcess.status === 0) {
      const gitCommitHash = gitProcess.stdout.toString().trim();

      // set env variable so next function call won't spawn git process again
      process.env.KNAPSACK_PRO_COMMIT_HASH = gitCommitHash;

      return gitCommitHash;
    }
    if (gitProcess.stderr === null) {
      // gitProcess may fail with stderr null,
      // for instance when git command does not exist on the machine
      knapsackProLogger.error(
        'We tried to detect commit hash using git but it failed. Please ensure you have have git installed or set KNAPSACK_PRO_COMMIT_HASH environment variable.',
      );
    } else {
      const gitErrorMessage = gitProcess.stderr.toString();
      knapsackProLogger.error(
        'There was error in detecting commit hash using git installed on the machine:',
      );
      knapsackProLogger.error(gitErrorMessage);
    }

    throw new Error(
      'Undefined commit hash! Please set KNAPSACK_PRO_COMMIT_HASH environment variable.',
    );
  }

  public static get branch(): string | never {
    const envValue = this.envFor('KNAPSACK_PRO_BRANCH', 'branch');
    if (envValue) {
      return envValue;
    }

    const gitProcess = spawnSync('git', ['rev-parse', '--abbrev-ref', 'HEAD']);
    if (gitProcess.status === 0) {
      const gitBranch = gitProcess.stdout.toString().trim();

      // set env variable so next function call won't spawn git process again
      process.env.KNAPSACK_PRO_BRANCH = gitBranch;

      return gitBranch;
    }
    if (gitProcess.stderr === null) {
      // gitProcess may fail with stderr null,
      // for instance when git command does not exist on the machine
      knapsackProLogger.error(
        'We tried to detect branch name using git but it failed. Please ensure you have have git installed or set KNAPSACK_PRO_BRANCH environment variable.',
      );
    } else {
      const gitErrorMessage = gitProcess.stderr.toString();
      knapsackProLogger.error(
        'There was error in detecting branch name using git installed on the machine:',
      );
      knapsackProLogger.error(gitErrorMessage);
    }

    throw new Error(
      'Undefined branch name! Please set KNAPSACK_PRO_BRANCH environment variable.',
    );
  }

  public static get logLevel(): string {
    return logLevel();
  }

  public static get testFileListSourceFile(): string | void {
    return process.env.KNAPSACK_PRO_TEST_FILE_LIST_SOURCE_FILE;
  }

  public static get maskedUserSeat(): string | void {
    const envValue = this.envFor('KNAPSACK_PRO_USER_SEAT', 'userSeat');
    if (envValue) {
      return mask(envValue);
    }

    return undefined;
  }
}

const $buildAuthor = (command: () => Buffer): string => {
  try {
    const author = command().toString().trim();
    return mask(author);
  } catch (error) {
    return 'no git <no.git@example.com>';
  }
};

const gitBuildAuthor = () =>
  execSync('git log --format="%aN <%aE>" -1 2>/dev/null');

export const buildAuthor = (command = gitBuildAuthor): string =>
  $buildAuthor(command);

const gitIsShallowRepository = () =>
  execSync(`git rev-parse --is-shallow-repository 2>/dev/null`);

const $isShallowRepository = (command: () => Buffer): boolean =>
  command().toString().trim() === 'true';

export const isShallowRepository = (
  command = gitIsShallowRepository,
): boolean => $isShallowRepository(command);

const $commitAuthors = (
  command: () => Buffer,
): { commits: number; author: string }[] => {
  try {
    return command()
      .toString()
      .split('\n')
      .filter((line) => line !== '')
      .map((line) => line.trim())
      .map((line) => line.split('\t'))
      .map(([commits, author]) => ({
        commits: parseInt(commits, 10),
        author: mask(author),
      }));
  } catch (error) {
    return [];
  }
};

const gitCommitAuthors = () => {
  if (isCI() && isShallowRepository()) {
    const gitFetchShallowSinceCommand =
      'git fetch --shallow-since "one month ago" --quiet 2>/dev/null';

    try {
      execSync(gitFetchShallowSinceCommand, {
        timeout: 5000,
      });
    } catch (error) {
      knapsackProLogger.debug(
        `Skip the \`${gitFetchShallowSinceCommand}\` command because it took too long. Error: ${error.message}`,
      );
    }
  }

  return execSync(
    `git log --since "one month ago" 2>/dev/null | git shortlog --summary --email 2>/dev/null`,
  );
};

export const commitAuthors = (
  command = gitCommitAuthors,
): { commits: number; author: string }[] => $commitAuthors(command);

export const ciProvider = (): string | null => detectCI().ciProvider;
