import { CIProviderBase } from './index.js';

export class TravisCI extends CIProviderBase {
  public static get ciNodeTotal(): undefined {
    return undefined;
  }

  public static get ciNodeIndex(): undefined {
    return undefined;
  }

  public static get ciNodeBuildId(): string | undefined {
    return process.env.TRAVIS_BUILD_NUMBER;
  }

  public static get ciNodeRetryCount(): undefined {
    return undefined;
  }

  public static get commitHash(): string | undefined {
    return process.env.TRAVIS_COMMIT;
  }

  public static get branch(): string | undefined {
    return process.env.TRAVIS_BRANCH;
  }

  public static get userSeat(): undefined {
    return undefined;
  }

  public static get detect(): typeof CIProviderBase | null {
    return 'TRAVIS' in process.env ? this : null;
  }

  public static get fixedQueueSplit(): boolean {
    return true;
  }

  public static get ciProvider(): string {
    return 'Travis CI';
  }
}
