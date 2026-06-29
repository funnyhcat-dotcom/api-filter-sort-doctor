# api-filter-sort-doctor

A zero-dependency CLI that audits API documentation for filtering and sorting quality. It helps docs, DX, and API teams catch the tiny omissions that create support tickets: unclear operators, unstable sorting, missing defaults, silent invalid filters, and pagination surprises.

## Why people use it

Filtering and sorting docs often look complete until a real customer asks:

- Which operators are supported?
- Are brackets URL encoded?
- What happens with `null`, empty values, or unknown fields?
- What is the default sort?
- Can sorting create duplicate or missing rows across pages?
- What error code should invalid filters return?

`api-filter-sort-doctor` turns those questions into an automated checklist.

## Install / run

```bash
npx api-filter-sort-doctor docs/api.md
```

Or from a cloned repo:

```bash
node bin/api-filter-sort-doctor.js examples/good.md --min-score 90
```

## CLI

```text
api-filter-sort-doctor <file.md> [--min-score 80] [--json] [--expect-fail]
```

Options:

| Option | Description |
|---|---|
| `--min-score <0-100>` | Required score before the CLI exits successfully. Default: `80`. |
| `--json` | Print machine-readable output for CI bots. |
| `--expect-fail` | Invert the exit code. Useful for testing bad examples. |
| `--help` | Show help. |

## What it checks

- supported filter fields
- filter operators such as `eq`, `gt`, `gte`, `lt`, `lte`, `in`, `contains`, `not`
- value types and date formats
- URL encoding / bracket / comma-separated syntax
- empty, null, unknown, and unsupported value behavior
- sort parameter syntax
- default sort order
- deterministic tie breakers
- pagination stability
- field and request limits
- validation errors
- concrete examples

## Example output

```text
✅ api-filter-sort-doctor score: 100/100 (minimum 90)

✅ filter-parameter (+10) — Names at least one filter parameter.
✅ filter-operators (+10) — Documents supported filter operators such as equality, ranges, contains, in, or not.
...
```

Weak docs get clear recommendations instead of vague lint errors.

## CI usage

```yaml
- name: Audit API filter/sort docs
  run: npx api-filter-sort-doctor docs/api.md --min-score 85
```

## Good and bad examples

- [`examples/good.md`](examples/good.md)
- [`examples/bad.md`](examples/bad.md)

## Development

```bash
npm test
npm run check
```

## Design goals

- zero dependencies
- useful default checks
- readable CLI output
- JSON output for automation
- defensive argument parsing and safe file handling
- small enough to understand in one sitting

## License

MIT
