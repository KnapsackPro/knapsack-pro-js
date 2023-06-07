import { CIProviderBase } from '.';

export class SemaphoreCI extends CIProviderBase {
  public static get ciNodeTotal(): string | undefined {
    return process.env.SEMAPHORE_THREAD_COUNT;
  }

  // eslint-disable-next-line getter-return, consistent-return
  public static get ciNodeIndex(): string | undefined {
    const currentThread = process.env.SEMAPHORE_CURRENT_THREAD;

    if (currentThread) {
      return (parseInt(currentThread, 10) - 1).toString();
    }
  }

  public static get ciNodeBuildId(): string | undefined {
    return process.env.SEMAPHORE_BUILD_NUMBER;
  }

  public static get ciNodeRetryCount(): undefined {
    return undefined;
  }

  public static get commitHash(): string | undefined {
    return process.env.REVISION;
  }

  public static get branch(): string | undefined {
    return process.env.BRANCH_NAME;
  }

  public static get userSeat(): undefined {
    return undefined;
  }

  public static get detect(): typeof CIProviderBase | null {
    return 'SEMAPHORE_BUILD_NUMBER' in process.env ? this : null;
  }

  public static get fixedQueueSplit(): boolean {
    return false;
  }
}
