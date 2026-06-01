import fs from 'fs';
import path from 'path';

function replaceInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      replaceInDir(filePath);
    } else if (file.endsWith('.jsx')) {
      let content = fs.readFileSync(filePath, 'utf-8');
      
      // bg-white/5, bg-white/8, bg-white/10 -> hover:bg-[var(--bg-card-hover)] or bg-[var(--bg-card)]
      content = content.replace(/hover:bg-white\/[0-9]+/g, 'hover:bg-[var(--bg-card-hover)]');
      content = content.replace(/bg-white\/[0-9]+/g, 'bg-[var(--bg-card)]');
      
      // border-white/10 -> border-[var(--border)]
      content = content.replace(/border-white\/10/g, 'border-[var(--border)]');

      // text-white -> text-[var(--text-primary)] (excluding buttons/gradients where we want explicit white text)
      // Since this is tricky via regex, we will manually fix `hover:text-white`
      content = content.replace(/hover:text-white/g, 'hover:text-[var(--text-primary)]');

      fs.writeFileSync(filePath, content);
      console.log(`Updated ${filePath}`);
    }
  }
}

replaceInDir(path.join(process.cwd(), 'src'));
