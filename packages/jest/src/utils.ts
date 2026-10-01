import { relative } from 'path';

type SnapshotSummary = {
  failure: boolean;
  uncheckedKeysByFile: Array<{ filePath: string }>;
};

export const extractFailedSnapshotPaths = (
  snapshot: SnapshotSummary,
  projectPath: string,
) => {
  const failedPaths: Set<string> = new Set();

  if (snapshot.failure) {
    snapshot.uncheckedKeysByFile.forEach(({ filePath }) => {
      const path =
        process.platform === 'win32'
          ? relative(projectPath, filePath).replace(/\\/g, '/')
          : relative(projectPath, filePath);

      failedPaths.add(path);
    });
  }

  return failedPaths;
};

export const normalizePaths = (
  scheduledPaths: string[],
  recordedPaths: Record<string, number>,
) => {
  return Object.entries(recordedPaths).reduce<Record<string, number>>(
    (acc, [path, time]) => {
      return { ...acc, [path]: (acc[path] ?? 0) + time };
    },
    scheduledPaths.reduce((acc, path) => ({ ...acc, [path]: 0 }), {}),
  );
};
