import { describe, it, expect } from 'vitest';
import { normalizePaths } from '../src/utils';

describe('#normalizePaths', () => {
  it('concatenates the recorded paths assigning 0 seconds to the non-recorded ones', () => {
    const paths = [
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

    const actual = normalizePaths(paths, recordedPaths);
    const expected = {
      'x.spec.js': 0,
      'y.spec.js': 0,
      'z.spec.js': 0,
      'c.spec.js': 4,
      'd.spec.js': 3,
    };

    expect(actual).toEqual(expected);
  });

  it('transforms linePaths to filePaths', () => {
    const paths = [
      'x.spec.js:1',
      'y.spec.js',

    ];

    const recordedPaths = {
      'x.spec.js:1': 4,
      'y.spec.js:1': 3,
    };

    const actual = normalizePaths(paths, recordedPaths);
    const expected = {
      'x.spec.js:1': 4,
      'y.spec.js': 3,
    };

    expect(actual).toEqual(expected);
  });
});
