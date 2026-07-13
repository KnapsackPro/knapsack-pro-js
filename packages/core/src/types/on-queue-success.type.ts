export type onQueueSuccessType = (paths: string[]) => Promise<{
  recordedPaths: Record<string, number>;
  failedPaths: Set<string>;
  isTestSuiteGreen: boolean;
}>;
