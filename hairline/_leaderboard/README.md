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

### `GET {LB_URL}/scores`

Returns the current top 10, sorted ascending by `error` (lowest first).

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
