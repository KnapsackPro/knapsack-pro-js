import { CIProviderBase } from '.';

// https://codefresh.io/docs/docs/codefresh-yaml/variables/#system-provided-variables
export class CodefreshCI extends CIProviderBase {
  public static get ciNodeTotal(): undefined {
    return undefined;
  }

  public static get ciNodeIndex(): undefined {
    return undefined;
  }

  public static get ciNodeBuildId(): string | undefined {
    return process.env.CF_BUILD_ID;
  }

  public static get ciNodeRetryCount(): undefined {
    return undefined;
  }

  public static get commitHash(): string | undefined {
    return process.env.CF_REVISION;
  }

  public static get branch(): string | undefined {
    return process.env.CF_BRANCH;
  }

  public static get userSeat(): string | undefined {
    return process.env.CF_BUILD_INITIATOR;
  }

  public static get detect(): typeof CIProviderBase | null {
    return 'CF_BUILD_ID' in process.env ? this : null;
  }

  public static get fixedQueueSplit(): boolean {
    return false;
  }

  public static get ciProvider(): string {
    return 'Codefresh';
  }
}
