import { CIProviderBase } from '.';

export class Buildkite extends CIProviderBase {
  public static get ciNodeTotal(): string | undefined {
    return process.env.BUILDKITE_PARALLEL_JOB_COUNT;
  }

  public static get ciNodeIndex(): string | undefined {
    return process.env.BUILDKITE_PARALLEL_JOB;
  }

  public static get ciNodeBuildId(): string | undefined {
    return process.env.BUILDKITE_BUILD_NUMBER;
  }

  public static get ciNodeRetryCount(): string | undefined {
    return process.env.BUILDKITE_RETRY_COUNT;
  }

  public static get commitHash(): string | undefined {
    return process.env.BUILDKITE_COMMIT;
  }

  public static get branch(): string | undefined {
    return process.env.BUILDKITE_BRANCH;
  }

  public static get userSeat(): string | undefined {
    return (
      process.env.BUILDKITE_BUILD_AUTHOR || process.env.BUILDKITE_BUILD_CREATOR
    );
  }

  public static get detect(): typeof CIProviderBase | null {
    return 'BUILDKITE' in process.env ? this : null;
  }

  public static get fixedQueueSplit(): boolean {
    return true;
  }
}
