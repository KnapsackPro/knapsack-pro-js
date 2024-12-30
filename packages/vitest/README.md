# @knapsack-pro/vitest

<p align="center">
  <a href="https://knapsackpro.com?utm_source=github&utm_medium=readme&utm_campaign=knapsack-pro-vitest&utm_content=hero_logo">
    <img alt="Knapsack Pro" src="./.github/assets/logo.png" width="100%" style="max-width: 100%;" />
  </a>
</p>

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

## Installation

See the [docs](https://docs.knapsackpro.com/vitest/guide/) to get started:

<div align="center">
  <a href="https://docs.knapsackpro.com/vitest/guide/">
    <img alt="Install button" src="./.github/assets/install-button.png" width="116" height="50" />
  </a>
</div>

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
