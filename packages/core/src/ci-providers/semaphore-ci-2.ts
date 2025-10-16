import { CIProviderBase } from './index.js';

export class SemaphoreCI2 extends CIProviderBase {
  public static get ciNodeTotal(): string | undefined {
    return process.env.SEMAPHORE_JOB_COUNT;
  }

  public static get ciNodeIndex(): string | undefined {
    const jobIndex = process.env.SEMAPHORE_JOB_INDEX;

    if (jobIndex) {
      return (parseInt(jobIndex, 10) - 1).toString();
    }
  }

  public static get ciNodeBuildId(): string | undefined {
    return process.env.SEMAPHORE_WORKFLOW_ID;
  }

  public static get ciNodeRetryCount(): undefined {
    return undefined;
  }

  public static get commitHash(): string | undefined {
    return process.env.SEMAPHORE_GIT_SHA;
  }

  public static get branch(): string | undefined {
    return process.env.SEMAPHORE_GIT_WORKING_BRANCH || // undefined when workflow is triggered by pushing a Git tag
process.env.SEMAPHORE_GIT_BRANCH;
  }

  public static get userSeat(): undefined {
    return undefined;
  }

  public static get detect(): typeof CIProviderBase | null {
    return 'SEMAPHORE' in process.env && 'SEMAPHORE_WORKFLOW_ID' in process.env
      ? this
      : null;
  }

  public static get fixedQueueSplit(): boolean {
    return false;
  }

  public static get ciProvider(): string {
    return 'Semaphore CI 2.0';
  }
}
