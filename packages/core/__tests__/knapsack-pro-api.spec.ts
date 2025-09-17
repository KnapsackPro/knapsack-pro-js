import { describe, it, expect, afterEach } from 'vitest';
import { getHeaders } from '../src/knapsack-pro-api';

describe('KnapsackProAPI', () => {
  // Since we use CircleCI for testing, we prevent it from interfering with the tests.
  delete process.env.CIRCLECI;
  delete process.env.CI;
  const ENV = { ...process.env };

  afterEach(() => {
    process.env = { ...ENV };
  });

  describe('getHeaders', () => {
    it('includes KNAPSACK-PRO-CLIENT-NAME', () => {
      const clientName = '@knapsack-pro/jest';

      const actual = getHeaders({ clientName, clientVersion: '' })[
        'KNAPSACK-PRO-CLIENT-NAME'
      ];

      expect(actual).toEqual(clientName);
    });

    it('includes KNAPSACK-PRO-CLIENT-VERSION', () => {
      const clientVersion = '7.2.1';

      const actual = getHeaders({ clientName: '', clientVersion })[
        'KNAPSACK-PRO-CLIENT-VERSION'
      ];

      expect(actual).toEqual(clientVersion);
    });

    it('on GitHub Actions it includes KNAPSACK-PRO-CI-PROVIDER', () => {
      process.env = { ...process.env, GITHUB_ACTIONS: 'true' };

      const actual = getHeaders({ clientName: '', clientVersion: '' });

      expect(actual['KNAPSACK-PRO-CI-PROVIDER']).toEqual('GitHub Actions');
    });

    it('with undetected CI it does not include KNAPSACK-PRO-CI-PROVIDER', () => {
      const actual = getHeaders({ clientName: '', clientVersion: '' });

      expect(actual).not.toHaveProperty('KNAPSACK-PRO-CI-PROVIDER');
    });
  });
});
