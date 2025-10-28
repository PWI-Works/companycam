import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const hookDir = '.husky';

if (!existsSync(hookDir)) {
  process.exit(0);
}

try {
  execSync(`git config core.hooksPath ${hookDir}`, { stdio: 'ignore' });
} catch (error) {
  // Ignore errors when running in environments without git metadata (e.g., npm install from tarball).
}

const commitMsgHook = join(hookDir, 'commit-msg');
if (existsSync(commitMsgHook)) {
  try {
    execSync(`chmod +x ${commitMsgHook}`);
  } catch (error) {
    // Best effort to ensure hooks stay executable.
  }
}
