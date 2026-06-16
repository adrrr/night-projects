# Hairline — Global Leaderboard Worker

A tiny Cloudflare Worker + KV namespace that backs the global leaderboard for
the Hairline game. It stores the **10 smallest angular errors** (lower is
better) under a single KV key and exposes a two-route JSON API with CORS.

## Deploy

You need [`wrangler`](https://developers.cloudflare.com/workers/wrangler/) and a
Cloudflare account (`wrangler login` once).

1. **Create the KV namespace** (from this `_leaderboard/` directory):

   ```sh
   wrangler kv namespace create SCORES
   ```

   Wrangler prints something like:

   ```
   id = "0123456789abcdef0123456789abcdef"
   ```

2. **Paste the id into `wrangler.toml`** — replace `REPLACE_WITH_KV_ID` in the
   `[[kv_namespaces]]` block with the printed id. Keep `binding = "SCORES"`.

3. **Deploy:**

   ```sh
   wrangler deploy
   ```

4. **Note the URL.** Wrangler prints the deployed Worker URL, e.g.:

   ```
   https://hairline-leaderboard.<your-subdomain>.workers.dev
   ```

   This is your `LB_URL`. In the game client, set the top-of-file constant:

   ```js
   const LB_URL = "https://hairline-leaderboard.<your-subdomain>.workers.dev";
   ```

   (The orchestrator fills the `__LB_URL__` placeholder with this value.)

## API

Base URL = the deployed `workers.dev` URL above.

Board selector via `?board=`:

- absent / anything else → **global** all-time board (key `top10`, permanent)
- `daily` → **today's UTC** board (key `daily:<YYYY-MM-DD>`, auto-expires ~4 days)
- `both` (POST only) → writes to **both** boards in one call (see below)

The daily date is always computed server-side (UTC); the client only flags the mode.

### `GET {LB_URL}/scores`  ·  `GET {LB_URL}/scores?board=daily`

Returns the current top 10 of the selected board, sorted ascending by `error`
(lowest first). GET is single-board only (`daily` or global); `both` has no GET.

```json
{
  "scores": [
    { "name": "ABC", "error": 0.0042, "ts": 1718446899000 }
  ]
}
```

- `name` — 1–3 chars, `A-Z0-9`.
- `error` — angular error in degrees from horizontal (positive float, ≤ 90). Lower is better.
- `ts` — server timestamp (ms epoch) when the score was recorded.

Up to 10 entries; fewer (or `[]`) if the board isn't full yet.

### `POST {LB_URL}/scores`

`Content-Type: application/json`

Request body:

```json
{ "name": "ABC", "error": 0.0042 }
```

Response (`200`):

```json
{
  "scores": [ /* updated top 10 */ ],
  "rank": 1
}
```

- `rank` — 1-based position if the score made the top 10, otherwise `null`.

### `POST {LB_URL}/scores?board=both`

Records ONE score on BOTH today's daily board and the all-time global board in a
single call, under a **single** rate-limit check. Same request body as above.

Response (`200`):

```json
{
  "daily":  { "scores": [ /* today's top 10 */ ],   "rank": 2 },
  "global": { "scores": [ /* all-time top 10 */ ],   "rank": 5 }
}
```

- Each board reports its own `scores` + `rank` (`null` if the score missed that
  board's top 10). The score is saved on both boards regardless of either rank.
- Validation, sanitization, and rate-limiting are identical to the single-board
  POST; the rate-limit counter increments **once** for the dual write.

#### Validation & sanitization

- `name` is sanitized: uppercased, non-`[A-Z0-9]` chars stripped, clamped to 3.
  If nothing valid remains → `400`.
- `error` must be a finite number, `> 0` and `<= 90` → otherwise `400`.
- Malformed / non-JSON body → `400`.
- Unknown path → `404`. `/scores` with a method other than GET/POST/OPTIONS → `405`.

### CORS

- `OPTIONS` preflight is handled (`204`).
- `Access-Control-Allow-Origin: *`, methods `GET,POST,OPTIONS`, header `Content-Type`.
- CORS headers are present on **every** response, including errors.

## Storage model

Single KV namespace (binding `SCORES`), single key `top10` holding the JSON
array. POST does a read-modify-write: read `top10`, insert the new entry, sort
ascending by `error` (ties broken by earliest `ts`), keep the 10 smallest,
write back.

### Caveats (toy-grade by design)

- **Race condition:** KV read-modify-write under eventual consistency means two
  concurrent POSTs can clobber each other (lost update). Acceptable for a
  low-traffic hobby board. The correct-but-heavier fix is a Durable Object that
  serializes access to `top10`.
- **Anti-cheat:** `error` is computed client-side and sent as-is, so scores are
  spoofable. This is an honor-system board with no server-side verification.
