export const normalizePaths = (
  paths: string[],
  recordedPaths: Record<string, number>,
) => {
  return Object.entries(recordedPaths).reduce<Record<string, number>>(
    (acc, [path, time]) => {
      if (paths.includes(path)) {
        return { ...acc, [path]: (acc[path] ?? 0) + time };
      } else {
        const p = path.replace(/:\d+$/, '');
        return { ...acc, [p]: (acc[p] ?? 0) + time };
      }
    },
    paths.reduce((acc, path) => ({ ...acc, [path]: 0 }), {}),
  );
};
