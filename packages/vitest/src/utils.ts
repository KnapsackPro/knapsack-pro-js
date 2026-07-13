export const normalizePaths = (
  scheduledPaths: string[],
  recordedPaths: Record<string, number>,
) => {
  return Object.entries(recordedPaths).reduce<Record<string, number>>(
    (acc, [path, time]) => {
      if (scheduledPaths.includes(path)) {
        return { ...acc, [path]: (acc[path] ?? 0) + time };
      } else {
        const filePath = path.replace(/:\d+$/, '');
        return { ...acc, [filePath]: (acc[filePath] ?? 0) + time };
      }
    },
    scheduledPaths.reduce((acc, path) => ({ ...acc, [path]: 0 }), {}),
  );
};
