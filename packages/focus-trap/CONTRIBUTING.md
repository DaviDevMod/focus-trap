## Setup

[@davidevmod/focus-trap](https://github.com/DaviDevMod/focus-trap/tree/main/packages/focus-trap) lives in a monorepo that includes an interactive [demo](https://github.com/DaviDevMod/focus-trap/tree/main/apps/demo) app used to e2e test the package.

To contribute to [the monorepo](https://github.com/DaviDevMod/focus-trap), make a fork and clone it to your local machine.

The monorepo uses [yarn berry](https://github.com/yarnpkg/berry) [workspaces](https://yarnpkg.com/features/workspaces).

To install the project's dependencies you will need to enable [corepack](https://yarnpkg.com/getting-started/install) first:

```bash
corepack enable
yarn install
```

## Running the demo

You can start a server on http://localhost:3000 with:

```bash
yarn workspace demo dev
```

Changes to both _@davidevmod/focus-trap_ and the _demo_ will be hot-reloaded.

## Running tests

To run all of the tests to completion:

```bash
yarn workspace @davidevmod/focus-trap e2e-run-headed
```

You may also run them headlessly (though they [may happen to fail](https://www.cypress.io/blog/2019/01/22/when-can-the-test-click/)):

```bash
yarn workspace @davidevmod/focus-trap e2e-run
```

Or you if want to select a particular test and get a closer look at it:

```bash
yarn workspace @davidevmod/focus-trap e2e-open
```

This last option is especially useful when editing tests.  
Changes to the [tests](https://github.com/DaviDevMod/focus-trap/tree/main/packages/focus-trap/cypress) will be hot-reloaded.  
However changes to _@davidevmod/focus-trap_ would not be reflected in the running server, because tests do not use its source code directly (an instrumentation step takes place, allowing for tracking code coverage).  
To address the issue, another command is made available:

```bash
yarn workspace @davidevmod/focus-trap e2e-open-no-instrument
```

Which comes with hot-reload for both the tests and the package source code, with the shortcoming of being unable to provide coverage reports.

## Contributing to _@davidevmod/focus-trap_

To get an overview of the package and how it works, read the the [README.md](https://github.com/DaviDevMod/focus-trap/blob/main/packages/focus-trap/README.md) and check out the [how-it-works.md](https://github.com/DaviDevMod/focus-trap/blob/main/packages/focus-trap/how-it-works.md)

#### Did you find a bug or want to propose a feature?

- Ensure the matter is not already being discussed by searching on GitHub under [Issues](https://github.com/DaviDevMod/focus-trap/issues) or [Discussions](https://github.com/DaviDevMod/focus-trap/discussions).

- If you're unable to find an open issue addressing the problem, [open a new one](https://github.com/DaviDevMod/focus-trap/issues/new).  
  Be sure to include a **title and clear description**, as much relevant information as possible, and a **code sample** or an **executable test case** demonstrating the expected behavior that is not occurring.

#### Did you write a patch that fixes a bug?

- Create a pull request, also known as a PR, with the patch in question.

- Ensure the PR description clearly describes the problem and solution.  
  Don't forget to [link PR to issue](https://docs.github.com/en/issues/tracking-your-work-with-issues/linking-a-pull-request-to-an-issue) if one exists.

- Enable the checkbox to [allow maintainer edits](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/allowing-changes-to-a-pull-request-branch-created-from-a-fork) so the branch can be updated for a merge.  
  Once you submit your PR, we will review your proposal and may ask questions or request additional information.

- We may ask for changes to be made before a PR can be merged, either using [suggested changes](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/incorporating-feedback-in-your-pull-request) or pull request comments. You can apply suggested changes directly through the UI. You can make any other changes in your fork, then commit them to your branch.

- As you update your PR and apply changes, mark each conversation as [resolved](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/commenting-on-a-pull-request#resolving-conversations).

- Avoid force-pushing your changes, especially when updating your PR based on review feedback. Force-pushed changes are not easily viewable on GitHub, and not at all viewable if a force-push also rebases against main. PRs will be squash merged, so the specific commits on your PR branch do not matter, only the PR title itself. Don't worry about having a perfect commit history; instead focus on making your changes as easy to review and merge as possible.

- When applicable, write new tests and/or update the [README.md](https://github.com/DaviDevMod/focus-trap/blob/main/packages/focus-trap/README.md).

#### Need inspiration?

- Look for **Good First Issue** and **Help Wanted** [labeled issues](https://github.com/DaviDevMod/focus-trap/labels).

- Review our documentation!  
  We often aren't native english speakers, and our grammar might be a bit off. Any help we can get that makes our documentation more digestible is appreciated!

#### Do you have questions?

- Open a new [Discussion](https://github.com/DaviDevMod/focus-trap/discussions/new/choose).
