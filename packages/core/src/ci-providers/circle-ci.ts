import { CIProviderBase } from './index.js';

export class CircleCI extends CIProviderBase {
  public static get ciNodeTotal(): string | undefined {
    return process.env.CIRCLE_NODE_TOTAL;
  }

  public static get ciNodeIndex(): string | undefined {
    return process.env.CIRCLE_NODE_INDEX;
  }

  public static get ciNodeBuildId(): string | undefined {
    return process.env.CIRCLE_BUILD_NUM;
  }

  public static get ciNodeRetryCount(): undefined {
    return undefined;
  }

  public static get commitHash(): string | undefined {
    return process.env.CIRCLE_SHA1;
  }

  public static get branch(): string | undefined {
    return process.env.CIRCLE_BRANCH;
  }

  public static get userSeat(): string | undefined {
    return process.env.CIRCLE_USERNAME || process.env.CIRCLE_PR_USERNAME;
  }

  public static get detect(): typeof CIProviderBase | null {
    return 'CIRCLECI' in process.env ? this : null;
  }

  public static get fixedQueueSplit(): boolean {
    return false;
  }

  public static get ciProvider(): string {
    return 'CircleCI';
  }
}
