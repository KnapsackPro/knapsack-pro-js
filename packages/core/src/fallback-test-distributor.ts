import { KnapsackProEnvConfig } from './config/index.js';

export class FallbackTestDistributor {
  private executedPaths: string[];

  private pathsPerCiNode: string[][];

  constructor(
    allPaths: string[],
    executedPaths: string[],
    ciNodeTotal: number = KnapsackProEnvConfig.ciNodeTotal,
  ) {
    this.executedPaths = executedPaths;
    this.pathsPerCiNode = this.assignPathsPerCiNode(
      [...allPaths].sort(),
      ciNodeTotal,
    );
  }

  public pathsForCiNode(
    ciNodeIndex: number = KnapsackProEnvConfig.ciNodeIndex,
  ): string[] {
    return this.pathsPerCiNode[ciNodeIndex].filter(
      (path) => !this.executedPaths.includes(path),
    );
  }

  private assignPathsPerCiNode(
    allPaths: string[],
    ciNodeTotal: number,
  ): string[][] {
    const pathsPerCiNode: string[][] = Array.from(
      { length: ciNodeTotal },
      (): string[] => [],
    );

    allPaths.forEach((path: string, index: number) =>
      pathsPerCiNode[index % ciNodeTotal].push(path),
    );

    return pathsPerCiNode;
  }
}
