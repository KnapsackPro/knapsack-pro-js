import { CIProviderBase } from '.';

export class HerokuCI extends CIProviderBase {
  public static get ciNodeTotal(): string | undefined {
    return process.env.CI_NODE_TOTAL;
  }

  public static get ciNodeIndex(): string | undefined {
    return process.env.CI_NODE_INDEX;
  }

  public static get ciNodeBuildId(): string | undefined {
    return process.env.HEROKU_TEST_RUN_ID;
  }

  public static get ciNodeRetryCount(): undefined {
    return undefined;
  }

  public static get commitHash(): string | undefined {
    return process.env.HEROKU_TEST_RUN_COMMIT_VERSION;
  }

  public static get branch(): string | undefined {
    return process.env.HEROKU_TEST_RUN_BRANCH;
  }

  public static get userSeat(): undefined {
    return undefined;
  }

  public static get detect(): typeof CIProviderBase | null {
    return 'HEROKU_TEST_RUN_ID' in process.env ? this : null;
  }

  public static get fixedQueueSplit(): boolean {
    return false;
  }

  public static get ciProvider(): string {
    return 'Heroku CI';
  }
}
