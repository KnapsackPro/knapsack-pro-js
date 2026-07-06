import { describe, it, expect } from 'vitest';
import { PathsFinder } from '../src/paths-finder';

describe('PathsFinder', () => {
  describe('.pathsFromSourceFile', () => {
    describe('when a file with the list of test files is not defined', () => {
      it('returns null', () => {
        expect(PathsFinder.pathsFromSourceFile()).toEqual(null);
      });
    });

    describe('when a file with the list of test files is defined', () => {
      describe('when a file with the list of test files has an invalid path', () => {
        it('throws an exception', () => {
          process.env.KNAPSACK_PRO_TEST_FILE_LIST_SOURCE_FILE =
            '__tests__/fixtures/fake_test_file_list_source_file.txt';

          expect(() => {
            PathsFinder.pathsFromSourceFile();
          }).toThrow(/^ENOENT: no such file or directory/);
        });
      });

      describe('when a file with the list of test files has a valid path', () => {
        it('returns test files and skips blank lines', () => {
          process.env.KNAPSACK_PRO_TEST_FILE_LIST_SOURCE_FILE =
            '__tests__/fixtures/test_file_list_source_file.txt';

          expect(PathsFinder.pathsFromSourceFile()).toMatchObject([
            '__tests__/a.test.js',
            '__tests__/directory/b.test.js',
            '__tests__/c.test.js',
          ]);
        });
      });
    });
  });
});
