import fs from 'fs';
import path from 'path';

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      processDir(filePath);
    } else if (filePath.endsWith('.jsx')) {
      let content = fs.readFileSync(filePath, 'utf-8');
      const original = content;

      const replacements = [
        // Backgrounds
        { regex: /rgba\(5,5,5,0\.75?\)/g, replacement: 'var(--bg-elevated)' },
        { regex: /rgba\(0,0,0,0\.6\)/g, replacement: 'var(--bg-elevated)' },
        { regex: /rgba\(255,255,255,0\.0[2345]\)/g, replacement: 'var(--bg-card)' },
        { regex: /rgba\(255,255,255,0\.0[67]\)/g, replacement: 'var(--bg-card-hover)' },
        // Borders
        { regex: /rgba\(255,255,255,0\.0[89]\)/g, replacement: 'var(--border)' },
        { regex: /rgba\(255,255,255,0\.1[0-4]?\)/g, replacement: 'var(--border)' },
        { regex: /rgba\(255,255,255,0\.15\)/g, replacement: 'var(--border-strong)' },
        // Text colors
        { regex: /text-zinc-400/g, replacement: 'text-[var(--text-secondary)]' },
        { regex: /text-zinc-500/g, replacement: 'text-[var(--text-muted)]' },
        { regex: /text-zinc-300/g, replacement: 'text-[var(--text-primary)]' },
        { regex: /text-white\/90/g, replacement: 'text-[var(--text-primary)]' },
      ];

      replacements.forEach(({ regex, replacement }) => {
        content = content.replace(regex, replacement);
      });
      
      content = content.replace(/<([a-z1-6]+)([^>]*?)text-white/g, (match, tag, rest) => {
        if (['h1', 'h2', 'h3', 'p', 'span', 'div', 'a', 'input'].includes(tag) && !rest.includes('bg-') && !rest.includes('gradient')) {
          return `<${tag}${rest}text-[var(--text-primary)]`;
        }
        return match;
      });

      if (content !== original) {
        fs.writeFileSync(filePath, content);
        console.log(`Updated ${filePath}`);
      }
    }
  }
}

processDir(path.join(process.cwd(), 'src', 'components'));
