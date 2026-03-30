const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'frontend/src');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(dirPath);
  });
}

const advancedMap = {
  'from-rose-200/40': 'from-phase-menstrual/15',
  'via-rose-100/40': 'via-phase-menstrual/10',
  'bg-rose-200/40': 'bg-phase-menstrual/15',
  'bg-rose-400/60': 'bg-phase-menstrual/50',
  'bg-rose-50/50': 'bg-phase-menstrual/5',
  'decoration-rose-300/50': 'decoration-phase-menstrual/20',
  'ring-rose-200': 'ring-phase-menstrual/30',
  'bg-rose-200/60': 'bg-phase-menstrual/20',
  'hover:bg-rose-200/60': 'hover:bg-phase-menstrual/20',
  'shadow-rose-900/10': 'shadow-phase-menstrual/10',
  'to-rose-900': 'to-phase-menstrual/80',
  'shadow-rose-100/20': 'shadow-phase-menstrual/5',
  'ring-rose-50/50': 'ring-phase-menstrual/10',
  'hover:bg-rose-50/50': 'hover:bg-phase-menstrual/10',
  'bg-rose-50/30': 'bg-phase-menstrual/5',
  'border-rose-100/50': 'border-phase-menstrual/10',
};

let filesChanged = 0;

walk(srcDir, (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts') || filePath.endsWith('.css')) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let newContent = content;

    for (const [key, value] of Object.entries(advancedMap)) {
      // Split entirely to replace simple substrings this time globally
      newContent = newContent.split(key).join(value);
    }

    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent, 'utf-8');
      filesChanged++;
      console.log('Updated:', path.relative(srcDir, filePath));
    }
  }
});

console.log(`Updated ${filesChanged} files.`);
