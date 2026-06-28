# Telemetry Contract — OpenCode Telemetry Ingestion & Aggregation API

**Intent ID:** `intent-2606-101-1008-0004`
**Service:** `opencode-telemetry-api`
**Version:** 1.1.0

---

## 1. Raw Storage Contracts (Cosmos DB)

### 1.1 Metric Record — `opencode.token.usage`

Stored in Cosmos DB container `metrics`. Partition key: `student_context_key`.

```json
{
  "id": "string (guid)",
  "student_context_key": "string — deployment-scoped student identifier",
  "repo_key": "string — repository name",
  "resource_group_key": "string — Azure resource group",
  "signal_name": "opencode.token.usage",
  "metric_type": "input|output|reasoning|cacheRead|cacheCreation",
  "time_unix_nano": 0,
  "event_time_utc": "2026-01-01T00:00:00Z",
  "cumulative_value": 0,
  "ingested_at_utc": "2026-01-01T00:00:05Z",
  "source_transport": "otlp_http_protobuf"
}
```

### 1.2 Log Event Record — `api_request` / `api_error`

Stored in Cosmos DB container `logs`. Partition key: `student_context_key`.

```json
{
  "id": "string (guid)",
  "student_context_key": "string — deployment-scoped student identifier",
  "repo_key": "string — repository name",
  "resource_group_key": "string — Azure resource group",
  "event_name": "api_request|api_error",
  "time_unix_nano": 0,
  "event_time_utc": "2026-01-01T00:00:00Z",
  "body_text": "string|null",
  "attributes": {},
  "ingested_at_utc": "2026-01-01T00:00:05Z",
  "source_transport": "otlp_http_protobuf"
}
```

---

## 2. Read-Only API Response Contracts

### 2.1 Token Totals

Primary route: `GET /api/opencode/token-usage?start=<iso8601>&end=<iso8601>`
Alias route:    `GET /api/telemetry/tokens/total?start=<iso8601>&end=<iso8601>`

```json
{
  "start": "2026-01-01T00:00:00Z",
  "end": "2026-01-01T12:00:00Z",
  "student_context_key": "string",
  "totals": {
    "input": 0,
    "output": 0,
    "reasoning": 0,
    "cacheRead": 0,
    "cacheCreation": 0
  },
  "isComplete": true,
  "derivation_note": "Derived from cumulative opencode.token.usage counter deltas using time_unix_nano. Raw cumulative snapshots are not usage totals."
}
```

### 2.2 Token Series

Primary route: `GET /api/opencode/token-usage/series?start=<iso8601>&end=<iso8601>&interval=<duration>`
Alias route:    `GET /api/telemetry/tokens/timeseries?start=<iso8601>&end=<iso8601>&interval=<duration>`

```json
{
  "start": "2026-01-01T00:00:00Z",
  "end": "2026-01-01T12:00:00Z",
  "interval": "15m",
  "student_context_key": "string",
  "isComplete": true,
  "series": [
    {
      "bucket_start": "2026-01-01T00:00:00Z",
      "bucket_end": "2026-01-01T00:15:00Z",
      "values": {
        "input": 0,
        "output": 0,
        "reasoning": 0,
        "cacheRead": 0,
        "cacheCreation": 0
      }
    }
  ]
}
```

### 2.3 Log Queries

`GET /api/opencode/logs/api-request?start=<iso8601>&end=<iso8601>`
`GET /api/opencode/logs/api-error?start=<iso8601>&end=<iso8601>`

```json
{
  "start": "2026-01-01T00:00:00Z",
  "end": "2026-01-01T12:00:00Z",
  "items": [
    {
      "event_name": "api_request",
      "event_time_utc": "2026-01-01T01:23:45Z",
      "body": "string|null",
      "attributes": {}
    }
  ]
}
```

---

## 3. Aggregation Semantics

- `time_unix_nano` is authoritative for aggregation windows.
- `opencode.token.usage` is a cumulative Counter.
- All reported values are derived as **window deltas** (not raw snapshot values).
- **Counter reset handling**: If a cumulative value decreases between consecutive samples, the delta for that interval is clamped to zero (non-negative). The counter is treated as having reset, and the new lower value becomes the new baseline.
- Empty time windows return success with zero totals / empty series.

### Example

| Sample | Cumulative Value | Window Delta |
|--------|-----------------|--------------|
| 10:00  | 100             | —            |
| 10:15  | 140             | 40           |
| 10:30  | 205             | 65           |

Total for `[10:00, 10:30]` = **105** (not 205).

---

## 4. Validation

| Condition | Response |
|-----------|----------|
| Missing `start` or `end` | `400` — error message |
| Malformed timestamp | `400` — error message |
| `start > end` | `400` — error message |
| `start == end` | Valid (empty window), returns empty result shape |
| No matching data | `200` with zero totals / empty items |

## 5. Completeness

Both token endpoints return an `isComplete` field.

| `isComplete` | Meaning |
|--------------|---------|
| `true`  | All metric-type queries for the requested range succeeded |
| `false` | One or more metric-type queries failed; returned data is partial |

The UI should show available data even when `isComplete: false` and display an
incomplete-results indicator rather than a hard failure.  Zero-usage responses
with `isComplete: true` are valid states and should not be treated as errors.

---

## 6. Transport

- **OTLP Ingestion**: `POST /otlp/v1/metrics` and `POST /otlp/v1/logs`
- **Content-Type**: `application/json` or `application/x-protobuf`
- **Unsupported Content-Type**: `415` response
- **Empty body**: `400` response
- **Invalid payload**: `400` response

---

## 7. Signal Names

| Signal | Type | Metric Types |
|--------|------|-------------|
| `opencode.token.usage` | Counter | `input`, `output`, `reasoning`, `cacheRead`, `cacheCreation` |
| `api_request` | Log event | — |
| `api_error` | Log event | — |
