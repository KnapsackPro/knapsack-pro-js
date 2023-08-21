import { CIProviderBase } from '.';

export class Codeship extends CIProviderBase {
  public static get ciNodeTotal(): undefined {
    return undefined;
  }

  public static get ciNodeIndex(): undefined {
    return undefined;
  }

  public static get ciNodeBuildId(): string | undefined {
    return process.env.CI_BUILD_NUMBER;
  }

  public static get ciNodeRetryCount(): undefined {
    return undefined;
  }

  public static get commitHash(): string | undefined {
    return process.env.CI_COMMIT_ID;
  }

  public static get branch(): string | undefined {
    return process.env.CI_BRANCH;
  }

  public static get userSeat(): string | undefined {
    return process.env.CI_COMMITTER_NAME;
  }

  public static get detect(): typeof CIProviderBase | null {
    return process.env.CI_NAME === 'codeship' ? this : null;
  }

  public static get fixedQueueSplit(): boolean {
    return true;
  }

  public static get ciProvider(): string {
    return 'Codeship';
  }
}
