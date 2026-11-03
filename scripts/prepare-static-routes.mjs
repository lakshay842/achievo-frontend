import fs from 'node:fs';
import path from 'node:path';

/**
 * Expo exports `login.html`. Many hosts (including Vercel without cleanUrls)
 * only resolve `/login` when `login/index.html` exists. Copy each static HTML
 * page into a directory index so deep links work after deploy.
 */
const dist = path.resolve('dist');

function copyAsDirectoryIndex(htmlFile) {
  const dir = path.dirname(htmlFile);
  const base = path.basename(htmlFile, '.html');
  if (!base || base === 'index' || base.startsWith('+')) return;
  if (base.includes('[') || base.includes(']')) return;

  const targetDir = path.join(dir, base);
  const target = path.join(targetDir, 'index.html');
  fs.mkdirSync(targetDir, { recursive: true });
  fs.copyFileSync(htmlFile, target);
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // Avoid descending into directories we just created from html copies.
      if (fs.existsSync(path.join(full, 'index.html')) && !fs.existsSync(path.join(full, entry.name + '.html'))) {
        // still walk nested real folders like goals/
      }
      walk(full);
      continue;
    }
    if (entry.isFile() && entry.name.endsWith('.html')) {
      copyAsDirectoryIndex(full);
    }
  }
}

if (!fs.existsSync(dist)) {
  console.error('dist/ missing — run expo export first');
  process.exit(1);
}

walk(dist);
console.log('Prepared directory indexes for static routes in dist/');
