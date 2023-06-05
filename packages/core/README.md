# @knapsack-pro/core

<p align="center">
  <a href="https://knapsackpro.com?utm_source=github&utm_medium=readme&utm_campaign=knapsack-pro-core&utm_content=hero_logo">
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

## Dependents

- [@knapsack-pro/jest](https://github.com/KnapsackPro/knapsack-pro-js/tree/setup/packages/jest)
- [@knapsack-pro/cypress](https://github.com/KnapsackPro/knapsack-pro-js/tree/setup/packages/cypress)

## Contributing

Follow the steps in the [root README.md](https://github.com/KnapsackPro/knapsack-pro-js#contributing) to set up the project.

You can compile TypeScript in watch mode from the root folder with:

```bash
npm start -w packages/core
```

### Publishing

1. `cd packages/core`

1. Sign in to the npm registry with:

   ```bash
   npm adduser
   ```

1. Before releasing a new version of the package, please update `CHANGELOG.md` with [`github_changelog_generator`](https://github.com/github-changelog-generator/github-changelog-generator):

   ```bash
   gem install github_changelog_generator

   # generate CHANGELOG.md
   github_changelog_generator --user KnapsackPro --project knapsack-pro-js --pr-wo-labels --issues-wo-labels --include-labels @knapsack-pro/core --since-tag @knapsack-pro/core@5.1.0 --exclude-tags-regex "@knapsack-pro\/(jest|cypress)@.*"
   git commit -am "Update CHANGELOG.md"
   git push origin master
   ```

1. If you have added new files to the repository, and they should be part of the released npm package, please ensure they are included in the `files` array in `package.json`.

1. Compile the project:

   ```bash
   npm run build
   ```

1. In order to [bump the version of the package](https://docs.npmjs.com/cli/version) run the command below. It will also create a version commit and tag for the release:

   ```bash
   # Bump patch version 0.0.x
   npm version patch --no-commit-hooks --tag-version-prefix=@knapsack-pro/core@

   # Bump minor version 0.x.0
   npm version minor --no-commit-hooks --tag-version-prefix=@knapsack-pro/core@
   ```

   ```bash
   git commit -am x.x.x
   git tag @knapsack-pro/core@x.x.x
   ```

1. Push the commit and tag:

   ```bash
   git push origin master --tags
   ```

1. When the git tag is on Github, you can update `CHANGELOG.md`:

   ```bash
   github_changelog_generator --user KnapsackPro --project knapsack-pro-js --pr-wo-labels --issues-wo-labels --include-labels @knapsack-pro/core --since-tag @knapsack-pro/core@5.1.0 --exclude-tags-regex "@knapsack-pro\/(jest|cypress)@.*"
   git commit -am "Update CHANGELOG.md"
   git push origin master
   ```

1. Publish the package to the npm registry:

   ```bash
   npm publish
   ```

1. Update:

- [@knapsack-pro/jest](https://github.com/KnapsackPro/knapsack-pro-js/tree/setup/packages/jest)
- [@knapsack-pro/cypress](https://github.com/KnapsackPro/knapsack-pro-js/tree/setup/packages/cypress)
