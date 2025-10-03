import { TestFile } from '../models/index.js';

export type onQueueSuccessType = (queueTestFiles: TestFile[]) => Promise<{
  recordedTestFiles: TestFile[];
  isTestSuiteGreen: boolean;
}>;
