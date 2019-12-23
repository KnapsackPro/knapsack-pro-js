# Jest example test suite and KnapsackPro.com

[![CircleCI](https://circleci.com/gh/KnapsackPro/jest-example-test-suite/tree/master.svg?style=svg)](https://circleci.com/gh/KnapsackPro/jest-example-test-suite/tree/master)
[![Knapsack Pro Parallel CI builds for Jest - GitHub Actions](https://img.shields.io/badge/Knapsack%20Pro-Parallel%20/%20Jest%20--%20GitHub%20Actions-%230074ff)](https://knapsackpro.com/dashboard/organizations/54/projects/509/test_suites/818/builds)

## Dependencies

- [@knapsack-pro/core](https://github.com/KnapsackPro/knapsack-pro-core-js)
- [@knapsack-pro/jest](https://github.com/KnapsackPro/knapsack-pro-jest)

## Development

1. Setup [@knapsack-pro/core](https://github.com/KnapsackPro/knapsack-pro-core-js) project.

2. Setup [@knapsack-pro/jest](https://github.com/KnapsackPro/knapsack-pro-jest) project.

3. Install dependencies.

   ```
   $ npm install
   ```

4. Use your local version of `@knapsack-pro/jest` and `@knapsack-pro/core` registered with node.

   ```
   $ npm link @knapsack-pro/jest
   $ npm link @knapsack-pro/core
   ```

## Testing

### When `@knapsack-pro/jest` was not yet published to npm registry

Ensure you have in `package.json` local version of `knapsack-pro/jest` and run `npm install`:

```
{
  "devDependencies": {
    "@knapsack-pro/jest": "file:../knapsack-pro-jest",
  }
}
```

### When `@knapsack-pro/jest` was already published in npm registry

Note if you do this step for the very first time you need to remove `package-lock.json` in order to generate a fresh one instead of using what was generated in `package-lock.json` when you were using the local version of `@knapsack-pro/jest`.

Ensure you have in `package.json` the latest version of `@knapsack-pro/jest` and run `npm install`:

```
{
  "devDependencies": {
    "@knapsack-pro/jest": "x.x.x"
  }
}
```

### Run tests with `@knapsack-pro/jest`

This is useful if you want to run tests in development to test `@knapsack-pro/jest`.

```
$ bin/knapsack_pro_jest
```
