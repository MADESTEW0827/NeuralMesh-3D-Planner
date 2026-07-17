const fs = require('fs');
const path = require('path');

const dir = 'src';

const replacements = [
  ['bg-[#05070a]', 'bg-slate-50 dark:bg-[#05070a]'],
  ['text-slate-200', 'text-slate-800 dark:text-slate-200'],
  ['text-slate-300', 'text-slate-700 dark:text-slate-300'],
  ['text-slate-400', 'text-slate-600 dark:text-slate-400'],
  ['text-white', 'text-slate-900 dark:text-white'],
  ['bg-slate-900/80', 'bg-white/80 dark:bg-slate-900/80'],
  ['bg-black/40', 'bg-slate-200 dark:bg-black/40'],
  ['bg-black/20', 'bg-slate-100 dark:bg-black/20'],
  ['bg-white/5', 'bg-white dark:bg-white/5'],
  ['bg-white/10', 'bg-slate-100 dark:bg-white/10'],
  ['border-white/10', 'border-slate-300 dark:border-white/10'],
  ['border-white/5', 'border-slate-200 dark:border-white/5'],
  ['bg-[#0f172a]', 'bg-white dark:bg-[#0f172a]'],
];

function walk(currentDir) {
  const files = fs.readdirSync(currentDir);
  for (const file of files) {
    const filePath = path.join(currentDir, file);
    if (fs.statSync(filePath).isDirectory()) {
      walk(filePath);
    } else if (filePath.endsWith('.tsx')) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Prevent double replacement if script is run multiple times
      if (content.includes('dark:bg-[#05070a]')) continue;

      for (const [find, replace] of replacements) {
        // Regex to match the class name bounded by space, quote, or backtick
        // negative lookbehind to not match if preceded by 'dark:'
        const escapedFind = find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(?<!dark:)(?<=['"\\s\`])(${escapedFind})(?=['"\\s\`])`, 'g');
        content = content.replace(regex, replace);
      }
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${filePath}`);
    }
  }
}

walk(dir);
