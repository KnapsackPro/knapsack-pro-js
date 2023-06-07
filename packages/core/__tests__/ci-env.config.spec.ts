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
} from '../src/ci-providers';
import { CIEnvConfig } from '../src/config/ci-env.config';

describe('KnapsackProEnvConfig', () => {
  // Since we use CircleCI for testing, we prevent it from interfering with the tests.
  delete process.env.CIRCLECI;
  const ENV = { ...process.env };

  afterEach(() => {
    process.env = { ...ENV };
  });

  describe('.detectCi', () => {
    const TESTS: [string, object, typeof CIProviderBase][] = [
      ['AppVeyor', { APPVEYOR: 'whatever' }, AppVeyor],
      ['Buildkite', { BUILDKITE: 'whatever' }, Buildkite],
      ['CircleCI', { CIRCLECI: 'whatever' }, CircleCI],
      ['Cirrus CI', { CIRRUS_CI: 'whatever' }, CirrusCI],
      ['Codefresh', { CF_BUILD_ID: 'whatever' }, CodefreshCI],
      ['Codeship', { CI_NAME: 'codeship' }, Codeship],
      ['GitHub Actions', { GITHUB_ACTIONS: 'whatever' }, GithubActions],
      ['GitLab CI', { GITLAB_CI: 'whatever' }, GitlabCI],
      ['Heroku CI', { HEROKU_TEST_RUN_ID: 'whatever' }, HerokuCI],
      ['Semaphore CI 1.0', { SEMAPHORE_BUILD_NUMBER: 'whatever' }, SemaphoreCI],
      [
        'Semaphore CI 2.0',
        { SEMAPHORE: 'whatever', SEMAPHORE_WORKFLOW_ID: 'whatever' },
        SemaphoreCI2,
      ],
      ['Travis CI', { TRAVIS: 'whatever' }, TravisCI],
      ['Unsupported CI', {}, UnsupportedCI],
    ];

    TESTS.forEach(([ci, env, expected]) => {
      it(`detects ${ci}`, () => {
        process.env = { ...process.env, ...env };

        expect(CIEnvConfig.detectCi()).toEqual(expected);
      });
    });
  });
});
