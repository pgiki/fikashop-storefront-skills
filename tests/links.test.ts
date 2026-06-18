import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = join(import.meta.dirname, '..');

const ALLOWED_GITHUB = /github\.com\/fikachu\/fikashop-storefront-skills/;

const FORBIDDEN_URL_PATTERNS = [
  /https?:\/\/github\.com\/fikachu\/fikashop(?!-storefront-skills)[^\s)>"]*/,
  /https?:\/\/github\.com\/pgiki\/fikashop[^\s)>"]*/,
];

const FORBIDDEN_LINK_TARGETS = [
  /\]\(\.\.\/\.\.\/fikashop-mobile/,
  /\]\(https?:\/\/github\.com\/fikachu\/fikashop/,
  /\]\(https?:\/\/github\.com\/pgiki\/fikashop/,
];

function collectMarkdownFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === '.git') continue;
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      collectMarkdownFiles(full, acc);
    } else if (entry.endsWith('.md')) {
      acc.push(full);
    }
  }
  return acc;
}

describe('documentation links', () => {
  it('does not reference private monorepo GitHub URLs', () => {
    const files = collectMarkdownFiles(ROOT).filter(
      (f) => !f.endsWith('tests/links.test.ts'),
    );
    const violations: string[] = [];

    for (const file of files) {
      const text = readFileSync(file, 'utf8');
      const rel = file.replace(`${ROOT}/`, '');

      for (const pattern of FORBIDDEN_URL_PATTERNS) {
        const matches = text.match(new RegExp(pattern.source, 'g'));
        if (matches) {
          for (const match of matches) {
            if (!ALLOWED_GITHUB.test(match)) {
              violations.push(`${rel}: forbidden URL ${match}`);
            }
          }
        }
      }

      for (const pattern of FORBIDDEN_LINK_TARGETS) {
        if (pattern.test(text)) {
          violations.push(`${rel}: forbidden markdown link target (${pattern})`);
        }
      }
    }

    expect(violations).toEqual([]);
  });
});
