import {
  KnapsackProEnvConfig,
  buildAuthor,
  commitAuthors,
  ciProvider,
} from '../src/config/knapsack-pro-env.config';
import { KnapsackProLogger } from '../src/knapsack-pro-logger';
import * as Urls from '../src/urls';

describe('KnapsackProEnvConfig', () => {
  // Since we use CircleCI for testing, we prevent it from interfering with the tests.
  delete process.env.CIRCLECI;
  delete process.env.CI;
  const ENV = { ...process.env };
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
    process.env = { ...ENV };
    logs = [];
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
        expect(logs).toEqual([]);
      });
    });

    describe('when KNAPSACK_PRO_CI_NODE_BUILD_ID is defined on the environment AND the build id is defined on a supported CI environment', () => {
      it('returns KNAPSACK_PRO_CI_NODE_BUILD_ID and logs info', () => {
        const ciBuildId = 'some-build-id';
        process.env.KNAPSACK_PRO_CI_NODE_BUILD_ID = ciBuildId;
        process.env.BUILDKITE = 'true';
        process.env.BUILDKITE_BUILD_NUMBER = 'some-other-build-id';

        expect(KnapsackProEnvConfig.ciNodeBuildId).toEqual(ciBuildId);
        expect(logs).toEqual([
          `You have set the environment variable KNAPSACK_PRO_CI_NODE_BUILD_ID to ${ciBuildId} which could be automatically determined from the CI environment as ${process.env.BUILDKITE_BUILD_NUMBER}.`,
        ]);
      });
    });

    describe('when KNAPSACK_PRO_CI_NODE_BUILD_ID is defined on the environment AND the build id is defined on a supported CI environment AND they are the same value', () => {
      it('does not log info', () => {
        process.env.KNAPSACK_PRO_CI_NODE_BUILD_ID = 'some-build-id';
        process.env.BUILDKITE = 'true';
        process.env.BUILDKITE_BUILD_NUMBER = 'some-build-id';

        expect(logs).toEqual([]);
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
          expect(logs).toEqual([]);
        });
      });
    });

    describe('when the CI provider is GitHub Actions', () => {
      describe('when GITHUB_RUN_ATTEMPT is set', () => {
        it('returns the retry count', () => {
          process.env.GITHUB_ACTIONS = 'true';
          process.env.GITHUB_RUN_ATTEMPT = '2';

          expect(KnapsackProEnvConfig.ciNodeRetryCount).toEqual(1);
          expect(logs).toEqual([]);
        });
      });
    });

    describe('when KNAPSACK_PRO_CI_NODE_RETRY_COUNT is defined on the environment AND the retry count is defined on a supported CI environment', () => {
      it('returns KNAPSACK_PRO_CI_NODE_RETRY_COUNT and logs info', () => {
        process.env.KNAPSACK_PRO_CI_NODE_RETRY_COUNT = '2';
        process.env.BUILDKITE = 'true';
        process.env.BUILDKITE_RETRY_COUNT = '1';

        expect(KnapsackProEnvConfig.ciNodeRetryCount).toEqual(2);
        expect(logs).toEqual([
          `You have set the environment variable KNAPSACK_PRO_CI_NODE_RETRY_COUNT to ${process.env.KNAPSACK_PRO_CI_NODE_RETRY_COUNT} which could be automatically determined from the CI environment as ${process.env.BUILDKITE_RETRY_COUNT}.`,
        ]);
      });
    });

    describe('when KNAPSACK_PRO_CI_NODE_RETRY_COUNT is defined on the environment AND the retry count is defined on a supported CI environment AND they are the same value', () => {
      it('does not log info', () => {
        process.env.KNAPSACK_PRO_CI_NODE_RETRY_COUNT = '2';
        process.env.BUILDKITE = 'true';
        process.env.BUILDKITE_RETRY_COUNT = '2';

        expect(logs).toEqual([]);
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
        expect(logs).toEqual([]);
      });
    });

    describe('when KNAPSACK_PRO_CI_NODE_TOTAL is defined on the environment AND the ciNodeTotal is defined on a supported CI environment', () => {
      it('returns KNAPSACK_PRO_CI_NODE_TOTAL and logs info', () => {
        const ciNodeTotal = '2';
        process.env.KNAPSACK_PRO_CI_NODE_TOTAL = ciNodeTotal;
        process.env.BUILDKITE = 'true';
        process.env.BUILDKITE_PARALLEL_JOB_COUNT = '3';

        const expected = parseInt(ciNodeTotal, 10);
        expect(KnapsackProEnvConfig.ciNodeTotal).toEqual(expected);
        expect(logs).toEqual([
          `You have set the environment variable KNAPSACK_PRO_CI_NODE_TOTAL to ${ciNodeTotal} which could be automatically determined from the CI environment as ${process.env.BUILDKITE_PARALLEL_JOB_COUNT}.`,
        ]);
      });
    });

    describe('when KNAPSACK_PRO_CI_NODE_TOTAL is defined on the environment AND the ciNodeTotal is defined on a supported CI environment AND they are the same value', () => {
      it('does not log info', () => {
        process.env.KNAPSACK_PRO_CI_NODE_TOTAL = '2';
        process.env.BUILDKITE = 'true';
        process.env.BUILDKITE_PARALLEL_JOB_COUNT = '2';

        expect(logs).toEqual([]);
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
        expect(logs).toEqual([]);
      });
    });

    describe('when KNAPSACK_PRO_CI_NODE_INDEX is defined on the environment AND the ciNodeIndex is defined on a supported CI environment', () => {
      it('returns KNAPSACK_PRO_CI_NODE_INDEX and logs info', () => {
        const ciNodeIndex = '2';
        process.env.KNAPSACK_PRO_CI_NODE_INDEX = ciNodeIndex;
        process.env.BUILDKITE = 'true';
        process.env.BUILDKITE_PARALLEL_JOB = '3';

        const expected = parseInt(ciNodeIndex, 10);
        expect(KnapsackProEnvConfig.ciNodeIndex).toEqual(expected);
        expect(logs).toEqual([
          `You have set the environment variable KNAPSACK_PRO_CI_NODE_INDEX to ${ciNodeIndex} which could be automatically determined from the CI environment as ${process.env.BUILDKITE_PARALLEL_JOB}.`,
        ]);
      });
    });

    describe('when KNAPSACK_PRO_CI_NODE_INDEX is defined on the environment AND the ciNodeIndex is defined on a supported CI environment AND they are the same value', () => {
      it('does not log info', () => {
        process.env.KNAPSACK_PRO_CI_NODE_INDEX = '2';
        process.env.BUILDKITE = 'true';
        process.env.BUILDKITE_PARALLEL_JOB = '2';

        expect(logs).toEqual([]);
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
        expect(logs).toEqual([]);
      });
    });

    describe('when KNAPSACK_PRO_COMMIT_HASH is defined on the environment AND the commitHash is defined on a supported CI environment', () => {
      it('returns KNAPSACK_PRO_COMMIT_HASH and logs info', () => {
        const commitHash = 'aaa111';
        process.env.KNAPSACK_PRO_COMMIT_HASH = commitHash;
        process.env.BUILDKITE = 'true';
        process.env.BUILDKITE_COMMIT = 'bbb222';

        expect(KnapsackProEnvConfig.commitHash).toEqual(commitHash);
        expect(logs).toEqual([
          `You have set the environment variable KNAPSACK_PRO_COMMIT_HASH to ${commitHash} which could be automatically determined from the CI environment as ${process.env.BUILDKITE_COMMIT}.`,
        ]);
      });
    });

    describe('when KNAPSACK_PRO_COMMIT_HASH is defined on the environment AND the commitHash is defined on a supported CI environment AND they are the same value', () => {
      it('does not log info', () => {
        process.env.KNAPSACK_PRO_COMMIT_HASH = 'aaa111';
        process.env.BUILDKITE = 'true';
        process.env.BUILDKITE_COMMIT = 'aaa111';

        expect(logs).toEqual([]);
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
        expect(logs).toEqual([]);
      });
    });

    describe('when KNAPSACK_PRO_BRANCH is defined on the environment AND the branch is defined on a supported CI environment', () => {
      it('returns KNAPSACK_PRO_BRANCH and logs info', () => {
        const branch = 'aaa111';
        process.env.KNAPSACK_PRO_BRANCH = branch;
        process.env.BUILDKITE = 'true';
        process.env.BUILDKITE_BRANCH = 'bbb222';

        expect(KnapsackProEnvConfig.branch).toEqual(branch);
        expect(logs).toEqual([
          `You have set the environment variable KNAPSACK_PRO_BRANCH to ${branch} which could be automatically determined from the CI environment as ${process.env.BUILDKITE_BRANCH}.`,
        ]);
      });
    });

    describe('when KNAPSACK_PRO_BRANCH is defined on the environment AND the branch is defined on a supported CI environment AND they are the same value', () => {
      it('does not log info', () => {
        process.env.KNAPSACK_PRO_BRANCH = 'aaa111';
        process.env.BUILDKITE = 'true';
        process.env.BUILDKITE_BRANCH = 'aaa111';

        expect(logs).toEqual([]);
      });
    });
  });

  describe('.fixedQueueSplit', () => {
    afterEach(() => {
      // eslint-disable-next-line dot-notation
      KnapsackProEnvConfig['$fixedQueueSplit'] = undefined;
    });

    describe('when ENV exists', () => {
      describe('when KNAPSACK_PRO_FIXED_QUEUE_SPLIT=false', () => {
        const TESTS: [string, object, boolean][] = [
          ['AppVeyor', { APPVEYOR: 'whatever' }, false],
          ['Buildkite', { BUILDKITE: 'whatever' }, true],
          ['CircleCI', { CIRCLECI: 'whatever' }, false],
          ['Cirrus CI', { CIRRUS_CI: 'whatever' }, false],
          ['Codefresh', { CF_BUILD_ID: 'whatever' }, false],
          ['Codeship', { CI_NAME: 'codeship' }, true],
          ['GitHub Actions', { GITHUB_ACTIONS: 'whatever' }, true],
          ['GitLab CI', { GITLAB_CI: 'whatever' }, true],
          ['Heroku CI', { HEROKU_TEST_RUN_ID: 'whatever' }, false],
          ['Semaphore CI 1.0', { SEMAPHORE_BUILD_NUMBER: 'whatever' }, false],
          [
            'Semaphore CI 2.0',
            { SEMAPHORE: 'whatever', SEMAPHORE_WORKFLOW_ID: 'whatever' },
            false,
          ],
          ['Travis CI', { TRAVIS: 'whatever' }, true],
          ['Unsupported CI', {}, true],
        ];
        TESTS.forEach(([ci, env, ciEnv]) => {
          it(`on ${ci} it is false`, () => {
            process.env = { ...process.env, ...env };
            process.env.KNAPSACK_PRO_FIXED_QUEUE_SPLIT = 'false';

            expect(KnapsackProEnvConfig.fixedQueueSplit).toEqual(false);

            if (ciEnv === false) {
              expect(logs).toEqual([]);
            } else {
              expect(logs).toEqual([
                `You have set the environment variable KNAPSACK_PRO_FIXED_QUEUE_SPLIT to false which could be automatically determined from the CI environment as ${ciEnv}.`,
              ]);
            }
          });
        });
      });

      describe('when KNAPSACK_PRO_FIXED_QUEUE_SPLIT=true', () => {
        const TESTS: [string, object, boolean][] = [
          ['AppVeyor', { APPVEYOR: 'whatever' }, false],
          ['Buildkite', { BUILDKITE: 'whatever' }, true],
          ['CircleCI', { CIRCLECI: 'whatever' }, false],
          ['Cirrus CI', { CIRRUS_CI: 'whatever' }, false],
          ['Codefresh', { CF_BUILD_ID: 'whatever' }, false],
          ['Codeship', { CI_NAME: 'codeship' }, true],
          ['GitHub Actions', { GITHUB_ACTIONS: 'whatever' }, true],
          ['GitLab CI', { GITLAB_CI: 'whatever' }, true],
          ['Heroku CI', { HEROKU_TEST_RUN_ID: 'whatever' }, false],
          ['Semaphore CI 1.0', { SEMAPHORE_BUILD_NUMBER: 'whatever' }, false],
          [
            'Semaphore CI 2.0',
            { SEMAPHORE: 'whatever', SEMAPHORE_WORKFLOW_ID: 'whatever' },
            false,
          ],
          ['Travis CI', { TRAVIS: 'whatever' }, true],
          ['Unsupported CI', {}, true],
        ];
        TESTS.forEach(([ci, env, ciEnv]) => {
          it(`on ${ci} it is true`, () => {
            process.env = { ...process.env, ...env };
            process.env.KNAPSACK_PRO_FIXED_QUEUE_SPLIT = 'true';

            expect(KnapsackProEnvConfig.fixedQueueSplit).toEqual(true);

            if (ciEnv === true) {
              expect(logs).toEqual([]);
            } else {
              expect(logs).toEqual([
                `You have set the environment variable KNAPSACK_PRO_FIXED_QUEUE_SPLIT to true which could be automatically determined from the CI environment as ${ciEnv}.`,
              ]);
            }
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
        ['GitLab CI', { GITLAB_CI: 'whatever' }, true],
        ['Heroku CI', { HEROKU_TEST_RUN_ID: 'whatever' }, false],
        ['Semaphore CI 1.0', { SEMAPHORE_BUILD_NUMBER: 'whatever' }, false],
        [
          'Semaphore CI 2.0',
          { SEMAPHORE: 'whatever', SEMAPHORE_WORKFLOW_ID: 'whatever' },
          false,
        ],
        ['Travis CI', { TRAVIS: 'whatever' }, true],
        ['Unsupported CI', {}, true],
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

  describe('.maskedUserSeat', () => {
    describe('when KNAPSACK_PRO_USER_SEAT is set', () => {
      it('it returns the masked KNAPSACK_PRO_USER_SEAT', () => {
        process.env.KNAPSACK_PRO_USER_SEAT = 'riccardo';

        expect(KnapsackProEnvConfig.maskedUserSeat).toEqual('ri******');
        expect(logs).toEqual([]);
      });
    });

    describe('when CI is CircleCI', () => {
      it('it returns the masked CIRCLE_USERNAME', () => {
        process.env.CIRCLECI = 'whatever';
        process.env.CIRCLE_USERNAME = 'riccardo';

        expect(KnapsackProEnvConfig.maskedUserSeat).toEqual('ri******');
        expect(logs).toEqual([]);
      });
    });

    describe('when both KNAPSACK_PRO_USER_SEAT is set and CI is CircleCI', () => {
      it('it returns the masked KNAPSACK_PRO_USER_SEAT and logs info', () => {
        process.env.KNAPSACK_PRO_USER_SEAT = 'jane';
        process.env.CIRCLECI = 'whatever';
        process.env.CIRCLE_USERNAME = 'riccardo';

        expect(KnapsackProEnvConfig.maskedUserSeat).toEqual('ja**');
        expect(logs).toEqual([
          `You have set the environment variable KNAPSACK_PRO_USER_SEAT to ${process.env.KNAPSACK_PRO_USER_SEAT} which could be automatically determined from the CI environment as ${process.env.CIRCLE_USERNAME}.`,
        ]);
      });
    });

    describe('when both KNAPSACK_PRO_USER_SEAT is set and CI is CircleCI with defined username and they are the same value', () => {
      it('does not log info', () => {
        process.env.KNAPSACK_PRO_USER_SEAT = 'jane';
        process.env.CIRCLECI = 'whatever';
        process.env.CIRCLE_USERNAME = 'jane';

        expect(logs).toEqual([]);
      });
    });
  });

  describe('buildAuthor', () => {
    it('returns the masked build author', () => {
      const actual = buildAuthor(() =>
        Buffer.from('John Doe <john.doe@example.com>\n'),
      );

      expect(actual).toEqual('Jo** Do* <jo**.do*@ex*****.co*>');
    });

    describe('when the command raises an exception', () => {
      it('returns the no-git author', () => {
        const actual = buildAuthor(() => {
          throw new Error();
        });

        expect(actual).toEqual('no git <no.git@example.com>');
      });
    });
  });

  describe('commitAuthors', () => {
    it('returns the masked commit authors', () => {
      const actual = commitAuthors(() =>
        Buffer.from(
          [
            '     5\t3v0k4 <riccardo@example.com>\n',
            '    10\tArtur Nowak <artur@example.com>\n',
            '     2\tRiccardo <riccardo@example.com>\n',
            '     3 \tshadre <shadi@example.com>\n',
          ].join(''),
        ),
      );

      expect(actual).toEqual([
        { commits: 5, author: '3v0*4 <ri******@ex*****.co*>' },
        { commits: 10, author: 'Ar*** No*** <ar***@ex*****.co*>' },
        { commits: 2, author: 'Ri****** <ri******@ex*****.co*>' },
        { commits: 3, author: 'sh**** <sh***@ex*****.co*>' },
      ]);
    });

    describe('when the command raises an exception', () => {
      it('returns []', () => {
        const actual = commitAuthors(() => {
          throw new Error();
        });

        expect(actual).toEqual([]);
      });
    });
  });

  describe('ciProvider', () => {
    const TESTS: [string, object][] = [
      ['AppVeyor', { APPVEYOR: '123' }],
      ['Azure Pipelines', { SYSTEM_TEAMFOUNDATIONCOLLECTIONURI: '123' }],
      ['AWS CodeBuild', { CODEBUILD_BUILD_ARN: '123' }],
      ['Bamboo', { bamboo_planKey: '123' }],
      ['Bitbucket Pipelines', { BITBUCKET_COMMIT: '123' }],
      ['Buddy.works', { BUDDY: 'true' }],
      ['Buildkite', { BUILDKITE: 'true' }],
      ['CircleCI', { CIRCLECI: 'true' }],
      ['Cirrus CI', { CIRRUS_CI: 'true' }],
      ['Codefresh', { CF_BUILD_ID: '123' }],
      ['Codeship', { CI_NAME: 'codeship' }],
      ['Drone.io', { DRONE: 'true' }],
      ['GitHub Actions', { GITHUB_ACTIONS: 'true' }],
      ['Gitlab CI', { GITLAB_CI: 'true' }],
      ['Google Cloud Build', { BUILDER_OUTPUT: '123' }],
      ['Heroku CI', { HEROKU_TEST_RUN_ID: '123' }],
      ['Jenkins', { JENKINS_URL: '123' }],
      ['Semaphore CI 1.0', { SEMAPHORE_BUILD_NUMBER: '123' }],
      ['Semaphore CI 2.0', { SEMAPHORE: 'true', SEMAPHORE_WORKFLOW_ID: '123' }],
      ['TeamCity', { TEAMCITY_VERSION: '123' }],
      ['Travis CI', { TRAVIS: 'true' }],
      ['Other', { CI: 'true' }],
      [null, {}],
    ];

    TESTS.forEach(([ci, env]) => {
      it(`detects ${ci ?? 'missing CI from env or development'}`, () => {
        process.env = { ...process.env, ...env };

        const actual = ciProvider();

        expect(actual).toEqual(ci);
      });
    });
  });
});
