---
paths:
  - "**/app/**/*.py"
  - "**/fastapi/**/*.py"
  - "**/*_api.py"
  - "**/app/**/*.pyi"
  - "**/fastapi/**/*.pyi"
  - "**/*_api.pyi"
---

# FastAPI Rules

Use these rules for FastAPI projects alongside the general Python rules.

## Structure

- Put app construction in `create_app()`.
- Keep routers thin; move persistence and business behavior into services or CRUD helpers.
- Keep request schemas, update schemas, and response schemas separate.
- Keep database sessions and auth in dependencies.

## Async

- Use `async def` when the handler awaits async clients; use plain `def` when it must call blocking clients (FastAPI runs those in a threadpool).
- Use async database and HTTP clients from async endpoints.
- Do not call `requests`, sync SQLAlchemy sessions, or blocking file/network operations from async routes.

## Dependency injection

```python
@router.get("/users/{user_id}")
async def get_user(
    user_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    ...
```

Do not create `SessionLocal()` or long-lived clients inside route handlers.

- A dependency called twice in one request is cached per-request — share, don't re-resolve.

## Persistence

- Rely on database constraints (unique indexes) and catch `IntegrityError` instead of application-level prechecks — check-then-insert races under concurrency.
- Enforce deterministic ordering (`.order_by(...)`) on every offset/limit endpoint — unordered scans skip rows across pages.

## Schemas

- Never include passwords, password hashes, access tokens, refresh tokens, or internal auth state in response models.
- Declare the response shape: return-type annotation when the handler returns the declared model, `response_model` when it returns something else (dict, ORM object) — `response_model` wins when both are present.
- Use field constraints instead of hand-written validation when Pydantic can express the rule.

## Security

- Keep CORS origins environment-specific.
- Do not combine credentialed CORS with wildcard origins, methods, or headers.
- Validate JWT expiry, issuer, audience, and algorithm.
- Rate-limit auth and mutation endpoints.
- Redact credentials, cookies, authorization headers, and tokens from logs.

## Testing

- Override the exact dependency used by `Depends`.
- Clear `app.dependency_overrides` after tests.
- Use TestClient for sync test functions — it drives async apps from plain `def` tests; switch to `httpx.AsyncClient(transport=ASGITransport(app=app))` with `@pytest.mark.anyio` only when the test function itself must await.
