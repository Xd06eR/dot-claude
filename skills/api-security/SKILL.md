---
name: api-security
description: Use for authorized security assessment of REST, GraphQL, or WebSocket APIs, including discovery, authentication, authorization, and rate limiting.
origin: reverse-skill
---

# API Security Testing

Black-box methodology for authorized penetration testing of a live API.

Before any active testing, pin the authorization basis (own system, written contract, bug-bounty scope, or CTF/lab) and the in-scope targets; a user naming a target is not by itself authorization.

Tools named below (jwt_tool, ffuf, Burp extensions) are not preinstalled; ask the user before installing anything.

## 1. Discovery

- Enumerate documented endpoints: `/openapi.json`, `/swagger.json`, `/api-docs`, `/graphql`, exposed GraphiQL/Playground
- Fuzz undocumented paths (ffuf, kiterunner); diff the API surface against what the UI actually calls
- GraphQL introspection, three-level degradation when blocked: full `__schema` query → `{ __schema { types { name } } }` → `{ __type(name: "Query") { name } }`

## 2. Authentication (JWT/OAuth)

- JWT: `alg:none` with stripped signature; RS256→HS256 confusion (sign with the public key as the HMAC secret); weak-secret cracking (`jwt_tool -C -d wordlist`); claim tampering (`role`, `exp`); `kid` header injection (`../../etc/passwd` → file content as HMAC key); embedded JWK
- OAuth: `redirect_uri` manipulation (domain appending, open-redirect chaining); missing `state` (login CSRF); missing PKCE; tokens leaking via `Referer` when callback pages load external resources
- Generic: scope escalation (`scope=read` → `read%20write`), token replay, refresh-token abuse, cross-tenant access, client secrets hardcoded in frontend bundles

## 3. Authorization (BOLA/IDOR/BFLA)

- Iterate identifiers: numeric IDs, UUIDs, usernames/emails; dual-account replay diffing (Burp Autorize)
- Function-level: ordinary user calling admin endpoints; HTTP method switching (GET→PUT→PATCH→DELETE); version downgrade (`/v2/admin` → `/v1/admin`)
- Mass assignment (`role`, `isAdmin`, price fields added to bodies); batch-operation injection into ID arrays

## 4. Input handling

- Method matrix per endpoint: every verb tested for access, overwrite, field injection, cascade delete
- Content-Type confusion (JSON→XML→multipart); XXE on XML endpoints
- NoSQL injection (`{"$gt": ""}`), parameter pollution (`?role=user&role=admin`), JSON type confusion
- SSRF via URL-bearing params (`webhook_url`, `callback_url`, `avatar_url`, `import_url`, `redirect_uri`, `file_url`): probe `169.254.169.254`, cloud metadata endpoints, `file:///etc/passwd`

## 5. GraphQL specifics

- DoS vectors: alias overload (100+ aliases), batch queries, circular nested introspection, directive overload
- Mutations over GET (CSRF); batch queries mixing authenticated and unauthenticated operations
- Field-suggestion and debug-mode information leakage

## 6. Business logic

- Permission matrix per role (admin/user/readonly) across whole workflows, not per endpoint
- Price/coupon/points manipulation; race conditions (TOCTOU) via concurrent requests
- Version diffing: changed status codes, removed fields, latency regressions between API versions

## 7. WebSocket

- Message injection and prototype pollution; oversized messages; type confusion; cross-site WebSocket hijacking

## 8. Rate limiting and data exposure

- Limit bypass via `X-Forwarded-For`/`X-Real-IP` rotation and path variants (`/api/` vs `/api` vs `/Api/`)
- Over-exposure: diff API responses against what the UI displays; pagination enumeration (`?limit=10000`); error messages leaking stack traces, internal paths, or SQL

## Findings

Report each finding with endpoint, severity, evidence, and reproduction steps. Every confirmed finding converts to a regression test; automate in CI once the same check is needed twice.
