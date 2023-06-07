import { KnapsackProEnvConfig } from '../src/config/knapsack-pro-env.config';
import { KnapsackProLogger } from '../src/knapsack-pro-logger';
import * as Urls from '../src/urls';

describe('KnapsackProEnvConfig', () => {
  // Since we use CircleCI for testing, we prevent it from interfering with the tests.
  delete process.env.CIRCLECI;
  const ENV = { ...process.env };

  afterEach(() => {
    process.env = { ...ENV };
  });

  describe('.ciNodeBuildId', () => {
    describe('when KNAPSACK_PRO_CI_NODE_BUILD_ID is not defined on the environment and the CI is not supported', () => {
      it('throws', () => {
        expect(() => KnapsackProEnvConfig.ciNodeBuildId).toThrow(
          /Missing environment variable KNAPSACK_PRO_CI_NODE_BUILD_ID/,
        );
      });
    });

    describe('when the build id is defined on a supported CI environment', () => {
      it('returns the CI build ID for the supported CI provider', () => {
        const ciBuildId = 'some-build-id';
        process.env.BUILDKITE = 'true';
        process.env.BUILDKITE_BUILD_NUMBER = ciBuildId;

        expect(KnapsackProEnvConfig.ciNodeBuildId).toEqual(ciBuildId);
      });
    });

    describe('when KNAPSACK_PRO_CI_NODE_BUILD_ID is defined on the environment AND the build id is defined on a supported CI environment', () => {
      it('returns KNAPSACK_PRO_CI_NODE_BUILD_ID', () => {
        const ciBuildId = 'some-build-id';
        process.env.KNAPSACK_PRO_CI_NODE_BUILD_ID = ciBuildId;
        process.env.BUILDKITE = 'true';
        process.env.BUILDKITE_BUILD_NUMBER = 'some-other-build-id';

        expect(KnapsackProEnvConfig.ciNodeBuildId).toEqual(ciBuildId);
      });
    });
  });

  describe('.ciNodeRetryCount', () => {
    it('returns a default retry count', () => {
      expect(KnapsackProEnvConfig.ciNodeRetryCount).toEqual(0);
    });

    describe('when the CI provider is Buildkite', () => {
      describe('when BUILDKITE_RETRY_COUNT is set', () => {
        it('returns the retry count', () => {
          process.env.BUILDKITE = 'true';
          process.env.BUILDKITE_RETRY_COUNT = '1';

          expect(KnapsackProEnvConfig.ciNodeRetryCount).toEqual(1);
        });
      });
    });

    describe('when the CI provider is GitHub Actions', () => {
      describe('when GITHUB_RUN_ATTEMPT is set', () => {
        it('returns the retry count', () => {
          process.env.GITHUB_ACTIONS = 'true';
          process.env.GITHUB_RUN_ATTEMPT = '2';

          expect(KnapsackProEnvConfig.ciNodeRetryCount).toEqual(1);
        });
      });
    });
  });

  describe('.ciNodeTotal', () => {
    describe('when KNAPSACK_PRO_CI_NODE_TOTAL is not defined on the environment and the CI is not supported', () => {
      it('throws', () => {
        expect(() => KnapsackProEnvConfig.ciNodeTotal).toThrow(
          /Undefined number of total CI nodes/,
        );
      });
    });

    describe('when the ciNodeTotal is defined on a supported CI environment', () => {
      it('returns the ciNodeTotal for the supported CI provider', () => {
        const ciNodeTotal = '2';
        process.env.BUILDKITE = 'true';
        process.env.BUILDKITE_PARALLEL_JOB_COUNT = ciNodeTotal;

        const expected = parseInt(ciNodeTotal, 10);
        expect(KnapsackProEnvConfig.ciNodeTotal).toEqual(expected);
      });
    });

    describe('when KNAPSACK_PRO_CI_NODE_TOTAL is defined on the environment AND the ciNodeTotal is defined on a supported CI environment', () => {
      it('returns KNAPSACK_PRO_CI_NODE_TOTAL', () => {
        const ciNodeTotal = '2';
        process.env.KNAPSACK_PRO_CI_NODE_TOTAL = ciNodeTotal;
        process.env.BUILDKITE = 'true';
        process.env.BUILDKITE_PARALLEL_JOB_COUNT = '3';

        const expected = parseInt(ciNodeTotal, 10);
        expect(KnapsackProEnvConfig.ciNodeTotal).toEqual(expected);
      });
    });
  });

  describe('.ciNodeIndex', () => {
    describe('when KNAPSACK_PRO_CI_NODE_INDEX is not defined on the environment and the CI is not supported', () => {
      it('throws', () => {
        expect(() => KnapsackProEnvConfig.ciNodeIndex).toThrow(
          /Undefined CI node index/,
        );
      });
    });

    describe('when the ciNodeIndex is defined on a supported CI environment', () => {
      it('returns the ciNodeIndex for the supported CI provider', () => {
        const ciNodeIndex = '2';
        process.env.BUILDKITE = 'true';
        process.env.BUILDKITE_PARALLEL_JOB = ciNodeIndex;

        const expected = parseInt(ciNodeIndex, 10);
        expect(KnapsackProEnvConfig.ciNodeIndex).toEqual(expected);
      });
    });

    describe('when KNAPSACK_PRO_CI_NODE_INDEX is defined on the environment AND the ciNodeIndex is defined on a supported CI environment', () => {
      it('returns KNAPSACK_PRO_CI_NODE_INDEX', () => {
        const ciNodeIndex = '2';
        process.env.KNAPSACK_PRO_CI_NODE_INDEX = ciNodeIndex;
        process.env.BUILDKITE = 'true';
        process.env.BUILDKITE_PARALLEL_JOB = '3';

        const expected = parseInt(ciNodeIndex, 10);
        expect(KnapsackProEnvConfig.ciNodeIndex).toEqual(expected);
      });
    });
  });

  describe('.commitHash', () => {
    describe('when the commitHash is defined on a supported CI environment', () => {
      it('returns the commitHash for the supported CI provider', () => {
        const commitHash = 'aaa111';
        process.env.BUILDKITE = 'true';
        process.env.BUILDKITE_COMMIT = commitHash;

        expect(KnapsackProEnvConfig.commitHash).toEqual(commitHash);
      });
    });

    describe('when KNAPSACK_PRO_COMMIT_HASH is defined on the environment AND the commitHash is defined on a supported CI environment', () => {
      it('returns KNAPSACK_PRO_COMMIT_HASH', () => {
        const commitHash = 'aaa111';
        process.env.KNAPSACK_PRO_COMMIT_HASH = commitHash;
        process.env.BUILDKITE = 'true';
        process.env.BUILDKITE_COMMIT = 'bbb222';

        expect(KnapsackProEnvConfig.commitHash).toEqual(commitHash);
      });
    });
  });

  describe('.branch', () => {
    describe('when the branch is defined on a supported CI environment', () => {
      it('returns the branch for the supported CI provider', () => {
        const branch = 'aaa111';
        process.env.BUILDKITE = 'true';
        process.env.BUILDKITE_BRANCH = branch;

        expect(KnapsackProEnvConfig.branch).toEqual(branch);
      });
    });

    describe('when KNAPSACK_PRO_BRANCH is defined on the environment AND the branch is defined on a supported CI environment', () => {
      it('returns KNAPSACK_PRO_BRANCH', () => {
        const branch = 'aaa111';
        process.env.KNAPSACK_PRO_BRANCH = branch;
        process.env.BUILDKITE = 'true';
        process.env.BUILDKITE_BRANCH = 'bbb222';

        expect(KnapsackProEnvConfig.branch).toEqual(branch);
      });
    });
  });

  describe('.fixedQueueSplit', () => {
    let logs: string[] = [];

    beforeEach(() => {
      // eslint-disable-next-line dot-notation
      KnapsackProEnvConfig['$knapsackProLogger'] = {
        info(message) {
          logs.push(message);
        },
      } as KnapsackProLogger;
    });

    afterEach(() => {
      // eslint-disable-next-line dot-notation
      KnapsackProEnvConfig['$fixedQueueSplit'] = undefined;
      logs = [];
    });

    describe('when ENV exists', () => {
      describe('when KNAPSACK_PRO_FIXED_QUEUE_SPLIT=false', () => {
        const TESTS: [string, object][] = [
          ['AppVeyor', { APPVEYOR: 'whatever' }],
          ['Buildkite', { BUILDKITE: 'whatever' }],
          ['CircleCI', { CIRCLECI: 'whatever' }],
          ['Cirrus CI', { CIRRUS_CI: 'whatever' }],
          ['Codefresh', { CF_BUILD_ID: 'whatever' }],
          ['Codeship', { CI_NAME: 'codeship' }],
          ['GitHub Actions', { GITHUB_ACTIONS: 'whatever' }],
          ['GitLab CI', { GITLAB_CI: 'whatever' }],
          ['Heroku CI', { HEROKU_TEST_RUN_ID: 'whatever' }],
          ['Semaphore CI 1.0', { SEMAPHORE_BUILD_NUMBER: 'whatever' }],
          [
            'Semaphore CI 2.0',
            { SEMAPHORE: 'whatever', SEMAPHORE_WORKFLOW_ID: 'whatever' },
          ],
          ['Travis CI', { TRAVIS: 'whatever' }],
          ['Unsupported CI', {}],
        ];
        TESTS.forEach(([ci, env]) => {
          it(`on ${ci} it is false`, () => {
            process.env = { ...process.env, ...env };
            process.env.KNAPSACK_PRO_FIXED_QUEUE_SPLIT = 'false';

            expect(KnapsackProEnvConfig.fixedQueueSplit).toEqual(false);
            expect(logs).toEqual([]);
          });
        });
      });

      describe('when KNAPSACK_PRO_FIXED_QUEUE_SPLIT=true', () => {
        const TESTS: [string, object][] = [
          ['AppVeyor', { APPVEYOR: 'whatever' }],
          ['Buildkite', { BUILDKITE: 'whatever' }],
          ['CircleCI', { CIRCLECI: 'whatever' }],
          ['Cirrus CI', { CIRRUS_CI: 'whatever' }],
          ['Codefresh', { CF_BUILD_ID: 'whatever' }],
          ['Codeship', { CI_NAME: 'codeship' }],
          ['GitHub Actions', { GITHUB_ACTIONS: 'whatever' }],
          ['GitLab CI', { GITLAB_CI: 'whatever' }],
          ['Heroku CI', { HEROKU_TEST_RUN_ID: 'whatever' }],
          ['Semaphore CI 1.0', { SEMAPHORE_BUILD_NUMBER: 'whatever' }],
          [
            'Semaphore CI 2.0',
            { SEMAPHORE: 'whatever', SEMAPHORE_WORKFLOW_ID: 'whatever' },
          ],
          ['Travis CI', { TRAVIS: 'whatever' }],
          ['Unsupported CI', {}],
        ];
        TESTS.forEach(([ci, env]) => {
          it(`on ${ci} it is true`, () => {
            process.env = { ...process.env, ...env };
            process.env.KNAPSACK_PRO_FIXED_QUEUE_SPLIT = 'true';

            expect(KnapsackProEnvConfig.fixedQueueSplit).toEqual(true);
            expect(logs).toEqual([]);
          });
        });
      });
    });

    describe("when ENV doesn't exist", () => {
      const TESTS: [string, object, boolean][] = [
        ['AppVeyor', { APPVEYOR: 'whatever' }, false],
        ['Buildkite', { BUILDKITE: 'whatever' }, true],
        ['CircleCI', { CIRCLECI: 'whatever' }, false],
        ['Cirrus CI', { CIRRUS_CI: 'whatever' }, false],
        ['Codefresh', { CF_BUILD_ID: 'whatever' }, false],
        ['Codeship', { CI_NAME: 'codeship' }, true],
        ['GitHub Actions', { GITHUB_ACTIONS: 'whatever' }, true],
        ['GitLab CI', { GITLAB_CI: 'whatever' }, false],
        ['Heroku CI', { HEROKU_TEST_RUN_ID: 'whatever' }, false],
        ['Semaphore CI 1.0', { SEMAPHORE_BUILD_NUMBER: 'whatever' }, false],
        [
          'Semaphore CI 2.0',
          { SEMAPHORE: 'whatever', SEMAPHORE_WORKFLOW_ID: 'whatever' },
          false,
        ],
        ['Travis CI', { TRAVIS: 'whatever' }, true],
        ['Unsupported', {}, true],
      ];
      TESTS.forEach(([ci, env, expected]) => {
        it(`on ${ci} it is ${expected} and the default value is logged once`, () => {
          process.env = { ...process.env, ...env };

          expect(KnapsackProEnvConfig.fixedQueueSplit).toEqual(expected);
          // eslint-disable-next-line
          const _ = KnapsackProEnvConfig.fixedQueueSplit;
          expect(logs).toEqual([
            `KNAPSACK_PRO_FIXED_QUEUE_SPLIT is not set. Using default value: ${expected}. Learn more at ${Urls.FIXED_QUEUE_SPLIT}`,
          ]);
        });
      });
    });
  });
});
