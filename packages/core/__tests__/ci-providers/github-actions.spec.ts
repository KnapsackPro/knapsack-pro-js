import { describe, it, expect, afterEach } from 'vitest';
import { GithubActions } from '../../src/ci-providers/github-actions';

describe('GithubActions.branch', () => {
  const ENV = { ...process.env };

  afterEach(() => {
    process.env = { ...ENV };
  });

  it('when GITHUB_HEAD_REF is set', () => {
    process.env.GITHUB_HEAD_REF = 'feature';
    process.env.GITHUB_REF_NAME = 'main';
    process.env.GITHUB_SHA = '2e13512fc230d6f9ebf4923352718e4d';

    expect(GithubActions.branch).toEqual('feature');
  });

  it('when GITHUB_REF_NAME is set', () => {
    process.env.GITHUB_REF_NAME = 'main';
    process.env.GITHUB_SHA = '2e13512fc230d6f9ebf4923352718e4d';

    expect(GithubActions.branch).toEqual('main');
  });

  it('when GITHUB_HEAD_REF is set to empty string', () => {
    process.env.GITHUB_HEAD_REF = '';
    process.env.GITHUB_REF_NAME = 'main';
    process.env.GITHUB_SHA = '2e13512fc230d6f9ebf4923352718e4d';

    expect(GithubActions.branch).toEqual('main');
  });

  it('when GITHUB_SHA is set', () => {
    process.env.GITHUB_SHA = '2e13512fc230d6f9ebf4923352718e4d';

    expect(GithubActions.branch).toEqual('2e13512fc230d6f9ebf4923352718e4d');
  });

  it('when no ENVs are set', () => {
    expect(GithubActions.branch).toEqual(undefined);
  });
});
