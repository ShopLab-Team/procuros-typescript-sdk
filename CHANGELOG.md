# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-03-10

### Added

- **Discriminated union response types**: `ReceivedTransaction` and `Transaction` are now discriminated unions on the `type` field. Checking `tx.type === 'ORDER'` automatically narrows `tx.content` to `Order` — no manual casts required. This matches the existing `SentTransaction` pattern for outgoing requests.

### Changed

- **Full jitter backoff**: Retry backoff jitter range changed from `[50%, 100%]` to `[0%, 100%]` of the computed delay. This follows the [AWS recommended full jitter strategy](https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/) and reduces retry clustering when multiple clients experience errors simultaneously.

### Fixed

- Token-leak test no longer produces false positives (restructured from bare `try/catch` to explicit assertion).

## [1.0.2] - 2026-03-07

### Changed

- Added CI and CodeQL status badges to README.

## [1.0.1] - 2026-03-07

### Changed

- CI configuration adjustments for npm provenance and GitHub-hosted runners.

## [1.0.0] - 2026-03-07

### Added

- Initial release of `@shoplab/procuros-sdk`.
- Full TypeScript SDK for Procuros API v2.
- Resources: `incoming` (list, listAll, markProcessed, bulkMarkProcessed), `outgoing` (send, reportError), `transactions` (list, listAll, get), and `ping`.
- Cursor-based pagination with auto-paginating `listAll()` async generators.
- `SentTransaction` discriminated union for type-safe outgoing transaction payloads across all 12 transaction types.
- Error hierarchy: `ProcurosError`, `ProcurosApiError`, `ProcurosValidationError`, `ProcurosRateLimitError`, `ProcurosNetworkError`, `ProcurosTimeoutError`.
- Retry with exponential backoff and jitter for GET/PUT requests.
- Rate-limit handling (429) with `Retry-After` header support (numeric and HTTP-date formats).
- Per-request timeout via `AbortController` with `AbortSignal.any` fast-path on Node 20+.
- Request cancellation via user-provided `AbortSignal`.
- Client-side validation for UUIDs, perPage, bulk size, and date ranges.
- Dual ESM + CJS output via tsup with generated `.d.ts` declarations.
- Zero runtime dependencies.

[1.1.0]: https://github.com/ShopLab-Team/procuros-typescript-sdk/compare/v1.0.2...v1.1.0
[1.0.2]: https://github.com/ShopLab-Team/procuros-typescript-sdk/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/ShopLab-Team/procuros-typescript-sdk/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/ShopLab-Team/procuros-typescript-sdk/releases/tag/v1.0.0
