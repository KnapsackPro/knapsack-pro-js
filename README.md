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
npm run test:cra
```

You can find more example scripts in the nested `packages/`.

### IDE (VSCode)

Install the following plugins:

- [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [EditorConfig for VS Code](https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig)

In `File > Preferences > Settings > Text Editor > Formatting`, enable the `Format On Save` checkbox.

### Publishing

We use [`changesets`](https://github.com/changesets/changesets), which means:

- you need to add a changeset (`npx changeset`) to any changes that should bump a version (and appear in the CHANGELOG.md)
- a [bot](https://github.com/apps/changeset-bot) checks that PRs contain a changeset
- the [changesets GitHub Action](https://github.com/changesets/action) creates a pull request that applies all the changesets

In the future, we should look into [`npx changeset publish`](https://github.com/changesets/changesets/blob/main/packages/cli/README.md#publish) to automate further.

#### 1. Update `@knapsack-pro/core` in `@knapsack-pro/jest` or `@knapsack-pro/cypress` locally

If `@knapsack-pro/core` is already published to npm, you can follow these steps to update `@knapsack-pro/core` in `@knapsack-pro/jest` or `@knapsack-pro/cypress` locally.

However, next time, try to update `@knapsack-pro/core` in `@knapsack-pro/jest` or `@knapsack-pro/cypress` in the same PR that introduces the changes to `@knapsack-pro/core`, so that you can follow the easier [Publish via Changesets PR](#2-publish-via-changesets-pr).

From the root folder of the repository (replace `jest` with `cypress` if needed):

```bash
npm install @knapsack-pro/core -w packages/jest
npx changeset
# Update @knapsack-pro/core to x.x.x

git add --all
git commit -m "deps(jest): update @knapsack-pro/core"

npx changeset version
npm install # update @knapsack-pro/jest version in package-lock.json (bug in npm?)
git commit -am @knapsack-pro/jest@x.x.x
git tag @knapsack-pro/jest@x.x.x

npm install -D @knapsack-pro/jest -w packages/jest-example-test-suite
npm run test:jest
git commit -am "deps(jest-example): update @knapsack-pro/jest"

git push origin main --tags

cd packages/jest
npm run build
npm adduser # sign in to npm
npm publish
```

Remember to update `TestSuiteClientVersionChecker` in the Knapsack Pro API repository.

#### 2. Publish via Changesets PR

1. Merge the PR created by the `changesets` GitHub Action

1. If you have added new files to the repository, and they should be part of the released npm package, please ensure they are included in the `files` array in `package.json`

1. From the root folder of the repository (replace `core` with `jest` or `cypress` if needed):

   ```bash
   git pull

   npm install # update @knapsack-pro/core version in package-lock.json (bug in npm?)
   git commit -am "chore: update package-lock.json"

   git tag @knapsack-pro/core@x.x.x
   git push origin main --tags

   cd packages/core
   npm run build
   npm adduser # sign in to npm
   npm publish
   ```

1. Remember to update:

   - [@knapsack-pro/jest](https://github.com/KnapsackPro/knapsack-pro-js/tree/main/packages/jest)
   - [jest-example-test-suite](https://github.com/KnapsackPro/knapsack-pro-js/tree/main/packages/jest-example-test-suite)
   - [@knapsack-pro/cypress](https://github.com/KnapsackPro/knapsack-pro-js/tree/main/packages/cypress)
   - [cypress-example-test-suite](https://github.com/KnapsackPro/knapsack-pro-js/tree/main/packages/cypress-example-test-suite)
   - [create-react-app-example](https://github.com/KnapsackPro/knapsack-pro-js/tree/main/packages/create-react-app-example)
   - `TestSuiteClientVersionChecker` for the Knapsack Pro API repository.

## Packages

Read the READMEs inside the nested `packages/`:

- [core](https://github.com/KnapsackPro/knapsack-pro-js/tree/main/packages/core)
- [jest](https://github.com/KnapsackPro/knapsack-pro-js/tree/main/packages/jest)
- [cypress](https://github.com/KnapsackPro/knapsack-pro-js/tree/main/packages/cypress)
- [jest-example-test-suite](https://github.com/KnapsackPro/knapsack-pro-js/tree/main/packages/jest-example-test-suite)
- [cypress-example-test-suite](https://github.com/KnapsackPro/knapsack-pro-js/tree/main/packages/cypress-example-test-suite)
- [create-react-app-example](https://github.com/KnapsackPro/knapsack-pro-js/tree/main/packages/create-react-app-example)

## Legacy Repositories

Before merging the Knapsack Pro packages into this monorepo, each one was hosted in a separate repository:

- [core](https://github.com/KnapsackPro/knapsack-pro-core-js)
- [jest](https://github.com/KnapsackPro/knapsack-pro-jest)
- [cypress](https://github.com/KnapsackPro/knapsack-pro-cypress)
- [jest-example-test-suite](https://github.com/KnapsackPro/jest-example-test-suite)
- [cypress-example-test-suite](https://github.com/KnapsackPro/cypress-example-test-suite)
