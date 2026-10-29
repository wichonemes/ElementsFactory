// fix_encoding.cjs
// Fix double-encoded Spanish characters in source files
// safe for emojis (only replaces known Latin-1 mojibake sequences)

const fs = require('fs');
const path = require('path');

const SRC_ROOT = path.join(__dirname, 'src');

// Map of double-encoded UTF-8-as-Latin1 sequences to correct chars
const FIXES = [
  ['Ã¡', 'á'], ['Ã©', 'é'], ['Ã­', 'í'], ['Ã³', 'ó'], ['Ãº', 'ú'],
  ['Ã±', 'ñ'], ['Ã¼', 'ü'], ['Â¿', '¿'], ['Â¡', '¡'],
  ['Ã\u0081', 'Á'], ['Ã\u0089', 'É'], ['Ã\u008d', 'Í'], ['Ã\u0093', 'Ó'], ['Ã\u009a', 'Ú'],
  ['Ã\u0091', 'Ñ'],
  ['Ã¤', 'ä'], ['Ã«', 'ë'], ['Ã¯', 'ï'], ['Ã¶', 'ö'],
  ['â€œ', '\u201C'], ['â€\u009d', '\u201D'], ['â€™', '\u2019'], ['â€¦', '\u2026'],
  ['Ã\u0082', 'Â'],
];

function walkAndFix(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkAndFix(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      const original = fs.readFileSync(fullPath, 'utf8');
      let content = original;
      for (const [wrong, correct] of FIXES) {
        content = content.split(wrong).join(correct);
      }
      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Fixed:', path.relative(SRC_ROOT, fullPath));
      }
    }
  }
}

walkAndFix(SRC_ROOT);
console.log('Done fixing encoding.');
