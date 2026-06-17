import { execSync } from 'child_process';

const message = execSync('git log -1 --format=%s').toString().trim();

execSync(`npx gh-pages -d dist -m "${message}"`, { stdio: 'inherit' });
