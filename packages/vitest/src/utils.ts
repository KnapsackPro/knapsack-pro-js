import type { Vitest } from 'vitest/node';

// Bounds `vitest.close()` to `timeoutMs`, since queue mode never goes through the
// Vitest CLI's own `ctx.exit()` safety net. Doesn't reuse `Vitest#exit()` directly:
// its timer is never cleared, so reusing it once per batch could fire mid a later,
// unrelated batch. This clears its timer either way.
export const closeWithTimeout = async (
  vitest: Vitest,
  timeoutMs: number,
): Promise<{ timedOut: boolean }> => {
  let timedOut = false;
  let timer: ReturnType<typeof setTimeout>;

  await Promise.race([
    // Avoid an unhandled rejection if close() rejects after losing the race.
    vitest.close().catch(() => {}),
    new Promise<void>((resolve) => {
      timer = setTimeout(() => {
        timedOut = true;
        resolve();
      }, timeoutMs);
    }),
  ]);

  clearTimeout(timer!);

  return { timedOut };
};

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
