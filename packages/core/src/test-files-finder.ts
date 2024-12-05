import { readFileSync } from 'fs';
import { KnapsackProEnvConfig } from './config';
import { KnapsackProLogger } from './knapsack-pro-logger';
import { TestFile } from './models';

export class TestFilesFinder {
  public static testFilesFromSourceFile(): TestFile[] | null {
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

    const testFiles: TestFile[] = [];

    allFileContents.split(/\r?\n/).forEach((line: string) => {
      const testFilePath: string = line.trim();

      if (testFilePath.length === 0) {
        return;
      }

      testFiles.push({
        path: testFilePath,
      });
    });

    return testFiles;
  }
}
