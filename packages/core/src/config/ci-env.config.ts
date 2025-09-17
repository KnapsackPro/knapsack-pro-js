import {
  AppVeyor,
  Buildkite,
  CIProviderBase,
  CircleCI,
  CirrusCI,
  CodefreshCI,
  Codeship,
  GithubActions,
  GitlabCI,
  HerokuCI,
  SemaphoreCI,
  SemaphoreCI2,
  TravisCI,
  UnsupportedCI,
} from '../ci-providers/index.js';

export const detectCI = (): typeof CIProviderBase => {
  const detected = [
    AppVeyor,
    Buildkite,
    CircleCI,
    CirrusCI,
    CodefreshCI,
    Codeship,
    GithubActions,
    GitlabCI,
    HerokuCI,
    SemaphoreCI,
    SemaphoreCI2,
    TravisCI,
  ]
    .map((provider) => provider.detect)
    .filter(Boolean)[0];

  return detected || UnsupportedCI;
};

export const isCI = (): boolean =>
  (process.env.CI || 'false').toLowerCase() === 'true' ||
  detectCI() !== UnsupportedCI;

export type CIProviderMethod =
  | 'ciNodeTotal'
  | 'ciNodeIndex'
  | 'ciNodeBuildId'
  | 'ciNodeRetryCount'
  | 'commitHash'
  | 'branch'
  | 'userSeat'
  | 'fixedQueueSplit';

export class CIEnvConfig {
  public static get ciNodeTotal(): string | undefined {
    return this.ciEnvFor('ciNodeTotal');
  }

  public static get ciNodeIndex(): string | undefined {
    return this.ciEnvFor('ciNodeIndex');
  }

  public static get ciNodeBuildId(): string | undefined {
    return this.ciEnvFor('ciNodeBuildId');
  }

  public static get ciNodeRetryCount(): string | undefined {
    return this.ciEnvFor('ciNodeRetryCount');
  }

  public static get commitHash(): string | undefined {
    return this.ciEnvFor('commitHash');
  }

  public static get branch(): string | undefined {
    return this.ciEnvFor('branch');
  }

  public static get userSeat(): string | undefined {
    return this.ciEnvFor('userSeat');
  }

  public static get fixedQueueSplit(): boolean {
    return this.ciEnvFor('fixedQueueSplit');
  }

  private static ciEnvFor<T extends CIProviderMethod>(
    functionName: T,
  ): (typeof CIProviderBase)[T] {
    return detectCI()[functionName];
  }
}
