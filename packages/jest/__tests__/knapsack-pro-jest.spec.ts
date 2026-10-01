import { describe, it, expect } from 'vitest';
import { join } from 'path';
import { extractFailedSnapshotPaths, normalizePaths } from '../src/utils';

describe('#extractFailedSnapshotPaths', () => {
  it('extracts the path when an obsolete snapshot fails the run', () => {
    const projectPath = join('path', 'to', 'project');
    const filePath = join(projectPath, '__tests__', 'example.test.js');

    const failedPaths = extractFailedSnapshotPaths(
      {
        failure: true,
        uncheckedKeysByFile: [{ filePath }],
      },
      projectPath,
    );

    expect(failedPaths).toEqual(new Set(['__tests__/example.test.js']));
  });

  it('returns no failed paths when snapshots do not fail the run', () => {
    const projectPath = join('path', 'to', 'project');
    const filePath = join(projectPath, '__tests__', 'example.test.js');

    const failedPaths = extractFailedSnapshotPaths(
      {
        failure: false,
        uncheckedKeysByFile: [{ filePath }],
      },
      projectPath,
    );

    expect(failedPaths).toEqual(new Set());
  });
});

describe('#normalizePaths', () => {
  it('concatenates the recorded paths assigning 0 seconds to the scheduled ones', () => {
    const scheduledPaths = [
      'x.spec.js',
      'y.spec.js',
      'z.spec.js',
      'c.spec.js',
      'd.spec.js',
    ];

    const recordedPaths = {
      'c.spec.js': 4,
      'd.spec.js': 3,
    };

    const actual = normalizePaths(scheduledPaths, recordedPaths);
    const expected = {
      'x.spec.js': 0,
      'y.spec.js': 0,
      'z.spec.js': 0,
      'c.spec.js': 4,
      'd.spec.js': 3,
    };

    expect(actual).toEqual(expected);
  });
});
