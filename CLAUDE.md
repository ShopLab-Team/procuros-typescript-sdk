# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TypeScript SDK for the Procuros API v2 — a B2B trade transaction platform. Zero runtime dependencies; uses native `fetch` (Node 18+). Published as `@shoplab/procuros-sdk` on npm.

## Commands

```bash
pnpm run build          # Build ESM + CJS via tsup → dist/
pnpm run type-check     # TypeScript strict check (tsc --noEmit)
pnpm run test           # Run all tests (vitest run)
pnpm run test:watch     # Watch mode (vitest)
npx vitest run tests/resources/incoming.test.ts  # Run a single test file
```

## Architecture

### Layered Design

```
ProcurosClient (src/client.ts)
  ├── incoming:  IncomingTransactions  → /v2/transactions (GET, PUT)
  ├── outgoing:  OutgoingTransactions  → /v2/transactions (POST), /v2/errors
  ├── transactions: AllTransactions   → /v2/all-transactions
  └── misc:      Misc (private)       → /v2/ping
        │
        ▼
    HttpClient (src/http.ts)
    └── Retry logic, timeout, backoff, error classification
```

- **`src/client.ts`** — `ProcurosClient` is the public entry point. Constructs `HttpClient` and wires up resource classes.
- **`src/http.ts`** — `HttpClient` handles all HTTP concerns: request building, retry with exponential backoff + jitter, timeout via `AbortController`, rate-limit handling (429 with `Retry-After`), and error classification.
- **`src/resources/base.ts`** — `BaseResource` abstract class holds the `HttpClient` reference. All resource classes extend it.
- **`src/resources/`** — Each resource class (`IncomingTransactions`, `OutgoingTransactions`, `AllTransactions`, `Misc`) maps to a Procuros API endpoint group.
- **`src/errors.ts`** — Error hierarchy: `ProcurosError` → `ProcurosApiError` → `ProcurosValidationError` / `ProcurosRateLimitError`, plus `ProcurosNetworkError` and `ProcurosTimeoutError`.
- **`src/validation.ts`** — Input validators (perPage, bulk size, date ranges). UUID validation lives in `errors.ts`.
- **`src/types/`** — Pure type definitions split by concern: `enums.ts`, `common.ts`, `documents.ts`, `documents-extended.ts`, `requests.ts`, `responses.ts`. Re-exported via barrel `index.ts`.

### Key Patterns

- **Pagination**: `list()` returns `PaginatedResponse<T>` with `items` and `nextCursor`. `listAll()` is an `AsyncGenerator` that auto-paginates.
- **Discriminated unions**: Both request (`SentTransaction`) and response (`ReceivedTransaction`, `Transaction`) types use discriminated unions on the `type` field. Narrowing on `type` automatically narrows `content` to the corresponding document type (e.g., `tx.type === 'ORDER'` narrows `tx.content` to `Order`). The helper types `ReceivedTransactionOf<T, C>` and `TransactionOf<T, C>` in `responses.ts` build these unions.
- **`__SDK_VERSION__`** is injected at build time by tsup's `define` config from `package.json` version.

## Conventions

- **ESM-first** (`"type": "module"`). Dual ESM + CJS output via tsup. Use `.js` extensions in imports.
- **Zero runtime dependencies**. Only devDependencies: `msw`, `tsup`, `typescript`, `vitest`.
- **Strict TypeScript**: `strict: true`, `noUncheckedIndexedAccess`, `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`.
- **500-line limit** per hand-written file.
- **Named exports only** — no default exports.
- Use `interface` for object shapes, `type` for unions/aliases.
- Use `import type` for type-only imports.
- All custom errors extend `ProcurosError`.
- Never expose API tokens in error messages or logs.

## Testing

- **Vitest** with `globals: true` (no need to import `describe`/`it`/`expect`).
- **MSW** (Mock Service Worker) for HTTP mocking — never stub `fetch` directly.
- `tests/helpers.ts` exports `createTestClient()`, `createTestClientWithRetry()`, `server`, `http`, `HttpResponse`.
- Fixture data in `tests/fixtures/` — one file per transaction type.
- Use `server.use()` for per-test handler overrides.
- Coverage excludes `src/types/` (pure type definitions).
