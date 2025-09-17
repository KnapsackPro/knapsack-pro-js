import { CIProviderBase } from './index.js';

export class GitlabCI extends CIProviderBase {
  public static get ciNodeTotal(): string | undefined {
    return process.env.CI_NODE_TOTAL;
  }

  // eslint-disable-next-line getter-return, consistent-return
  public static get ciNodeIndex(): string | undefined {
    if (process.env.GITLAB_CI) {
      const index = process.env.CI_NODE_INDEX; // GitLab >= 11.5

      if (index) {
        return (parseInt(index, 10) - 1).toString();
      }
    }
  }

  public static get ciNodeBuildId(): string | undefined {
    // GitLab Release 9.0+ || GitLab Release 8.x
    return process.env.CI_PIPELINE_ID || process.env.CI_BUILD_ID;
  }

  public static get ciNodeRetryCount(): undefined {
    return undefined;
  }

  public static get commitHash(): string | undefined {
    // GitLab Release 9.0+ || GitLab Release 8.x
    return process.env.CI_COMMIT_SHA || process.env.CI_BUILD_REF;
  }

  public static get branch(): string | undefined {
    // GitLab Release 9.0+ || GitLab Release 8.x
    return process.env.CI_COMMIT_REF_NAME || process.env.CI_BUILD_REF_NAME;
  }

  public static get userSeat(): string | undefined {
    const userName = process.env.GITLAB_USER_NAME; // Gitlab Release 10.0
    const userEmail = process.env.GITLAB_USER_EMAIL; // Gitlab Release 8.12
    return userName || userEmail;
  }

  public static get detect(): typeof CIProviderBase | null {
    return 'GITLAB_CI' in process.env ? this : null;
  }

  public static get fixedQueueSplit(): boolean {
    return true;
  }

  public static get ciProvider(): string {
    return 'Gitlab CI';
  }
}
