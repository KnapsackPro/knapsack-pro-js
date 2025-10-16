#!/usr/bin/env node
import { readFileSync, mkdirSync } from 'fs';
import { execSync, spawnSync } from 'child_process';
import pkg from '@knapsack-pro/playwright/package.json' with { type: 'json' };
import { KnapsackProCore, KnapsackProLogger, } from '@knapsack-pro/core';
if (process.env.KNAPSACK_PRO_TEST_SUITE_TOKEN_PLAYWRIGHT) {
    process.env.KNAPSACK_PRO_TEST_SUITE_TOKEN =
        process.env.KNAPSACK_PRO_TEST_SUITE_TOKEN_PLAYWRIGHT;
}
async function main() {
    const knapsackProLogger = new KnapsackProLogger();
    knapsackProLogger.debug(`Running ${pkg.name}@${pkg.version}`);
    mkdirSync('.knapsack-pro', { recursive: true });
    const cliArguments = process.argv.slice(2).join(' ');
    knapsackProLogger.debug(`cliArguments: ${cliArguments}`);
    const command = `npx playwright test --list ${cliArguments} --reporter=@knapsack-pro/playwright/reporters/list`;
    knapsackProLogger.debug(`Executing: ${command}`);
    execSync(command, { stdio: 'ignore' });
    const tests = JSON.parse(readFileSync('.knapsack-pro/list.json', 'utf8'));
    knapsackProLogger.debug(`Tests to run: ${tests}`);
    const knapsackPro = new KnapsackProCore(pkg.name, pkg.version, () => tests.map((testFilePath) => ({ path: testFilePath })));
    const onSuccess = async (testFiles) => {
        const paths = testFiles.map((testFile) => testFile.path).join(' ');
        const command = `PWTEST_BLOB_DO_NOT_REMOVE=1 npx playwright test ${cliArguments} ${paths}`;
        knapsackProLogger.debug(`Executing: ${command}`);
        spawnSync(command, { shell: true, stdio: 'inherit' });
        return JSON.parse(readFileSync('.knapsack-pro/batch.json', 'utf8'));
    };
    const onError = () => { };
    knapsackPro.runQueueMode(onSuccess, onError);
}
main();
