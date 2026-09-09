import { execSync } from 'child_process';

console.log("Auto-push watcher started. Checking for changes every 30 seconds...");

setInterval(() => {
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    if (status.trim() !== '') {
      console.log(`[${new Date().toISOString()}] Detected changes, pushing to GitHub...`);
      execSync('git add .');
      execSync('git commit -m "Auto-update from local edits"');
      execSync('git push');
      console.log('Successfully pushed to GitHub.');
    }
  } catch (e) {
    // Ignore errors that might occur during git push (e.g., network issues)
  }
}, 30000);
