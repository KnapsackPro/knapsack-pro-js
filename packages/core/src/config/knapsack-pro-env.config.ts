import childProcess = require('child_process');
import { CIEnvConfig, isCI } from '.';
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

    this.$fixedQueueSplit =
      this.parseBoolean(process.env.KNAPSACK_PRO_FIXED_QUEUE_SPLIT) ??
      CIEnvConfig.fixedQueueSplit;

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

  public static get ciNodeTotal(): number | never {
    if (process.env.KNAPSACK_PRO_CI_NODE_TOTAL) {
      return parseInt(process.env.KNAPSACK_PRO_CI_NODE_TOTAL, 10);
    }

    const { ciNodeTotal } = CIEnvConfig;
    if (ciNodeTotal) {
      return parseInt(ciNodeTotal, 10);
    }

    throw new Error(
      'Undefined number of total CI nodes! Please set KNAPSACK_PRO_CI_NODE_TOTAL environment variable.',
    );
  }

  public static get ciNodeIndex(): number | never {
    if (process.env.KNAPSACK_PRO_CI_NODE_INDEX) {
      return parseInt(process.env.KNAPSACK_PRO_CI_NODE_INDEX, 10);
    }

    const { ciNodeIndex } = CIEnvConfig;
    if (ciNodeIndex) {
      return parseInt(ciNodeIndex, 10);
    }

    throw new Error(
      'Undefined CI node index! Please set KNAPSACK_PRO_CI_NODE_INDEX environment variable.',
    );
  }

  public static get ciNodeBuildId(): string | never {
    if (process.env.KNAPSACK_PRO_CI_NODE_BUILD_ID) {
      return process.env.KNAPSACK_PRO_CI_NODE_BUILD_ID;
    }

    const { ciNodeBuildId } = CIEnvConfig;
    if (ciNodeBuildId) {
      return ciNodeBuildId;
    }

    throw new Error(
      `Missing environment variable KNAPSACK_PRO_CI_NODE_BUILD_ID. Read more at ${Urls.KNAPSACK_PRO_CI_NODE_BUILD_ID}`,
    );
  }

  public static get ciNodeRetryCount(): number {
    if (process.env.KNAPSACK_PRO_CI_NODE_RETRY_COUNT) {
      return parseInt(process.env.KNAPSACK_PRO_CI_NODE_RETRY_COUNT, 10);
    }

    const { ciNodeRetryCount } = CIEnvConfig;
    if (ciNodeRetryCount) {
      return parseInt(ciNodeRetryCount, 10);
    }

    return 0;
  }

  public static get commitHash(): string | never {
    if (process.env.KNAPSACK_PRO_COMMIT_HASH) {
      return process.env.KNAPSACK_PRO_COMMIT_HASH;
    }

    const { commitHash } = CIEnvConfig;
    if (commitHash) {
      return commitHash;
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
    if (process.env.KNAPSACK_PRO_BRANCH) {
      return process.env.KNAPSACK_PRO_BRANCH;
    }

    const { branch } = CIEnvConfig;
    if (branch) {
      return branch;
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
    if (process.env.KNAPSACK_PRO_USER_SEAT) {
      return mask(process.env.KNAPSACK_PRO_USER_SEAT);
    }

    const { userSeat } = CIEnvConfig;
    if (userSeat) {
      return mask(userSeat);
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
  // if (isCI && isShallowRepository()) {
  if (isCI) {
    knapsackProLogger.error('2XXXXXXXXXXXX');
    // execSync(`git fetch --shallow-since "one month ago" --quiet 2>/dev/null`);
    // const command =
    //   'git fetch --shallow-since "one month ago" --quiet 2>/dev/null';
    const command = 'sleep 6';
    knapsackProLogger.error('start command');
    const gitFetchShallowProcess = spawnSync(command, { shell: true });
    knapsackProLogger.error('after started the command');

    const timeout = setTimeout(() => {
      if (gitFetchShallowProcess && gitFetchShallowProcess.pid) {
        process.kill(gitFetchShallowProcess.pid);
        console.log('KILLLLLLL');
        knapsackProLogger.error(
          `Skip the \`${command}\` command because it took too long.`,
        );
      }
    }, 2000);
    knapsackProLogger.error('after timeout set');

    // Wait for the process to complete
    const result =
      gitFetchShallowProcess.status === 0
        ? gitFetchShallowProcess.stdout
        : gitFetchShallowProcess.stderr;

    // Clear the timeout to prevent the cancellation
    clearTimeout(timeout);
  }

  return execSync(
    `git log --since "one month ago" 2>/dev/null | git shortlog --summary --email 2>/dev/null`,
  );
};

export const commitAuthors = (
  command = gitCommitAuthors,
): { commits: number; author: string }[] => $commitAuthors(command);
