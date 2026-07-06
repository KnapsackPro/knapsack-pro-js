import { describe, it, expect } from 'vitest';
import { FallbackTestDistributor } from '../src/fallback-test-distributor';

describe('FallbackTestDistributor', () => {
  describe('#pathsForCiNode', () => {
    describe('when there are no executed test files', () => {
      it('returns tests for particular CI node index', () => {
        const allPaths = [
          'a.spec.js',
          'b.spec.js',
          'c.spec.js',
          'd.spec.js',
          'e.spec.js',
        ];
        const executedPaths: string[] = [];
        const ciNodeTotal = 2;

        const fallbackTestDistributor = new FallbackTestDistributor(
          allPaths,
          executedPaths,
          ciNodeTotal,
        );

        const expectedPathsForCiNode0 = ['a.spec.js', 'c.spec.js', 'e.spec.js'];
        expect(fallbackTestDistributor.pathsForCiNode(0)).toEqual(
          expectedPathsForCiNode0,
        );

        const expectedPathsForCiNode1 = ['b.spec.js', 'd.spec.js'];
        expect(fallbackTestDistributor.pathsForCiNode(1)).toEqual(
          expectedPathsForCiNode1,
        );
      });
    });

    describe('when test files in test suite are not sorted', () => {
      it('returns tests for particular CI node index', () => {
        const allPaths = [
          'b.spec.js',
          'a.spec.js',
          'e.spec.js',
          'd.spec.js',
          'c.spec.js',
        ];
        const executedPaths: string[] = [];
        const ciNodeTotal = 2;

        const fallbackTestDistributor = new FallbackTestDistributor(
          allPaths,
          executedPaths,
          ciNodeTotal,
        );

        const expectedPathsForCiNode0 = ['a.spec.js', 'c.spec.js', 'e.spec.js'];
        expect(fallbackTestDistributor.pathsForCiNode(0)).toEqual(
          expectedPathsForCiNode0,
        );

        const expectedPathsForCiNode1 = ['b.spec.js', 'd.spec.js'];
        expect(fallbackTestDistributor.pathsForCiNode(1)).toEqual(
          expectedPathsForCiNode1,
        );
      });
    });

    describe('when there are executed test files', () => {
      it('returns tests for particular CI node index without already executed test files', () => {
        const allPaths = [
          'a.spec.js',
          'b.spec.js',
          'c.spec.js',
          'd.spec.js',
          'e.spec.js',
        ];
        const executedPaths = ['a.spec.js', 'd.spec.js', 'e.spec.js'];
        const ciNodeTotal = 2;

        const fallbackTestDistributor = new FallbackTestDistributor(
          allPaths,
          executedPaths,
          ciNodeTotal,
        );

        const expectedPathsForCiNode0 = ['c.spec.js'];
        expect(fallbackTestDistributor.pathsForCiNode(0)).toEqual(
          expectedPathsForCiNode0,
        );

        const expectedPathsForCiNode1 = ['b.spec.js'];
        expect(fallbackTestDistributor.pathsForCiNode(1)).toEqual(
          expectedPathsForCiNode1,
        );
      });
    });
  });
});
