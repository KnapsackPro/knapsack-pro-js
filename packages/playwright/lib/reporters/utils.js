import { relative, basename, join } from 'path';
export const pathWithRootDir = (test, config) => {
    const relativeFile = relative(config.rootDir, test.location.file);
    return join(basename(config.rootDir), relativeFile);
};
