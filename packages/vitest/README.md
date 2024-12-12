# ![@knapsack-pro/vitest](./img/logo.png)

<h3 align="center">Speed up your tests</h3>
<p align="center">Run your 1-hour test suite in 2 minutes with optimal parallelisation on your existing CI infrastructure</p>

---

<div align="center">
  <a href="https://circleci.com/gh/KnapsackPro/knapsack-pro-js">
    <img alt="Circle CI" src="https://circleci.com/gh/KnapsackPro/knapsack-pro-js.svg?style=svg" />
  </a>
</div>

<br />
<br />

Knapsack Pro wraps [Vitest](https://vitest.dev/) and works with your existing CI infrastructure to parallelize tests optimally:

- Dynamically splits your tests based on up-to-date test execution data
- Is designed from the ground up for CI and supports all of them
- Tracks your CI builds to detect bottlenecks
- Does not have access to your source code and collects minimal test data
- Enables you to export historical metrics about your CI builds
- Replaces local dependencies like Redis with an API and runs your tests regardless of network problems

## Getting Started

1. Install the package

```
npm install @knapsack-pro/vitest
```

2. Update your CI to use a matrix build. See the [example workflow](.github/workflows/vitest-example-test-suite.yaml) for reference.
3. Replace `vitest` with `@knapsack-pro/vitest` in your CI config
4. Set the `KNAPSACK_PRO_TEST_SUITE_TOKEN` environment variable to your Knapsack Pro test suite token, and optionally set other environemnt variables as needed.

## Environment variables
Below are the primary environment variables you may need to set to use Knapsack Pro with Vitest.  For a full list of environment variables, see [Knapsack Pro Jest](https://docs.knapsackpro.com/jest/reference/#environment-variables).

### `KNAPSACK_PRO_TEST_SUITE_TOKEN` (Required)
The API token you receive when creating a new Test Suite in Knapsack Pro. This authenticates your test suite with our API.

### `KNAPSACK_PRO_TEST_FILE_PATTERN` (Optional)
A glob pattern to specify which test files to run.  If not provided, uses the `vitest` configuration file

### `KNAPSACK_PRO_TEST_FILE_EXCLUDE_PATTERN` (Optional)
A glob pattern to specify which test files to exclude. If not provided, uses the `vitest` configuration file.

### `KNAPSACK_PRO_COVERAGE_DIRECTORY` (Optional)
The directory where coverage reports will be saved. If not provided, uses the `vitest` configuration file.

### `KNAPSACK_PRO_CI_NODE_TOTAL` (Required)
The total number of parallel CI nodes you're running. For example, if you're running tests across 4 machines, this should be set to `4`.

### `KNAPSACK_PRO_CI_NODE_INDEX` (Required)
The index of the current CI node (0-based). For example, if you're running on 4 machines, each machine should have a unique index from `0` to `3`.

### `KNAPSACK_PRO_LOG_LEVEL` (Optional)
Controls the verbosity of logs

## Dependencies

- [@knapsack-pro/core](https://github.com/KnapsackPro/knapsack-pro-js/tree/main/packages/core)

## Contributing

Follow the steps in the [root README.md](https://github.com/KnapsackPro/knapsack-pro-js#contributing) to set up the project.

You can compile TypeScript in watch mode from the root folder with:

```bash
npm start -w packages/vitest
```

### Testing

To test `@knapsack-pro/vitest` against a real test suite we use:

- [vitest-example-test-suite](https://github.com/KnapsackPro/knapsack-pro-js/tree/main/packages/vitest-example-test-suite)

### Publishing

See [Publishing](../../#publishing) in the root README.md.
