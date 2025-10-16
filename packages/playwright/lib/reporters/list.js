import { writeFileSync } from 'fs';
import { pathWithRootDir } from './utils.js';
class ListReporter {
    config;
    version() {
        return 'v2';
    }
    printsToStdio() {
        return true;
    }
    onConfigure(config) {
        this.config = config;
    }
    onBegin(suite) {
        const paths = new Set();
        suite
            .allTests()
            .forEach((test) => paths.add(pathWithRootDir(test, this.config)));
        writeFileSync('.knapsack-pro/list.json', JSON.stringify(Array.from(paths)));
    }
}
export default ListReporter;
