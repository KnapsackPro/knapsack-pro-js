# Jest example test suite with `@knapsack-pro/jest`

<p align="center">
  <a href="https://knapsackpro.com?utm_source=github&utm_medium=readme&utm_campaign=knapsack-pro-jest-example&utm_content=hero_logo">
    <img alt="Knapsack Pro" src="./.github/assets/knapsack.png" width="300" height="300" style="max-width: 100%;" />
  </a>
</p>

<h3 align="center">Speed up your tests</h3>
<p align="center">Run your 1-hour test suite in 2 minutes with optimal parallelisation on your existing CI infrastructure</p>

---

<div align="center">
  <a href="https://circleci.com/gh/KnapsackPro/knapsack-pro-core-js">
    <img alt="Circle CI" src="https://circleci.com/gh/KnapsackPro/knapsack-pro-core-js.svg?style=svg" />
  </a>

  <a href="https://knapsackpro.com/dashboard/organizations/54/projects/509/test_suites/818/builds">
    <img alt="Knapsack Pro Parallel CI builds for Jest - GitHub Actions" src="https://img.shields.io/badge/Knapsack%20Pro-Parallel%20/%20Jest%20--%20GitHub%20Actions-%230074ff" />
  </a>
</div>

<br />
<br />

Knapsack Pro wraps your [current test runner(s)](https://docs.knapsackpro.com/) and works with your existing CI infrastructure to parallelize tests optimally:

- Dynamically splits your tests based on up-to-date test execution data
- Is designed from the ground up for CI and supports all of them
- Tracks your CI builds to detect bottlenecks
- Does not have access to your source code and collects minimal test data
- Enables you to export historical metrics about your CI builds
- Replaces local dependencies like Redis with an API and runs your tests regardless of network problems

## Installation

See the [docs](https://docs.knapsackpro.com/jest/guide/) to get started:

<div align="center">
  <a href="https://docs.knapsackpro.com/jest/guide/">
    <img alt="Install button" src="./.github/assets/install-button.png" width="116" height="50" />
  </a>
</div>

## Dependencies

- [@knapsack-pro/core](https://github.com/KnapsackPro/knapsack-pro-js/tree/setup/packages/core)
- [@knapsack-pro/jest](https://github.com/KnapsackPro/knapsack-pro-js/tree/setup/packages/jest)

## Development

Follow the steps in the [root README.md](https://github.com/KnapsackPro/knapsack-pro-js#contributing) to set up the project.

## Testing

```
bin/knapsack_pro_jest
```

You can find more example scripts in the [bin](bin) directory.
