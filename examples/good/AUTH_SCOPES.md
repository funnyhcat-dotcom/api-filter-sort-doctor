# OAuth Scopes and Permissions

The API uses OAuth 2.0 Bearer access token authorization. Follow least privilege: only request minimal required scopes and avoid broad admin scopes.

## Scope list

- `customers:read`
- `customers:write`
- `invoices:read`
- `invoices:write`
- `admin:manage`

## Permission matrix

| Endpoint | Required scope | Notes |
|---|---|---|
| `GET /customers` | `customers:read` | list customers |
| `POST /customers` | `customers:write` | create customer |
| `GET /invoices` | `invoices:read` | read invoices |
| `POST /invoices` | `invoices:write` | create invoice |
| `DELETE /accounts/{id}` | `admin:manage` | restricted admin permission |

## Request example

```bash
curl https://api.example.com/customers \
  -H 'Authorization: Bearer <access_token_with_customers_read>'
```

## Errors

401 unauthorized means missing token, expired token, invalid token, or revoked token. 403 forbidden means insufficient scope / missing scope / permission denied. Use refresh token rotation before `expires_in` and revoke compromised tokens.

## OpenAPI and changes

OpenAPI uses `securitySchemes.oauth2` with `authorizationCode`, `clientCredentials`, and `scopes:`. Scope change migration is documented in release notes. New scope additions are backward compatible; breaking scope changes are deprecated first.

## Tests and audit

Authorization tests include negative test fixtures for missing scope and insufficient_scope. Security events are recorded in the audit log and monitored with alerts.
