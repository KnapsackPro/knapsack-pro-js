import { KnapsackProEnvConfig } from './config';
import { TestFile } from './models';

export class FallbackTestDistributor {
  private executedTestFilePaths: string[];

  private testFilesPerCiNode: TestFile[][];

  constructor(
    allTestFiles: TestFile[],
    executedTestFiles: TestFile[],
    ciNodeTotal: number = KnapsackProEnvConfig.ciNodeTotal,
  ) {
    this.executedTestFilePaths = executedTestFiles.map(
      (testFile) => testFile.path,
    );

    this.testFilesPerCiNode = this.assignTestFilesPerCiNode(
      this.orderByTestPath(allTestFiles),
      ciNodeTotal,
    );
  }

  public testFilesForCiNode(
    ciNodeIndex: number = KnapsackProEnvConfig.ciNodeIndex,
  ): TestFile[] {
    return this.testFilesPerCiNode[ciNodeIndex].filter(
      (testFile) => !this.executedTestFilePaths.includes(testFile.path),
    );
  }

  private orderByTestPath(testFiles: TestFile[]): TestFile[] {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sortBy = (key: string) => (a: any, b: any) =>
      // eslint-disable-next-line no-nested-ternary
      a[key] > b[key] ? 1 : b[key] > a[key] ? -1 : 0;

    return testFiles.sort(sortBy('path'));
  }

  private assignTestFilesPerCiNode(
    allTestFiles: TestFile[],
    ciNodeTotal: number,
  ): TestFile[][] {
    const testFilesPerCiNode: TestFile[][] = Array.from(
      { length: ciNodeTotal },
      (): TestFile[] => [],
    );

    allTestFiles.forEach((testFile: TestFile, index: number) =>
      testFilesPerCiNode[index % ciNodeTotal].push(testFile),
    );

    return testFilesPerCiNode;
  }
}
