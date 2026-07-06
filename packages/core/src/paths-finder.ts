import { readFileSync } from 'fs';
import { KnapsackProEnvConfig } from './config/index.js';
import { KnapsackProLogger } from './knapsack-pro-logger.js';

export class PathsFinder {
  public static pathsFromSourceFile(): string[] | null {
    if (!KnapsackProEnvConfig.testFileListSourceFile) {
      return null;
    }

    const knapsackProLogger = new KnapsackProLogger();
    knapsackProLogger.debug(
      `The KNAPSACK_PRO_TEST_FILE_LIST_SOURCE_FILE environment variable is defined. Knapsack will execute test files based on a list of test files from a file: ${KnapsackProEnvConfig.testFileListSourceFile}.`,
    );

    const allFileContents = readFileSync(
      KnapsackProEnvConfig.testFileListSourceFile,
      'utf-8',
    );

    return allFileContents
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((path) => path.length > 0);
  }
}
