import { CIProviderBase } from './index.js';
import { isCI } from '../config/index.js';

export class UnsupportedCI extends CIProviderBase {
  public static get ciNodeTotal(): string | undefined {
    return undefined;
  }

  public static get ciNodeIndex(): string | undefined {
    return undefined;
  }

  public static get ciNodeBuildId(): string | undefined {
    return undefined;
  }

  public static get ciNodeRetryCount(): string | undefined {
    return undefined;
  }

  public static get commitHash(): string | undefined {
    return undefined;
  }

  public static get branch(): string | undefined {
    return undefined;
  }

  public static get userSeat(): string | undefined {
    return undefined;
  }

  public static get fixedQueueSplit(): boolean {
    return true;
  }

  public static get ciProvider(): string | null {
    if ('CODEBUILD_BUILD_ARN' in process.env) {
      return 'AWS CodeBuild';
    }
    if ('SYSTEM_TEAMFOUNDATIONCOLLECTIONURI' in process.env) {
      return 'Azure Pipelines';
    }
    if ('bamboo_planKey' in process.env) {
      return 'Bamboo';
    }
    if ('BITBUCKET_COMMIT' in process.env) {
      return 'Bitbucket Pipelines';
    }
    if ('BUDDY' in process.env) {
      return 'Buddy.works';
    }
    if ('DRONE' in process.env) {
      return 'Drone.io';
    }
    if ('BUILDER_OUTPUT' in process.env) {
      return 'Google Cloud Build';
    }
    if ('JENKINS_URL' in process.env) {
      return 'Jenkins';
    }
    if ('TEAMCITY_VERSION' in process.env) {
      return 'TeamCity';
    }
    if (isCI()) {
      return 'Other';
    }
    return null;
  }
}
