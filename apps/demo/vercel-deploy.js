#!/usr/bin/env node

/*
End a commit message with the `DEEPLOY_FLAG`
to trigger a deployment when the commit is pushed.

NOTE:
The below implementation will fail when overwriting previously pushed commits.
However the `DEPLOY_FLAG` should be used only when pushing on the main branch
and force-pushing on the main branch should be avoided.
*/

const { spawnSync } = require('child_process');
const { exit } = require('process');

DEPLOY_FLAG = '{deploy}';

// Git command with output as utf-8 encoded string
const git = (args) => spawnSync('git', args, { encoding: 'utf-8' });

const commitMessagesSinceLastPush = git(['log', 'origin/main..', '--pretty=%B'])
  .stdout.split('\n')
  .filter((e) => e);

exit(Number(commitMessagesSinceLastPush.some((message) => message.endsWith(DEPLOY_FLAG))));
