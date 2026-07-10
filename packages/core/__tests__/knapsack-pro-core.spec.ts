import { describe, it, expect } from 'vitest';
import { updateRecordedTestFiles } from '../src/knapsack-pro-core';
import { TestFile } from '../src/models';

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

    const actual: TestFile[] = updateRecordedTestFiles(
      recordedTestFiles,
      newRecordedPaths,
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
