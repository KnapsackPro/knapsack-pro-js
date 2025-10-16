import { describe, it, expect, afterEach } from 'vitest';
import { SemaphoreCI2 } from '../../src/ci-providers/semaphore-ci-2';

describe('SemaphoreCI2.branch', () => {
  const ENV = { ...process.env };

  afterEach(() => {
    process.env = { ...ENV };
  });

  it('when SEMAPHORE_GIT_WORKING_BRANCH is set', () => {
    process.env.SEMAPHORE_GIT_WORKING_BRANCH = 'feature';
    process.env.SEMAPHORE_GIT_BRANCH = 'main';

    expect(SemaphoreCI2.branch).toEqual('feature');
  });

  it('when SEMAPHORE_GIT_BRANCH is set', () => {
    process.env.SEMAPHORE_GIT_BRANCH = 'main';

    expect(SemaphoreCI2.branch).toEqual('main');
  });

  it('when no ENVs are set', () => {
    expect(SemaphoreCI2.branch).toEqual(undefined);
  });
});
