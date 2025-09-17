import { describe, it, expect } from 'vitest';
import { FallbackTestDistributor } from '../src/fallback-test-distributor';
import { TestFile } from '../src/models';

describe('FallbackTestDistributor', () => {
  describe('#testFilesForCiNode', () => {
    describe('when there are no executed test files', () => {
      it('returns tests for particular CI node index', () => {
        const allTestFiles: TestFile[] = [
          { path: 'a.spec.js' },
          { path: 'b.spec.js' },
          { path: 'c.spec.js' },
          { path: 'd.spec.js' },
          { path: 'e.spec.js' },
        ];
        const executedTestFiles: TestFile[] = [];
        const ciNodeTotal = 2;

        const fallbackTestDistributor = new FallbackTestDistributor(
          allTestFiles,
          executedTestFiles,
          ciNodeTotal,
        );

        const expectedTestFilesForCiNode0: TestFile[] = [
          { path: 'a.spec.js' },
          { path: 'c.spec.js' },
          { path: 'e.spec.js' },
        ];
        expect(fallbackTestDistributor.testFilesForCiNode(0)).toEqual(
          expectedTestFilesForCiNode0,
        );

        const expectedTestFilesForCiNode1: TestFile[] = [
          { path: 'b.spec.js' },
          { path: 'd.spec.js' },
        ];
        expect(fallbackTestDistributor.testFilesForCiNode(1)).toEqual(
          expectedTestFilesForCiNode1,
        );
      });
    });

    describe('when test files in test suite are not sorted', () => {
      it('returns tests for particular CI node index', () => {
        const allTestFiles: TestFile[] = [
          { path: 'b.spec.js' },
          { path: 'a.spec.js' },
          { path: 'e.spec.js' },
          { path: 'd.spec.js' },
          { path: 'c.spec.js' },
        ];
        const executedTestFiles: TestFile[] = [];
        const ciNodeTotal = 2;

        const fallbackTestDistributor = new FallbackTestDistributor(
          allTestFiles,
          executedTestFiles,
          ciNodeTotal,
        );

        const expectedTestFilesForCiNode0: TestFile[] = [
          { path: 'a.spec.js' },
          { path: 'c.spec.js' },
          { path: 'e.spec.js' },
        ];
        expect(fallbackTestDistributor.testFilesForCiNode(0)).toEqual(
          expectedTestFilesForCiNode0,
        );

        const expectedTestFilesForCiNode1: TestFile[] = [
          { path: 'b.spec.js' },
          { path: 'd.spec.js' },
        ];
        expect(fallbackTestDistributor.testFilesForCiNode(1)).toEqual(
          expectedTestFilesForCiNode1,
        );
      });
    });

    describe('when there are executed test files', () => {
      it('returns tests for particular CI node index without already executed test files', () => {
        const allTestFiles: TestFile[] = [
          { path: 'a.spec.js' },
          { path: 'b.spec.js' },
          { path: 'c.spec.js' },
          { path: 'd.spec.js' },
          { path: 'e.spec.js' },
        ];
        const executedTestFiles: TestFile[] = [
          { path: 'a.spec.js', time_execution: 0.1 },
          { path: 'd.spec.js', time_execution: 0.2 },
          { path: 'e.spec.js', time_execution: 0.3 },
        ];
        const ciNodeTotal = 2;

        const fallbackTestDistributor = new FallbackTestDistributor(
          allTestFiles,
          executedTestFiles,
          ciNodeTotal,
        );

        const expectedTestFilesForCiNode0: TestFile[] = [{ path: 'c.spec.js' }];
        expect(fallbackTestDistributor.testFilesForCiNode(0)).toEqual(
          expectedTestFilesForCiNode0,
        );

        const expectedTestFilesForCiNode1: TestFile[] = [{ path: 'b.spec.js' }];
        expect(fallbackTestDistributor.testFilesForCiNode(1)).toEqual(
          expectedTestFilesForCiNode1,
        );
      });
    });
  });
});
