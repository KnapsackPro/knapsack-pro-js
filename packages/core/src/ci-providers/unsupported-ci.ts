import { CIProviderBase } from '.';

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
}
