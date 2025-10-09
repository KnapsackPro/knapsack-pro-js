import { writeFileSync } from 'fs';
import { pathWithRootDir } from './utils.js';
class BatchReporter {
    config;
    tally;
    constructor() {
        this.tally = new Map();
    }
    version() {
        return 'v2';
    }
    printsToStdio() {
        return false;
    }
    onConfigure(config) {
        this.config = config;
    }
    onTestEnd(test, result) {
        if (result.status !== 'passed')
            return;
        const duration = result.duration / 1000;
        const path = pathWithRootDir(test, this.config);
        const current = this.tally.get(path);
        if (current) {
            this.tally.set(path, current + duration);
        }
        else {
            this.tally.set(path, duration);
        }
    }
    onEnd(result) {
        const recordedTestFiles = Array.from(this.tally).map(([path, duration]) => ({
            path,
            time_execution: duration,
        }));
        const res = {
            recordedTestFiles,
            isTestSuiteGreen: result.status === 'passed',
        };
        writeFileSync('.knapsack-pro/batch.json', JSON.stringify(res));
    }
}
export default BatchReporter;
