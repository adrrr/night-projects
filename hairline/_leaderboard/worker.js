// Hairline global leaderboard — Cloudflare Worker (module syntax).
//
// Metric: `error` is the player's angular error in DEGREES from horizontal.
//   Positive float; 0 is theoretically perfect but unreachable; max ~90.
//   LOWER IS BETTER. The board keeps the 10 SMALLEST errors.
//
// Storage: one KV namespace (binding SCORES).
//   - Global all-time board: single key "top10" holding a JSON array of
//     { name, error, ts } objects, sorted ascending by error.
//   - Daily boards: one key per UTC date, "daily:<YYYY-MM-DD>", same shape,
//     written with a short expirationTtl so old days auto-expire. Selected via
//     the "?board=daily" query param. The server ALWAYS computes the date as its
//     own UTC-today; a client cannot target another day's board (no stuffing).
//
// --- Concurrency note (KV read-modify-write race) ---------------------------
// POST does read("top10") -> mutate -> write("top10"). Under KV's eventual
// consistency two concurrent POSTs can each read the same snapshot and the
// second write clobbers the first (a lost update). That is acceptable for a
// toy hobby leaderboard with low write volume. The correct-but-heavier fix is
// a single Durable Object that serializes all reads/writes for "top10" (strong
// consistency, no lost updates) — not worth the complexity here.
//
// --- Anti-cheat note --------------------------------------------------------
// The `error` is computed client-side and POSTed as-is, so it is trivially
// spoofable. This board is honor-system only; there is no server-side replay
// or verification.

const KV_KEY = "top10";
const MAX_ENTRIES = 10;

// Daily boards live under "daily:<YYYY-MM-DD>" (UTC) and auto-expire a few days
// after their date so old keys don't accumulate. 4 days = today + a small grace
// margin (a board written near UTC-midnight stays readable through its full day).
const DAILY_PREFIX = "daily:";
const DAILY_TTL_SEC = 4 * 24 * 60 * 60; // ~4 days

// Today's date in UTC as "YYYY-MM-DD". Computed server-side ONLY — never trust a
// client-supplied date, or anyone could stuff past/future boards.
function utcDateKey(now = Date.now()) {
  return new Date(now).toISOString().slice(0, 10); // ISO is always UTC
}

// The KV key for a given board mode. mode === "daily" -> today's daily key,
// anything else -> the all-time global key. Date is server-computed.
function boardKey(mode) {
  return mode === "daily" ? DAILY_PREFIX + utcDateKey() : KV_KEY;
}

// Per-IP write rate-limit (anti-griefing). The board has only 10 slots and the
// score is client-supplied, so without this a single curl-loop could flood
// sub-degree fakes and permanently evict every real score. This is a coarse
// deterrent, not bulletproof (KV is eventually consistent; IPs can be rotated)
// — it just raises the bar from a trivial wipe. GET/reads are never limited.
const RL_WINDOW_SEC = 60; // KV minimum TTL is 60s
const RL_MAX = 30;        // max POSTs per IP per active 60s streak (generous for real play; only stops floods)

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};

// Every response (success AND error AND preflight) carries CORS headers.
function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}

// name: 1-3 chars, uppercase A-Z and 0-9 only.
// Sanitize: uppercase -> strip everything not [A-Z0-9] -> clamp to 3 chars.
// Returns "" if nothing valid remains (caller rejects empty with 400).
function sanitizeName(raw) {
  if (typeof raw !== "string") return "";
  return raw.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 3);
}

// error: must be a finite number, > 0 and <= 90.
function isValidError(v) {
  return typeof v === "number" && Number.isFinite(v) && v > 0 && v <= 90;
}

// Per-IP write rate-limit, backed by the same KV namespace under an "rl:" key
// prefix. Each POST increments a per-IP counter with a 60s TTL; once it reaches
// RL_MAX the IP is blocked until it goes quiet for the window. Fails OPEN if the
// counter write errors (never block legitimate play over an infra hiccup).
async function rateLimited(request, env) {
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const key = "rl:" + ip;
  let n = 0;
  try {
    n = parseInt((await env.SCORES.get(key)) || "0", 10) || 0;
  } catch {
    return false; // can't read the counter -> fail open
  }
  if (n >= RL_MAX) return true;
  try {
    await env.SCORES.put(key, String(n + 1), { expirationTtl: RL_WINDOW_SEC });
  } catch {
    /* counter write failed -> fail open */
  }
  return false;
}

