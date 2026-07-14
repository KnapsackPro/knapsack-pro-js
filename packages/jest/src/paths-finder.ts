import { glob } from 'glob';
import { minimatch } from 'minimatch';

import { KnapsackProLogger } from '@knapsack-pro/core';
import { EnvConfig } from './env-config.js';
import * as Urls from './urls.js';

export class PathsFinder {
  public static allPaths(): string[] {
    const paths = glob
      .sync(EnvConfig.testFilePattern)
      .filter((path: string) => {
        if (EnvConfig.testFileExcludePattern) {
          return !minimatch(path, EnvConfig.testFileExcludePattern, {
            matchBase: true,
          });
        }
        return true;
      })
      .filter(
        (path: string) =>
          // ignore test file paths inside node_modules because it's default Jest behavior
          // https://jestjs.io/docs/en/22.2/configuration#testpathignorepatterns-array-string
          !path.match(/node_modules/),
      );

    if (paths.length === 0) {
      const knapsackProLogger = new KnapsackProLogger();

      const errorMessage = `Test files cannot be found.\nPlease set KNAPSACK_PRO_TEST_FILE_PATTERN matching your test directory structure.\nLearn more: ${Urls.NO_TESTS_FOUND}`;

      knapsackProLogger.error(errorMessage);
      throw errorMessage;
    }

    return paths;
  }
}
