import { CIProviderBase } from './index.js';

// https://www.appveyor.com/docs/environment-variables/
export class AppVeyor extends CIProviderBase {
  public static get ciNodeTotal(): undefined {
    return undefined;
  }

  public static get ciNodeIndex(): undefined {
    return undefined;
  }

  public static get ciNodeBuildId(): string | undefined {
    return process.env.APPVEYOR_BUILD_ID;
  }

  public static get ciNodeRetryCount(): undefined {
    return undefined;
  }

  public static get commitHash(): string | undefined {
    return process.env.APPVEYOR_REPO_COMMIT;
  }

  public static get branch(): string | undefined {
    return process.env.APPVEYOR_REPO_BRANCH;
  }

  public static get userSeat(): string | undefined {
    return process.env.APPVEYOR_REPO_COMMIT_AUTHOR;
  }

  public static get detect(): typeof CIProviderBase | null {
    return 'APPVEYOR' in process.env ? this : null;
  }

  public static get fixedQueueSplit(): boolean {
    return false;
  }

  public static get ciProvider(): string {
    return 'AppVeyor';
  }
}
