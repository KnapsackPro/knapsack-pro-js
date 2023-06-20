# Changelog

## 6.1.1

### Patch Changes

- 0de9d1a: Use `KNAPSACK_PRO_FIXED_QUEUE_SPLIT=true` as default value in Queue Mode for GitLab CI

## [@knapsack-pro/core@6.1.0](https://github.com/KnapsackPro/knapsack-pro-js/tree/@knapsack-pro/core@6.1.0) (2023-06-12)

[Full Changelog](https://github.com/KnapsackPro/knapsack-pro-js/compare/@knapsack-pro/core@6.0.0...@knapsack-pro/core@6.1.0)

**Merged pull requests:**

- Mask user seats instead of hashing [\#6](https://github.com/KnapsackPro/knapsack-pro-js/pull/6) ([shadre](https://github.com/shadre))

## [@knapsack-pro/core@6.0.0](https://github.com/KnapsackPro/knapsack-pro-js/tree/@knapsack-pro/core@6.0.0) (2023-06-12)

[Full Changelog](https://github.com/KnapsackPro/knapsack-pro-js/compare/@knapsack-pro/core@5.2.0...@knapsack-pro/core@6.0.0)

**Merged pull requests:**

- \[breaking change\] Use `KNAPSACK_PRO_FIXED_QUEUE_SPLIT=true` as default value in Queue Mode and use `false` for proper CI providers [\#3](https://github.com/KnapsackPro/knapsack-pro-js/pull/3) ([3v0k4](https://github.com/3v0k4))

## [@knapsack-pro/core@5.2.0](https://github.com/KnapsackPro/knapsack-pro-js/tree/@knapsack-pro/core@5.2.0) (2023-06-05)

[Full Changelog](https://github.com/KnapsackPro/knapsack-pro-js/compare/@knapsack-pro/core@5.1.0...@knapsack-pro/core@5.2.0)

**Merged pull requests:**

- Exclude jest|cypress tags in changelogs [\#2](https://github.com/KnapsackPro/knapsack-pro-js/pull/2) ([3v0k4](https://github.com/3v0k4))

## [v5.1.0](https://github.com/KnapsackPro/knapsack-pro-core-js/tree/v5.1.0) (2023-05-23)

[Full Changelog](https://github.com/KnapsackPro/knapsack-pro-core-js/compare/v5.0.0...v5.1.0)

**Implemented enhancements:**

- Add support for CI node retry count on GitHub Actions and Buildkite and don't run tests in Fallback Mode when a retried node can't connect with the API to avoid running a wrong set of tests. [\#68](https://github.com/KnapsackPro/knapsack-pro-core-js/pull/68) ([ArturT](https://github.com/ArturT))

## [v5.0.0](https://github.com/KnapsackPro/knapsack-pro-core-js/tree/v5.0.0) (2023-05-22)

[Full Changelog](https://github.com/KnapsackPro/knapsack-pro-core-js/compare/v4.1.0...v5.0.0)

**Merged pull requests:**

- \[breaking change\] feat: KNAPSACK_PRO_CI_NODE_BUILD_ID required [\#67](https://github.com/KnapsackPro/knapsack-pro-core-js/pull/67) ([3v0k4](https://github.com/3v0k4))

## [v4.1.0](https://github.com/KnapsackPro/knapsack-pro-core-js/tree/v4.1.0) (2023-05-04)

[Full Changelog](https://github.com/KnapsackPro/knapsack-pro-core-js/compare/v4.0.0...v4.1.0)

**Implemented enhancements:**

- Send distinguishable user seat info over to the API [\#65](https://github.com/KnapsackPro/knapsack-pro-core-js/pull/65) ([ArturT](https://github.com/ArturT))

**Merged pull requests:**

- Remove Solano CI support because Solano does not exist anymore [\#66](https://github.com/KnapsackPro/knapsack-pro-core-js/pull/66) ([ArturT](https://github.com/ArturT))

## [v4.0.0](https://github.com/KnapsackPro/knapsack-pro-core-js/tree/v4.0.0) (2023-01-31)

[Full Changelog](https://github.com/KnapsackPro/knapsack-pro-core-js/compare/v3.3.1...v4.0.0)

**Fixed bugs:**

- \[breaking change\] fix\(feature\): When the test file list source file is defined, then don't scan the disk for test files in the default location [\#64](https://github.com/KnapsackPro/knapsack-pro-core-js/pull/64) ([ArturT](https://github.com/ArturT))

## [v3.3.1](https://github.com/KnapsackPro/knapsack-pro-core-js/tree/v3.3.1) (2023-01-30)

[Full Changelog](https://github.com/KnapsackPro/knapsack-pro-core-js/compare/v3.3.0...v3.3.1)

**Merged pull requests:**

- Bump yargs-parser and yargs [\#63](https://github.com/KnapsackPro/knapsack-pro-core-js/pull/63) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump json5 from 1.0.1 to 1.0.2 [\#61](https://github.com/KnapsackPro/knapsack-pro-core-js/pull/61) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump decode-uri-component from 0.2.0 to 0.2.2 [\#60](https://github.com/KnapsackPro/knapsack-pro-core-js/pull/60) ([dependabot[bot]](https://github.com/apps/dependabot))

## [v3.3.0](https://github.com/KnapsackPro/knapsack-pro-core-js/tree/v3.3.0) (2023-01-30)

[Full Changelog](https://github.com/KnapsackPro/knapsack-pro-core-js/compare/v3.2.0...v3.3.0)

**Implemented enhancements:**

- Add support for `KNAPSACK_PRO_TEST_FILE_LIST_SOURCE_FILE` to specify the set of test files to run [\#62](https://github.com/KnapsackPro/knapsack-pro-core-js/pull/62) ([ArturT](https://github.com/ArturT))

## [v3.2.0](https://github.com/KnapsackPro/knapsack-pro-core-js/tree/v3.2.0) (2022-06-08)

[Full Changelog](https://github.com/KnapsackPro/knapsack-pro-core-js/compare/v3.1.1...v3.2.0)

**Merged pull requests:**

- Update dependencies \(security update for axios\), update development setup [\#59](https://github.com/KnapsackPro/knapsack-pro-core-js/pull/59) ([ArturT](https://github.com/ArturT))
- Bump axios from 0.21.1 to 0.21.2 [\#52](https://github.com/KnapsackPro/knapsack-pro-core-js/pull/52) ([dependabot[bot]](https://github.com/apps/dependabot))
- Remove FAQ questions from readme [\#44](https://github.com/KnapsackPro/knapsack-pro-core-js/pull/44) ([ArturT](https://github.com/ArturT))
- Add links to FAQ in the answers [\#43](https://github.com/KnapsackPro/knapsack-pro-core-js/pull/43) ([ArturT](https://github.com/ArturT))

## [v3.1.1](https://github.com/KnapsackPro/knapsack-pro-core-js/tree/v3.1.1) (2021-01-07)

[Full Changelog](https://github.com/KnapsackPro/knapsack-pro-core-js/compare/v3.1.0...v3.1.1)

**Merged pull requests:**

- Update axios-retry from 3.1.2 to 3.1.9 [\#40](https://github.com/KnapsackPro/knapsack-pro-core-js/pull/40) ([ArturT](https://github.com/ArturT))
- Bump axios from 0.18.1 to 0.21.1 [\#39](https://github.com/KnapsackPro/knapsack-pro-core-js/pull/39) ([haines](https://github.com/haines))
- Bump node-notifier from 8.0.0 to 8.0.1 [\#37](https://github.com/KnapsackPro/knapsack-pro-core-js/pull/37) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump ini from 1.3.5 to 1.3.7 [\#36](https://github.com/KnapsackPro/knapsack-pro-core-js/pull/36) ([dependabot[bot]](https://github.com/apps/dependabot))

## [v3.1.0](https://github.com/KnapsackPro/knapsack-pro-core-js/tree/v3.1.0) (2020-11-28)

[Full Changelog](https://github.com/KnapsackPro/knapsack-pro-core-js/compare/v3.0.1...v3.1.0)

**Implemented enhancements:**

- Add support for an attempt to connect to existing Queue on API side to reduce slow requests number [\#35](https://github.com/KnapsackPro/knapsack-pro-core-js/pull/35) ([ArturT](https://github.com/ArturT))

## [v3.0.1](https://github.com/KnapsackPro/knapsack-pro-core-js/tree/v3.0.1) (2020-09-18)

[Full Changelog](https://github.com/KnapsackPro/knapsack-pro-core-js/compare/v3.0.0...v3.0.1)

**Implemented enhancements:**

- When Knapsack Pro API returns expected errors then the CI node should fail and show an error from API response. Fix the problem with retrying failed request 3 times [\#34](https://github.com/KnapsackPro/knapsack-pro-core-js/pull/34) ([ArturT](https://github.com/ArturT))

## [v3.0.0](https://github.com/KnapsackPro/knapsack-pro-core-js/tree/v3.0.0) (2020-08-20)

[Full Changelog](https://github.com/KnapsackPro/knapsack-pro-core-js/compare/v2.0.0...v3.0.0)

**Merged pull requests:**

- Update packages like babel, typescript, jest, del, gulp, ts-lint, winston [\#33](https://github.com/KnapsackPro/knapsack-pro-core-js/pull/33) ([ArturT](https://github.com/ArturT))
- Update formatting configs [\#32](https://github.com/KnapsackPro/knapsack-pro-core-js/pull/32) ([ArturT](https://github.com/ArturT))
- Use Node 12.18.3 LTS in development and update README requirements [\#30](https://github.com/KnapsackPro/knapsack-pro-core-js/pull/30) ([ArturT](https://github.com/ArturT))
- Bump lodash from 4.17.15 to 4.17.19 [\#29](https://github.com/KnapsackPro/knapsack-pro-core-js/pull/29) ([dependabot[bot]](https://github.com/apps/dependabot))

## [v2.0.0](https://github.com/KnapsackPro/knapsack-pro-core-js/tree/v2.0.0) (2020-06-27)

[Full Changelog](https://github.com/KnapsackPro/knapsack-pro-core-js/compare/v1.7.0...v2.0.0)

**Implemented enhancements:**

- \[breaking change\] Add support for CI build ID for Github Actions - read PR description how to migrate for Github Actions [\#28](https://github.com/KnapsackPro/knapsack-pro-core-js/pull/28) ([ArturT](https://github.com/ArturT))

**Merged pull requests:**

- Bump handlebars from 4.1.2 to 4.5.3 [\#26](https://github.com/KnapsackPro/knapsack-pro-core-js/pull/26) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump lodash.merge from 4.6.1 to 4.6.2 [\#23](https://github.com/KnapsackPro/knapsack-pro-core-js/pull/23) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump mixin-deep from 1.3.1 to 1.3.2 [\#22](https://github.com/KnapsackPro/knapsack-pro-core-js/pull/22) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump extend from 3.0.1 to 3.0.2 [\#21](https://github.com/KnapsackPro/knapsack-pro-core-js/pull/21) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump eslint-utils from 1.3.1 to 1.4.3 [\#20](https://github.com/KnapsackPro/knapsack-pro-core-js/pull/20) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump lodash from 4.17.11 to 4.17.15 [\#19](https://github.com/KnapsackPro/knapsack-pro-core-js/pull/19) ([dependabot[bot]](https://github.com/apps/dependabot))

## [v1.7.0](https://github.com/KnapsackPro/knapsack-pro-core-js/tree/v1.7.0) (2020-05-20)

[Full Changelog](https://github.com/KnapsackPro/knapsack-pro-core-js/compare/v1.6.2...v1.7.0)

**Implemented enhancements:**

- Increase retry delay between requests from 2s to 8s [\#27](https://github.com/KnapsackPro/knapsack-pro-core-js/pull/27) ([ArturT](https://github.com/ArturT))

## [v1.6.2](https://github.com/KnapsackPro/knapsack-pro-core-js/tree/v1.6.2) (2019-12-05)

[Full Changelog](https://github.com/KnapsackPro/knapsack-pro-core-js/compare/v1.6.1...v1.6.2)

**Fixed bugs:**

- More explicit message about KNAPSACK_PRO_CI_NODE_BUILD_ID must be the same on all parallel nodes [\#25](https://github.com/KnapsackPro/knapsack-pro-core-js/pull/25) ([ArturT](https://github.com/ArturT))

## [v1.6.1](https://github.com/KnapsackPro/knapsack-pro-core-js/tree/v1.6.1) (2019-11-04)

[Full Changelog](https://github.com/KnapsackPro/knapsack-pro-core-js/compare/v1.6.0...v1.6.1)

**Merged pull requests:**

- Bump axios from 0.18.0 to 0.18.1 [\#18](https://github.com/KnapsackPro/knapsack-pro-core-js/pull/18) ([dependabot[bot]](https://github.com/apps/dependabot))

## [v1.6.0](https://github.com/KnapsackPro/knapsack-pro-core-js/tree/v1.6.0) (2019-10-11)

[Full Changelog](https://github.com/KnapsackPro/knapsack-pro-core-js/compare/v1.5.0...v1.6.0)

**Implemented enhancements:**

- Add support for Codefresh.io CI provider [\#17](https://github.com/KnapsackPro/knapsack-pro-core-js/pull/17) ([ArturT](https://github.com/ArturT))

## [v1.5.0](https://github.com/KnapsackPro/knapsack-pro-core-js/tree/v1.5.0) (2019-09-14)

[Full Changelog](https://github.com/KnapsackPro/knapsack-pro-core-js/compare/v1.4.1...v1.5.0)

**Implemented enhancements:**

- Add support for GitHub Actions [\#16](https://github.com/KnapsackPro/knapsack-pro-core-js/pull/16) ([ArturT](https://github.com/ArturT))

## [v1.4.1](https://github.com/KnapsackPro/knapsack-pro-core-js/tree/v1.4.1) (2019-09-04)

[Full Changelog](https://github.com/KnapsackPro/knapsack-pro-core-js/compare/v1.4.0...v1.4.1)

**Fixed bugs:**

- Fix not working Fallback Mode when using axios 0.19.0 [\#15](https://github.com/KnapsackPro/knapsack-pro-core-js/pull/15) ([ArturT](https://github.com/ArturT))

## [v1.4.0](https://github.com/KnapsackPro/knapsack-pro-core-js/tree/v1.4.0) (2019-08-23)

[Full Changelog](https://github.com/KnapsackPro/knapsack-pro-core-js/compare/v1.3.1...v1.4.0)

**Implemented enhancements:**

- Add support for job index and job count for parallelism in Semaphore 2.0 [\#14](https://github.com/KnapsackPro/knapsack-pro-core-js/pull/14) ([ArturT](https://github.com/ArturT))

## [v1.3.1](https://github.com/KnapsackPro/knapsack-pro-core-js/tree/v1.3.1) (2019-07-06)

[Full Changelog](https://github.com/KnapsackPro/knapsack-pro-core-js/compare/v1.3.0...v1.3.1)

**Fixed bugs:**

- Fix GitLab CI environment variables integration [\#13](https://github.com/KnapsackPro/knapsack-pro-core-js/pull/13) ([ArturT](https://github.com/ArturT))

## [v1.3.0](https://github.com/KnapsackPro/knapsack-pro-core-js/tree/v1.3.0) (2019-04-14)

[Full Changelog](https://github.com/KnapsackPro/knapsack-pro-core-js/compare/v1.2.0...v1.3.0)

**Implemented enhancements:**

- Reduce data transfer and speed up usage of Knapsack Pro API for Queue Mode [\#12](https://github.com/KnapsackPro/knapsack-pro-core-js/pull/12) ([ArturT](https://github.com/ArturT))

## [v1.2.0](https://github.com/KnapsackPro/knapsack-pro-core-js/tree/v1.2.0) (2019-03-15)

[Full Changelog](https://github.com/KnapsackPro/knapsack-pro-core-js/compare/v1.1.0...v1.2.0)

**Implemented enhancements:**

- Add support for Semaphore CI 2.0 [\#11](https://github.com/KnapsackPro/knapsack-pro-core-js/pull/11) ([ArturT](https://github.com/ArturT))

## [v1.1.0](https://github.com/KnapsackPro/knapsack-pro-core-js/tree/v1.1.0) (2019-03-07)

[Full Changelog](https://github.com/KnapsackPro/knapsack-pro-core-js/compare/v1.0.1...v1.1.0)

**Implemented enhancements:**

- Export Knapsack Pro Logger [\#10](https://github.com/KnapsackPro/knapsack-pro-core-js/pull/10) ([ArturT](https://github.com/ArturT))

**Merged pull requests:**

- Update package dev dependencies [\#9](https://github.com/KnapsackPro/knapsack-pro-core-js/pull/9) ([rafaltrzop](https://github.com/rafaltrzop))

## [v1.0.1](https://github.com/KnapsackPro/knapsack-pro-core-js/tree/v1.0.1) (2018-12-29)

[Full Changelog](https://github.com/KnapsackPro/knapsack-pro-core-js/compare/v1.0.0...v1.0.1)

## [v1.0.0](https://github.com/KnapsackPro/knapsack-pro-core-js/tree/v1.0.0) (2018-12-29)

[Full Changelog](https://github.com/KnapsackPro/knapsack-pro-core-js/compare/v0.3.0...v1.0.0)

**Implemented enhancements:**

- Add fallback mode to run tests when API is not available [\#8](https://github.com/KnapsackPro/knapsack-pro-core-js/pull/8) ([ArturT](https://github.com/ArturT))
- Add logger [\#6](https://github.com/KnapsackPro/knapsack-pro-core-js/pull/6) ([ArturT](https://github.com/ArturT))
- Retry failed request to Knapsack Pro API [\#5](https://github.com/KnapsackPro/knapsack-pro-core-js/pull/5) ([ArturT](https://github.com/ArturT))

**Merged pull requests:**

- Add Prettier and configure TSLint [\#7](https://github.com/KnapsackPro/knapsack-pro-core-js/pull/7) ([rafaltrzop](https://github.com/rafaltrzop))

## [v0.3.0](https://github.com/KnapsackPro/knapsack-pro-core-js/tree/v0.3.0) (2018-11-15)

[Full Changelog](https://github.com/KnapsackPro/knapsack-pro-core-js/compare/v0.2.1...v0.3.0)

**Implemented enhancements:**

- Add support for GitLab \>= 11.5 env variables [\#4](https://github.com/KnapsackPro/knapsack-pro-core-js/pull/4) ([ArturT](https://github.com/ArturT))

## [v0.2.1](https://github.com/KnapsackPro/knapsack-pro-core-js/tree/v0.2.1) (2018-10-22)

[Full Changelog](https://github.com/KnapsackPro/knapsack-pro-core-js/compare/v0.2.0...v0.2.1)

**Fixed bugs:**

- Fix security vulnerability with npm audit fix [\#2](https://github.com/KnapsackPro/knapsack-pro-core-js/pull/2) ([ArturT](https://github.com/ArturT))
- Fix default Knapsack Pro API endpoint url to production [\#1](https://github.com/KnapsackPro/knapsack-pro-core-js/pull/1) ([ArturT](https://github.com/ArturT))

## [v0.2.0](https://github.com/KnapsackPro/knapsack-pro-core-js/tree/v0.2.0) (2018-09-15)

[Full Changelog](https://github.com/KnapsackPro/knapsack-pro-core-js/compare/v0.1.1...v0.2.0)

## [v0.1.1](https://github.com/KnapsackPro/knapsack-pro-core-js/tree/v0.1.1) (2018-09-14)

[Full Changelog](https://github.com/KnapsackPro/knapsack-pro-core-js/compare/2b61b43cfe89059e8ac93eaebffc7918989c09af...v0.1.1)
