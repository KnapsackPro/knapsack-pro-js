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
} from '../ci-providers';

type CIProviderMethod =
  | 'ciNodeTotal'
  | 'ciNodeIndex'
  | 'ciNodeBuildId'
  | 'ciNodeRetryCount'
  | 'commitHash'
  | 'branch'
  | 'userSeat';

export class CIEnvConfig {
  public static get ciNodeTotal(): string | void {
    return this.ciEnvFor('ciNodeTotal');
  }

  public static get ciNodeIndex(): string | void {
    return this.ciEnvFor('ciNodeIndex');
  }

  public static get ciNodeBuildId(): string | void {
    return this.ciEnvFor('ciNodeBuildId');
  }

  public static get ciNodeRetryCount(): string | void {
    return this.ciEnvFor('ciNodeRetryCount');
  }

  public static get commitHash(): string | void {
    return this.ciEnvFor('commitHash');
  }

  public static get branch(): string | void {
    return this.ciEnvFor('branch');
  }

  public static get userSeat(): string | void {
    return this.ciEnvFor('userSeat');
  }

  // eslint-disable-next-line consistent-return
  private static ciEnvFor(functionName: CIProviderMethod): string | void {
    const supportedCIProviders: (typeof CIProviderBase)[] = [
      // load GitLab CI first to avoid edge case with order of loading envs for CI_NODE_INDEX
      GitlabCI,
      AppVeyor,
      Buildkite,
      CircleCI,
      CirrusCI,
      CodefreshCI,
      Codeship,
      GithubActions,
      HerokuCI,
      SemaphoreCI,
      SemaphoreCI2,
      TravisCI,
    ];

    // eslint-disable-next-line no-restricted-syntax
    for (const ciProvider of supportedCIProviders) {
      const value = ciProvider[functionName];
      if (value) {
        return value;
      }
    }
  }
}
