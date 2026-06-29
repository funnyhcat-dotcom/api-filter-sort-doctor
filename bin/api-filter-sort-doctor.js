#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { auditFilterSortDocs, formatReport, parseArgs } from '../src/index.js';

function main(argv) {
  let options;
  try {
    options = parseArgs(argv);
  } catch (error) {
    console.error(error.message);
    return 2;
  }
  if (options.help) {
    console.log(`api-filter-sort-doctor

Usage:
  api-filter-sort-doctor <file.md> [--min-score 80] [--json] [--expect-fail]

Checks API docs for practical filtering and sorting guidance:
  - filter parameter names, operators, types, encoding, empty-value behavior
  - sort parameter syntax, default order, tie breakers, stable pagination
  - limits, validation errors, good and bad examples

Examples:
  api-filter-sort-doctor docs/api.md
  api-filter-sort-doctor docs/api.md --min-score 90 --json
  api-filter-sort-doctor examples/bad.md --expect-fail`);
    return 0;
  }

  if (!options.file) {
    console.error('Missing file. Run: api-filter-sort-doctor <file.md>');
    return 2;
  }

  let text;
  try {
    text = readFileSync(resolve(options.file), 'utf8');
  } catch (error) {
    console.error(`Cannot read ${options.file}: ${error.message}`);
    return 2;
  }

  const report = auditFilterSortDocs(text, options);
  if (options.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(formatReport(report));
  }

  const passed = report.score >= options.minScore;
  if (options.expectFail) return passed ? 1 : 0;
  return passed ? 0 : 1;
}

process.exitCode = main(process.argv.slice(2));
