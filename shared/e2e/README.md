## Notes on the `"copy-packages"` script

[@cypress/code-coverage](https://github.com/cypress-io/code-coverage) requires to use [istanbuljs](https://github.com/istanbuljs/istanbuljs) to instrument sorce code and to report coverage.

The CLI of `istanbul`, [nyc](https://github.com/istanbuljs/nyc) is unable to instrument files outside of the current working directory.

There's a `--cwd` flag, but it doesn't work; and since their last commit was on 9th of April 2021 (more than one year and a half ago) while they do have lots of open issues, I don't even bother to open one at this time.
A naive `cd` with an `npx nyc` doesn't work either.

Since `--cwd` doesn't work and since I want to run the tests once while collecting reports for many packages, I should run the tests from a parent directory of the packages.

Obviously I can't jsut dump the shared tests in the root of the monorepo.
And nesting `/packages` inside a directory with the setup for the shared e2e tests is quite messy.
I prefer to leave`/packages` alone and put the shared e2e tests into an unrelated directory.

To achieve that, we actually test a copy of the source code of the packages to test.

## What happens when you run `"e2e-run"`

- The packages to test are copied in the `shared-e2e` workspace
- The copied source code is instrumented
- The `tsconfig.json` of the demo app is modified to make the demo use the instrumented code
- A development server for the demo app starts
- Tests run && pass with flying colours
- The `tsconfig.json` of the demo app is brought back to reference the actual packages
- A json coverage report is generated [1][2]
- The report is splitted into an `lcov` report for each tested package

[1]: The coverage results from the various packages are merged together in the summary, which becomes meaningless and can't be uploaded to codecov.

[2]: Having this report in different formats or logged in the terminal is redundant, so the default `lcov` reporter used by `@cypress/code-coverage` is overridden in `package.json` with `"nyc": { "reporter": "json" }`.
