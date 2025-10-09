#!/usr/bin/env node
import { readFileSync, mkdirSync } from 'fs';
import { execSync, spawnSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { KnapsackProCore, KnapsackProLogger, } from '@knapsack-pro/core';
if (process.env.KNAPSACK_PRO_TEST_SUITE_TOKEN_PLAYWRIGHT) {
    process.env.KNAPSACK_PRO_TEST_SUITE_TOKEN =
        process.env.KNAPSACK_PRO_TEST_SUITE_TOKEN_PLAYWRIGHT;
}
async function main() {
    mkdirSync('.knapsack-pro', { recursive: true });
    const knapsackProLogger = new KnapsackProLogger();
    const cliArguments = process.argv.slice(2).join(' ');
    knapsackProLogger.debug(`cliArguments: ${cliArguments}`);
    const command = `npx playwright test --list ${cliArguments} --reporter=@knapsack-pro/playwright/reporters/list`;
    knapsackProLogger.debug(`Executing: ${command}`);
    const stdout = execSync(command, { stdio: ['ignore', 'pipe', 'ignore'] });
    const tests = JSON.parse(String(stdout));
    knapsackProLogger.debug(`Tests to run: ${tests}`);
    const filePath = fileURLToPath(import.meta.url);
    const dirName = dirname(filePath);
    const pkg = JSON.parse(readFileSync(join(dirName, '..', 'package.json'), 'utf8'));
    knapsackProLogger.debug(`Running ${pkg.name}@${pkg.version}`);
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
