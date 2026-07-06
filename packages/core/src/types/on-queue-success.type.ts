import { TestFile } from '../models/index.js';

export type onQueueSuccessType = (paths: string[]) => Promise<{
  recordedPaths: TestFile[] | Record<string, number>;
  failedPaths: string[];
  isTestSuiteGreen: boolean;
}>;