// Read the current board from KV under `key`. Tolerates missing/corrupt data by
// treating it as an empty board (never throws on bad stored JSON).
async function readBoard(env, key) {
  const raw = await env.SCORES.get(key);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Self-healing: drop malformed/legacy entries so the sort comparator can
    // never hit NaN (a corrupt stored value can't break the board).
    return parsed.filter(
      (e) =>
        e &&
        typeof e.name === "string" &&
        Number.isFinite(e.error) &&
        Number.isFinite(e.ts)
    );
  } catch {
    return [];
  }
}

// Sort ascending by error; ties broken by earliest ts (smaller ts first).
function sortBoard(board) {
  return board.slice().sort((a, b) => {
    if (a.error !== b.error) return a.error - b.error;
    return a.ts - b.ts;
  });
}

async function handleGet(env, mode) {
  const key = boardKey(mode);
  const board = sortBoard(await readBoard(env, key)).slice(0, MAX_ENTRIES);
  return json({ scores: board });
}

async function handlePost(request, env, mode) {
  // Per-IP write rate-limit (anti-griefing) — checked before parsing the body.
  if (await rateLimited(request, env)) {
    return json({ error: "Rate limit exceeded. Try again shortly." }, 429);
  }

  // Malformed / non-JSON body -> 400.
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Malformed JSON body" }, 400);
  }

  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return json({ error: "Body must be a JSON object" }, 400);
  }

  const name = sanitizeName(body.name);
  if (name.length === 0) {
    return json({ error: "Invalid name: 1-3 chars A-Z0-9 required" }, 400);
  }

  if (!isValidError(body.error)) {
    return json({ error: "Invalid error: finite number, >0 and <=90 required" }, 400);
  }

  const entry = { name, error: body.error, ts: Date.now() };

  // Read-modify-write (see concurrency note at top of file). The board key is
  // server-computed (boardKey): a daily POST always lands on TODAY's UTC board,
  // never a client-chosen date.
  const key = boardKey(mode);
  const board = await readBoard(env, key);
  board.push(entry);
  const sorted = sortBoard(board).slice(0, MAX_ENTRIES);

  // Daily keys auto-expire after a few days; the global key is permanent.
  const putOpts = mode === "daily" ? { expirationTtl: DAILY_TTL_SEC } : undefined;
  await env.SCORES.put(key, JSON.stringify(sorted), putOpts);

  // 1-based rank if this exact entry survived into the top 10, else null.
  const idx = sorted.indexOf(entry);
  const rank = idx === -1 ? null : idx + 1;

  return json({ scores: sorted, rank });
}

export default {
  async fetch(request, env) {
    // Top-level try/catch: never throw an unhandled error; always answer with CORS.
    try {
      const url = new URL(request.url);
      const { pathname } = url;

      // CORS preflight for any path.
      if (request.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: CORS_HEADERS });
      }

      if (pathname === "/scores") {
        // Board selector: "?board=daily" -> today's UTC daily board, anything
        // else (incl. absent) -> the all-time global board. The daily DATE is
        // always server-computed; only this mode flag is read from the client.
        const mode = url.searchParams.get("board") === "daily" ? "daily" : "global";
        // NOTE: await is load-bearing. Without it, an async error inside
        // handleGet/handlePost (e.g. a KV get/put failure) escapes this
        // try/catch — fetch returns a rejected promise and Cloudflare emits a
        // generic 500 WITHOUT CORS headers (unreadable from the browser).
        if (request.method === "GET") return await handleGet(env, mode);
        if (request.method === "POST") return await handlePost(request, env, mode);
        return json({ error: "Method not allowed" }, 405);
      }

      return json({ error: "Not found" }, 404);
    } catch (err) {
      return json({ error: "Internal error" }, 500);
    }
  },
};
