const fs = require('fs');
const path = require('path');

const dir = process.cwd();
const scriptTag = '<script src="shared.js" defer></script>';
const htmlFiles = fs.readdirSync(dir)
  .filter((file) => file.toLowerCase().endsWith('.html'))
  .filter((file) => fs.statSync(path.join(dir, file)).isFile());

let changed = 0;
let skipped = 0;

for (const file of htmlFiles) {
  const fullPath = path.join(dir, file);
  let html = fs.readFileSync(fullPath, 'utf8');

  if (/shared\.js/i.test(html)) {
    console.log(`SKIP  ${file} already loads shared.js`);
    skipped++;
    continue;
  }

  const backupPath = `${fullPath}.bak`;
  if (!fs.existsSync(backupPath)) fs.writeFileSync(backupPath, html);

  if (/<\/body\s*>/i.test(html)) {
    html = html.replace(/<\/body\s*>/i, `  ${scriptTag}\n</body>`);
  } else {
    html = `${html.trim()}\n${scriptTag}\n`;
  }

  fs.writeFileSync(fullPath, html);
  console.log(`FIXED ${file}`);
  changed++;
}

console.log(`\nDone. Fixed ${changed} file(s), skipped ${skipped} file(s). Backups saved as .html.bak files.`);
