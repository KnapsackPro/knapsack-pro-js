# Changelog

## Unreleased (minor)

- [Retry only Failures](https://docs.knapsackpro.com/vitest/retry-only-failures/): When you retry one (or all the) nodes, Knapsack Pro only executes the tests that failed last time on that node.
   - Introduces `KNAPSACK_PRO_TEST_QUEUE_ID`, a unique ID that identifies a test queue (Knapsack Pro sets it for you)
     - If you are overriding `KNAPSACK_PRO_BRANCH` to share a test-suite with multiple Knapsack Pro commands (e.g., appending a suffix), you will need to do the same for `KNAPSACK_PRO_TEST_QUEUE_ID` (e.g., on [Buildkite](/packages/core/src/ci-providers/buildkite.ts), use `KNAPSACK_PRO_TEST_QUEUE_ID=$BUILDKITE_BUILD_NUMBER-custom-suffix` to match `KNAPSACK_PRO_BRANCH=$MY_BRANCH-custom-suffix`)
     - Whenever possible, create a separate test-suite on the Knapsack Pro dashboard to avoid the above
   - If you are on CircleCI, you need to expose `CIRCLE_PIPELINE_NUMBER`, see [Retry only Failures](https://docs.knapsackpro.com/vitest/retry-only-failures/)
- Update dependencies (including `typescript`, `glob`, `minimatch`, `uuid`, `@knapsack-pro/core`)


## 0.3.0

- Update dependencies (including `typescript`, `@knapsack-pro/core`)
- (Internal) Import `package.json`

## 0.2.0

- Bump `glob` from `^10.3.4` to `^11.0.3`,
- Bump `minimatch` from `^9.0.3` to `^10.0.3`
- Bump `uuid` from `^9.0.1` to `^13.0.0`
- Bump `typescript` from `^5.7.2` to `^5.9.2`
- Fix parsing of CLI arguments (e.g., `npx vitest --coverage --silent`)
- Pass tests to run as `filters` instead of `cliOptions` with `include:` (`startVitest('test', filters, cliOptions)`); doing the latter resulted in Vitest performing additional work for several minutes when calculating the test summary/coverage at the end of the test run.
- Calculate the file `path` relative to `vitest.config.root` instead of `process.cwd()`; the latter resulted in the wrong file paths with some specific Vitest configurations
- **BREAKING**: Use `.vitest-reports/blob-[NODE_INDEX]-[NODE_TOTAL]-[UUID].json` (generated one per batch) as file name when using the blob and no `outputFile` reporter to allow merging the reports later with `npx vitest --merge-reports`
  - Replace the old behavior that added a UUID to the `reportsDirectory`
  - Remove `KNAPSACK_PRO_COVERAGE_DIRECTORY`
  - **Migration**: Run `npx @knapsack-pro/vitest --reporter=blob ...` and later `npx vitest --merge-reports --coverage ...` as described in [Vitest docs](https://vitest.dev/guide/reporters.html#blob-reporter)

## 0.1.2

- Move the vitest logo to `.github/assets`

## 0.1.1

- Fix broken logo in README

## 0.1.0

- Create Vitest integration
