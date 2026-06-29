import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

const bin = new URL('../bin/api-filter-sort-doctor.js', import.meta.url).pathname;

test('cli passes good example', () => {
  const result = spawnSync(process.execPath, [bin, 'examples/good.md', '--min-score', '90'], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /score: 100\/100/);
});

test('cli returns non-zero for weak docs', () => {
  const result = spawnSync(process.execPath, [bin, 'examples/bad.md', '--min-score', '80'], { encoding: 'utf8' });
  assert.equal(result.status, 1);
  assert.match(result.stdout, /Recommendations/);
});

test('cli emits json', () => {
  const result = spawnSync(process.execPath, [bin, 'examples/good.md', '--json'], { encoding: 'utf8' });
  assert.equal(result.status, 0);
  const parsed = JSON.parse(result.stdout);
  assert.equal(parsed.score, 100);
});
