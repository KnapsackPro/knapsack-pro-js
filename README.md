# Jest example test suite and KnapsackPro.com

[![CircleCI](https://circleci.com/gh/KnapsackPro/jest-example-test-suite/tree/master.svg?style=svg)](https://circleci.com/gh/KnapsackPro/jest-example-test-suite/tree/master)

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

### Test `@knapsack-pro/jest` from npm registry

Ensure you have in `package.json` the latest version of `@knapsack-pro/jest` and you run `npm install`:

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
