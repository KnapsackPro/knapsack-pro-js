export type onQueueSuccessType = (paths: string[]) => Promise<{
  recordedPaths: Record<string, number>;
  failedPaths: string[];
  isTestSuiteGreen: boolean;
}>;
