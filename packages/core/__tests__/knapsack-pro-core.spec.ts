import { describe, it, expect } from 'vitest';
import { updateRecordedTestFiles } from '../src/knapsack-pro-core';
import { TestFile } from '../src/models';

describe('#updateRecordedTestFiles', () => {
  it('concatenates the recorded test files assigning 0 seconds to the ones that were scheduled but not recorded', () => {
    const recordedTestFiles: TestFile[] = [
      { path: 'a.spec.js', time_execution: 2 },
      { path: 'b.spec.js', time_execution: 1 },
    ];

    const newRecordedTestFiles: TestFile[] = [
      { path: 'c.spec.js', time_execution: 4 },
      { path: 'd.spec.js', time_execution: 3 },
    ];

    const scheduledPaths = [
      'x.spec.js',
      'y.spec.js',
      'z.spec.js',
      'c.spec.js',
      'd.spec.js',
    ];

    const actual: TestFile[] = updateRecordedTestFiles(
      recordedTestFiles,
      newRecordedTestFiles,
      scheduledPaths,
    );
    const expected: TestFile[] = [
      { path: 'a.spec.js', time_execution: 2 },
      { path: 'b.spec.js', time_execution: 1 },
      { path: 'x.spec.js', time_execution: 0 },
      { path: 'y.spec.js', time_execution: 0 },
      { path: 'z.spec.js', time_execution: 0 },
      { path: 'c.spec.js', time_execution: 4 },
      { path: 'd.spec.js', time_execution: 3 },
    ];

    expect(actual).toEqual(expected);
  });
});

describe('#updateRecordedTestFiles', () => {
  it('concatenates the recorded paths', () => {
    const recordedTestFiles: TestFile[] = [
      { path: 'a.spec.js', time_execution: 2 },
      { path: 'b.spec.js', time_execution: 1 },
    ];

    const newRecordedPaths = {
      'c.spec.js': 4,
      'd.spec.js': 3,
    };

    const scheduledPaths = [
      'x.spec.js',
      'y.spec.js',
      'z.spec.js',
      'c.spec.js',
      'd.spec.js',
    ];

    const actual: TestFile[] = updateRecordedTestFiles(
      recordedTestFiles,
      newRecordedPaths,
      scheduledPaths,
    );
    const expected: TestFile[] = [
      { path: 'a.spec.js', time_execution: 2 },
      { path: 'b.spec.js', time_execution: 1 },
      { path: 'c.spec.js', time_execution: 4 },
      { path: 'd.spec.js', time_execution: 3 },
    ];

    expect(actual).toEqual(expected);
  });
});
