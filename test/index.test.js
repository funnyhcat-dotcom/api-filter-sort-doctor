import test from 'node:test';
import assert from 'node:assert/strict';
import { auditFilterSortDocs, formatReport, parseArgs } from '../src/index.js';
import { readFileSync } from 'node:fs';

const good = readFileSync(new URL('../examples/good.md', import.meta.url), 'utf8');
const bad = readFileSync(new URL('../examples/bad.md', import.meta.url), 'utf8');

test('good docs score highly', () => {
  const report = auditFilterSortDocs(good, { minScore: 90 });
  assert.equal(report.passed, true);
  assert.equal(report.score, 100);
  assert.equal(report.recommendations.length, 0);
});

test('bad docs fail with recommendations', () => {
  const report = auditFilterSortDocs(bad, { minScore: 80 });
  assert.equal(report.passed, false);
  assert.ok(report.score < 30);
  assert.ok(report.recommendations.some(item => item.includes('supported filter')));
});

test('warnings catch risky offset sorting docs', () => {
  const report = auditFilterSortDocs('Use offset pagination and sort=name.', { minScore: 1 });
  assert.ok(report.warnings.some(item => item.includes('Offset pagination')));
});

test('formats readable report', () => {
  const report = auditFilterSortDocs(bad, { minScore: 80 });
  assert.match(formatReport(report), /api-filter-sort-doctor score/);
});

test('parses cli args', () => {
  assert.deepEqual(parseArgs(['docs.md', '--min-score', '90', '--json']), {
    file: 'docs.md',
    minScore: 90,
    json: true,
    help: false,
    expectFail: false
  });
});
