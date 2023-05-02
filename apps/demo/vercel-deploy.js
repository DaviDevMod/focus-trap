#!/usr/bin/env node

/*
End a commit message with the `DEPLOY_SIGNATURE`
to trigger a deployment when the commit is pushed.
*/

const { spawnSync } = require('child_process');
const { exit } = require('process');

// Return early for branches other than the main one.
// https://vercel.com/guides/how-do-i-use-the-ignored-build-step-field-on-vercel#with-a-script
if (process.env.VERCEL_ENV != 'production') exit(0);

const COMMITS_SEPARATOR = '\t~:separateeetarapes:~\t';
const DEPLOY_SIGNATURE = '{deploy}';

// Git command with output as utf-8 encoded string
const git = (args) => spawnSync('git', args, { encoding: 'utf-8' });

// Whether there's a commit with the `DEPLOY_SIGNATURE` since the last deployed commit.
// https://github.com/vercel/vercel/discussions/7251#discussioncomment-4731588
const isDeploymentWanted = git([
  'log',
  `${process.env.VERCEL_GIT_PREVIOUS_SHA}..HEAD`,
  `--pretty=%B${COMMITS_SEPARATOR}`,
])
  .stdout.split(COMMITS_SEPARATOR)
  .some((message) => message.trimEnd().endsWith(DEPLOY_SIGNATURE));

// Let Vercel know whether a new deployment is wanted.
exit(isDeploymentWanted);
