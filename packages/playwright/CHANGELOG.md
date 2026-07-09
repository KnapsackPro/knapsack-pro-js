# Changelog

## 0.2.0

- Handle file names with spaces, quotes, and escape regexes (as a side-effect NextJS route groups are also supported now)
- [Retry only Failures](https://docs.knapsackpro.com/playwright/retry-only-failures/): When you retry one (or all the) nodes, Knapsack Pro only executes the tests that failed last time on that node.
   - Introduces `KNAPSACK_PRO_TEST_QUEUE_ID`, a unique ID that identifies a test queue (Knapsack Pro sets it for you)
     - If you are overriding `KNAPSACK_PRO_BRANCH` to share a test-suite with multiple Knapsack Pro commands (e.g., appending a suffix), you will need to do the same for `KNAPSACK_PRO_TEST_QUEUE_ID` (e.g., on [Buildkite](/packages/core/src/ci-providers/buildkite.ts), use `KNAPSACK_PRO_TEST_QUEUE_ID=$BUILDKITE_BUILD_NUMBER-custom-suffix` to match `KNAPSACK_PRO_BRANCH=$MY_BRANCH-custom-suffix`)
     - Whenever possible, create a separate test-suite on the Knapsack Pro dashboard to avoid the above
   - If you are on CircleCI, you need to expose `CIRCLE_PIPELINE_NUMBER`, see [Retry only Failures](https://docs.knapsackpro.com/playwright/retry-only-failures/)
- Update dependencies (including `typescript`, `@knapsack-pro/core`)

## 0.1.1

- Use @knapsack-pro/core@9.0.1

## 0.1.0

- Create Playwright integration
