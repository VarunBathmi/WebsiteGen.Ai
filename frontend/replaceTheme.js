import fs from 'fs';
import path from 'path';

const pagesDir = path.join(process.cwd(), 'src', 'pages');
const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.jsx'));

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
  // We cannot blindly replace `text-white` because buttons need it, but we can replace specific text-white instances if we want.
  // We'll leave `text-white` on buttons, but we need body text to adapt.
];

files.forEach(file => {
  const filePath = path.join(pagesDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  
  replacements.forEach(({ regex, replacement }) => {
    content = content.replace(regex, replacement);
  });
  
  // Specific fixes for headings and main text which are explicitly text-white
  // h1, h2, h3, p with text-white
  content = content.replace(/<([a-z1-6]+)([^>]*?)text-white/g, (match, tag, rest) => {
    // Only replace if it's a heading or paragraph or div, NOT a button or a badge with a colored background
    if (['h1', 'h2', 'h3', 'p', 'span', 'div', 'a'].includes(tag) && !rest.includes('bg-') && !rest.includes('gradient')) {
      return `<${tag}${rest}text-[var(--text-primary)]`;
    }
    return match;
  });

  fs.writeFileSync(filePath, content);
  console.log(`Updated ${file}`);
});
