export const normalizePaths = (
  defaultPaths: string[],
  recordedPaths: Record<string, number>,
) => {
  return Object.entries(recordedPaths).reduce<Record<string, number>>(
    (acc, [path, time]) => {
      return { ...acc, [path]: (acc[path] ?? 0) + time };
    },
    defaultPaths.reduce((acc, path) => ({ ...acc, [path]: 0 }), {}),
  );
};
