# List customers

`GET /v1/customers` supports filtering, sorting, and cursor pagination.

## Filters

| Field | Type | Operators | Example |
|---|---|---|---|
| `status` | enum: `active`, `paused`, `deleted` | `eq`, `in`, `not` | `filter[status]=active` |
| `created_at` | ISO-8601 timestamp | `gt`, `gte`, `lt`, `lte`, `between` | `filter[created_at][gte]=2026-01-01T00:00:00Z` |
| `email` | string | `contains`, `starts_with` | `filter[email][contains]=@example.com` |

Filter keys use bracket syntax. URL-encode brackets as `%5B` and `%5D` when your HTTP client does not do it for you. Lists are comma-separated: `filter[status][in]=active,paused`.

Empty filter values are rejected with `400 invalid_filter`. Unknown filter fields and unsupported operators are never silently ignored.

## Sorting

Use `sort=created_at:desc` or `sort=-created_at`. Supported fields are `created_at`, `updated_at`, `email`, and `id`. The default order when sort is omitted is `created_at:desc,id:desc`.

For deterministic and stable order, every timestamp sort uses `id` as a tie-breaker. Multi-field sort priority is left to right, for example `sort=status:asc,created_at:desc,id:desc`.

## Pagination stability

Cursor pagination uses the final sorted row as the page token. Keep the same filters and sort for every next page to avoid duplicate or missing records.

## Limits

Maximum 8 filters per request, maximum 3 sort fields, page size up to 100. Only fields listed above are allowed.

## Examples

```bash
curl 'https://api.example.com/v1/customers?filter%5Bstatus%5D=active&filter%5Bcreated_at%5D%5Bgte%5D=2026-01-01T00%3A00%3A00Z&sort=-created_at&limit=50'
```

Invalid request:

```json
{
  "error": {
    "code": "invalid_sort",
    "message": "Unsupported sort field: password",
    "hint": "Use one of created_at, updated_at, email, id."
  }
}
```
