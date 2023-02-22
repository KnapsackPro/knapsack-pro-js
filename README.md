# Cypress example test suite with `@knapsack-pro/cypress` - KnapsackPro.com

## Dependencies

- [@knapsack-pro/core](https://github.com/KnapsackPro/knapsack-pro-core-js)
- [@knapsack-pro/cypress](https://github.com/KnapsackPro/knapsack-pro-cypress)

## Development

1. Setup [@knapsack-pro/core](https://github.com/KnapsackPro/knapsack-pro-core-js) project.

1. Setup [@knapsack-pro/cypress](https://github.com/KnapsackPro/knapsack-pro-cypress) project.

**Follow below steps or use `bin/setup_development` script.**

1. Install dependencies.

   ```bash
   $ npm install --legacy-peer-deps
   ```

   ```bash
   $(npm bin)/cypress install
   ```

1. Use your local version of `@knapsack-pro/cypress` and `@knapsack-pro/core` registered with node.

   ```bash
   npm link @knapsack-pro/cypress --legacy-peer-deps
   ```

   ```bash
   npm link @knapsack-pro/core --legacy-peer-deps
   ```

## Testing

### When `@knapsack-pro/cypress` was not published to NPM registry yet

Ensure you have a local version of `knapsack-pro/cypress` in `package.json` and run `npm install`:

```
{
  "devDependencies": {
    "@knapsack-pro/cypress": "file:../knapsack-pro-cypress",
  }
}
```

### When `@knapsack-pro/cypress` was already published in NPM registry

Ensure you have the latest version of `@knapsack-pro/cypress` in `package.json` and run `npm install --legacy-peer-deps`:

```
{
  "devDependencies": {
    "@knapsack-pro/cypress": "x.x.x"
  }
}
```

### Run tests with `@knapsack-pro/cypress`

This is useful if you want to run tests in development to test `@knapsack-pro/cypress`.

```bash
bin/knapsack_pro_cypress
```

Run only a small subset of test suite. Useful for a quick testing:

```bash
bin/knapsack_pro_cypress_test_file_pattern
```
