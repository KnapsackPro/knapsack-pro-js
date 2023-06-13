# Knapsack Pro JS

<p align="center">
  <a href="https://knapsackpro.com?utm_source=github&utm_medium=readme&utm_campaign=knapsack-pro-js&utm_content=hero_logo">
    <img alt="Knapsack Pro" src="./.github/assets/knapsack.png" width="300" height="300" style="max-width: 100%;" />
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

Knapsack Pro wraps your [current test runner(s)](https://docs.knapsackpro.com/) and works with your existing CI infrastructure to parallelize tests optimally:

- Dynamically splits your tests based on up-to-date test execution data
- Is designed from the ground up for CI and supports all of them
- Tracks your CI builds to detect bottlenecks
- Does not have access to your source code and collects minimal test data
- Enables you to export historical metrics about your CI builds
- Replaces local dependencies like Redis with an API and runs your tests regardless of network problems

## Installation

See the [docs](https://docs.knapsackpro.com/) to get started:

<div align="center">
  <a href="https://docs.knapsackpro.com/">
    <img alt="Install button" src="./.github/assets/install-button.png" width="116" height="50" />
  </a>
</div>

## Contributing

### Requirements

```
>= Node 18.13.0 LTS
```

You can use [NVM](https://github.com/nvm-sh/nvm) to manage Node versions in development.

### Setup

```bash
npm install
npm run build
# Need a second install to run:
#   - npx @knapsack-pro/jest
#   - npx @knapsack-pro/cypress
# See https://github.com/npm/cli/issues/4591#issuecomment-1111557730
npm install
```

### Testing

```
npm run test:core:coverage
npm run test:jest
npm run test:cypress
```

You can find more example scripts in the nested `packages/`.

### IDE (VSCode)

Install the following plugins:

- [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [EditorConfig for VS Code](https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig)

In `File > Preferences > Settings > Text Editor > Formatting`, enable the `Format On Save` checkbox.

## Packages

Read the READMEs inside the nested `packages/`:

- [core](https://github.com/KnapsackPro/knapsack-pro-js/tree/main/packages/core)
- [jest](https://github.com/KnapsackPro/knapsack-pro-js/tree/main/packages/jest)
- [cypress](https://github.com/KnapsackPro/knapsack-pro-js/tree/main/packages/cypress)
- [jest-example-test-suite](https://github.com/KnapsackPro/knapsack-pro-js/tree/main/packages/jest-example-test-suite)
- [cypress-example-test-suite](https://github.com/KnapsackPro/knapsack-pro-js/tree/main/packages/cypress-example-test-suite)

## Legacy Repositories

Before merging the Knapsack Pro packages into this monorepo, each one was hosted in a separate repository:

- [core](https://github.com/KnapsackPro/knapsack-pro-core-js)
- [jest](https://github.com/KnapsackPro/knapsack-pro-jest)
- [cypress](https://github.com/KnapsackPro/knapsack-pro-cypress)
- [jest-example-test-suite](https://github.com/KnapsackPro/jest-example-test-suite)
- [cypress-example-test-suite](https://github.com/KnapsackPro/cypress-example-test-suite)
