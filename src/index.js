const CHECKS = [
  {
    id: 'filter-parameter',
    points: 10,
    message: 'Names at least one filter parameter.',
    test: text => /\b(filter|filters|where|query)\b/i.test(text) && /\b(status|state|type|category|created|updated|date|email|name|tag|owner|ids?)\b/i.test(text)
  },
  {
    id: 'filter-operators',
    points: 10,
    message: 'Documents supported filter operators such as equality, ranges, contains, in, or not.',
    test: text => /(operator|equals?|eq\b|ne\b|gt\b|gte\b|lt\b|lte\b|between|range|contains|starts_with|in\b|not\b)/i.test(text)
  },
  {
    id: 'filter-types',
    points: 8,
    message: 'Explains accepted value types/formats for filters.',
    test: text => /(boolean|string|number|integer|enum|ISO\s*-?8601|date|timestamp|uuid|comma[- ]separated|array)/i.test(text)
  },
  {
    id: 'encoding',
    points: 8,
    message: 'Mentions URL encoding or comma/bracket syntax for complex filters.',
    test: text => /(url[- ]?encod|encodeURIComponent|percent[- ]encod|comma[- ]separated|\[\]|bracket|filter\[[^\]]+\]|%5B|%5D)/i.test(text)
  },
  {
    id: 'empty-values',
    points: 7,
    message: 'Defines behavior for empty, null, unknown, or unsupported filter values.',
    test: text => /(empty|null|missing|unknown|unsupported|invalid|blank|omit|ignored?)/i.test(text)
  },
  {
    id: 'sort-parameter',
    points: 10,
    message: 'Documents sort parameter syntax.',
    test: text => /\b(sort|order_by|orderby|orderBy)\b/i.test(text) && /(asc|desc|ascending|descending|-created|created_at|updated_at|name|sort=)/i.test(text)
  },
  {
    id: 'sort-default',
    points: 8,
    message: 'States default sort order when no sort is supplied.',
    test: text => /(default sort|sorts? by default|default order|when sort is omitted|if sort is omitted|without sort)/i.test(text)
  },
  {
    id: 'tie-breaker',
    points: 9,
    message: 'Explains deterministic tie breakers for stable results.',
    test: text => /(tie[- ]?breaker|secondary sort|deterministic|stable order|same timestamp|id as|unique id|then by id)/i.test(text)
  },
  {
    id: 'pagination-stability',
    points: 8,
    message: 'Connects filtering/sorting behavior to pagination stability.',
    test: text => /(pagination|cursor|page token|next_page|next page|limit|offset)/i.test(text) && /(stable|consistent|duplicate|missing|snapshot|tie[- ]?breaker)/i.test(text)
  },
  {
    id: 'limits',
    points: 7,
    message: 'Lists limits such as max filters, max sort fields, allowed fields, or page size.',
    test: text => /(maximum|max\b|limit|up to|allowed fields|whitelist|supported fields|max.*sort|max.*filter)/i.test(text)
  },
  {
    id: 'errors',
    points: 8,
    message: 'Shows validation errors for invalid filters or sort fields.',
    test: text => /(400|422|invalid_filter|invalid_sort|error code|validation error|bad request|unsupported field)/i.test(text)
  },
  {
    id: 'examples',
    points: 7,
    message: 'Includes concrete request examples.',
    test: text => /(curl|https?:\/\/|GET\s+\/|\?[^\s]+(filter|sort)|```)/i.test(text)
  }
];

export function parseArgs(argv) {
  const options = { file: '', minScore: 80, json: false, help: false, expectFail: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--help' || arg === '-h') options.help = true;
    else if (arg === '--json') options.json = true;
    else if (arg === '--expect-fail') options.expectFail = true;
    else if (arg === '--min-score') {
      const value = Number(argv[++index]);
      if (!Number.isFinite(value) || value < 0 || value > 100) throw new Error('--min-score must be 0-100');
      options.minScore = value;
    } else if (arg.startsWith('--')) {
      throw new Error(`Unknown option: ${arg}`);
    } else if (!options.file) {
      options.file = arg;
    } else {
      throw new Error(`Unexpected argument: ${arg}`);
    }
  }
  return options;
}

export function auditFilterSortDocs(markdown, options = {}) {
  const text = String(markdown || '');
  const results = CHECKS.map(check => ({
    id: check.id,
    points: check.points,
    passed: check.test(text),
    message: check.message
  }));
  const earned = results.filter(item => item.passed).reduce((sum, item) => sum + item.points, 0);
  const possible = results.reduce((sum, item) => sum + item.points, 0);
  const score = Math.round((earned / possible) * 100);
  const missing = results.filter(item => !item.passed);
  const warnings = buildWarnings(text);
  return {
    score,
    minScore: options.minScore ?? 80,
    passed: score >= (options.minScore ?? 80),
    earned,
    possible,
    checks: results,
    warnings,
    recommendations: missing.map(item => recommendationFor(item.id))
  };
}

function buildWarnings(text) {
  const warnings = [];
  if (/offset/i.test(text) && !/(tie[- ]?breaker|stable|deterministic|cursor)/i.test(text)) {
    warnings.push('Offset pagination with sorting can skip or duplicate rows. Document stable ordering or cursor pagination.');
  }
  if (/sort=.*,/i.test(text) && !/(priority|left to right|first.*then|secondary)/i.test(text)) {
    warnings.push('Multi-field sort examples should explain field priority.');
  }
  if (/filter\[[^\]]+\]/i.test(text) && !/(encode|bracket|%5B|%5D)/i.test(text)) {
    warnings.push('Bracket filter syntax should include an URL-encoding note.');
  }
  return warnings;
}

function recommendationFor(id) {
  const map = {
    'filter-parameter': 'Add a table of supported filter fields with names and descriptions.',
    'filter-operators': 'List supported operators like eq, gt, gte, lt, lte, in, contains, and not.',
    'filter-types': 'Document value formats, including dates, booleans, enums, UUIDs, arrays, and timestamps.',
    encoding: 'Explain comma-separated, bracket, or URL-encoded syntax for complex queries.',
    'empty-values': 'Define how empty strings, nulls, unknown fields, and unsupported values behave.',
    'sort-parameter': 'Show sort syntax such as sort=created_at, -created_at, or sort=created_at:desc.',
    'sort-default': 'State the default sort field and direction when the client omits sort.',
    'tie-breaker': 'Document deterministic tie breakers, usually sorting by id after timestamp fields.',
    'pagination-stability': 'Explain how sort and filters interact with cursor/page pagination.',
    limits: 'Publish limits for filter count, sort field count, page size, and allowed fields.',
    errors: 'Show invalid_filter and invalid_sort error examples with status code and fix hints.',
    examples: 'Add realistic curl examples for a valid filter+sort request and an invalid request.'
  };
  return map[id] || `Improve ${id}.`;
}

export function formatReport(report) {
  const lines = [];
  const mark = report.passed ? '✅' : '❌';
  lines.push(`${mark} api-filter-sort-doctor score: ${report.score}/100 (minimum ${report.minScore})`);
  lines.push('');
  for (const check of report.checks) {
    lines.push(`${check.passed ? '✅' : '❌'} ${check.id} (+${check.points}) — ${check.message}`);
  }
  if (report.warnings.length) {
    lines.push('', 'Warnings:');
    for (const warning of report.warnings) lines.push(`- ${warning}`);
  }
  if (report.recommendations.length) {
    lines.push('', 'Recommendations:');
    for (const recommendation of report.recommendations) lines.push(`- ${recommendation}`);
  }
  return lines.join('\n');
}
