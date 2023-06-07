import { CIProviderBase } from '.';

export class CirrusCI extends CIProviderBase {
  public static get ciNodeTotal(): string | undefined {
    return process.env.CI_NODE_TOTAL;
  }

  public static get ciNodeIndex(): string | undefined {
    return process.env.CI_NODE_INDEX;
  }

  public static get ciNodeBuildId(): string | undefined {
    return process.env.CIRRUS_BUILD_ID;
  }

  public static get ciNodeRetryCount(): undefined {
    return undefined;
  }

  public static get commitHash(): string | undefined {
    return process.env.CIRRUS_CHANGE_IN_REPO;
  }

  public static get branch(): string | undefined {
    return process.env.CIRRUS_BRANCH;
  }

  public static get userSeat(): undefined {
    return undefined;
  }

  public static get detect(): typeof CIProviderBase | null {
    return 'CIRRUS_CI' in process.env ? this : null;
  }

  public static get fixedQueueSplit(): boolean {
    return false;
  }
}
