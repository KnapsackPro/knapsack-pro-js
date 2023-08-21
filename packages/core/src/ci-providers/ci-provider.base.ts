export abstract class CIProviderBase {
  public static get ciNodeTotal(): string | undefined {
    throw new Error('nodeTotal getter is not implemented!');
  }

  public static get ciNodeIndex(): string | undefined {
    throw new Error('nodeIndex getter is not implemented!');
  }

  public static get ciNodeBuildId(): string | undefined {
    throw new Error('nodeBuildId getter is not implemented!');
  }

  public static get ciNodeRetryCount(): string | undefined {
    throw new Error('ciNodeRetryCount getter is not implemented!');
  }

  public static get commitHash(): string | undefined {
    throw new Error('commitHash getter is not implemented!');
  }

  public static get branch(): string | undefined {
    throw new Error('branch getter is not implemented!');
  }

  public static get userSeat(): string | undefined {
    throw new Error('userSeat getter is not implemented!');
  }

  public static get fixedQueueSplit(): boolean {
    throw new Error('fixedQueueSplit getter is not implemented!');
  }

  public static get ciProvider(): string | null {
    throw new Error('ciProvider getter is not implemented!');
  }
}
