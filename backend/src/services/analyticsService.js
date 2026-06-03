import pool from '../config/db.js';

const SKIP_PATH_PREFIXES = ['/panel', '/acceso', '/api'];

export function shouldTrackPath(path) {
  if (!path || typeof path !== 'string') return false;
  return !SKIP_PATH_PREFIXES.some((p) => path.startsWith(p));
}

export async function recordPageView({ sessionId, path, referrer, userAgent }) {
  if (!shouldTrackPath(path)) return;

  await pool.query(
    `INSERT INTO analytics_sessions (id, user_agent, referrer, page_views_count)
     VALUES (?, ?, ?, 1)
     ON CONFLICT (id) DO UPDATE SET
       last_seen = NOW(),
       page_views_count = analytics_sessions.page_views_count + 1,
       user_agent = COALESCE(EXCLUDED.user_agent, analytics_sessions.user_agent)`,
    [sessionId, userAgent?.slice(0, 500) || null, referrer || null]
  );

  const [recent] = await pool.query(
    `SELECT id FROM page_views
     WHERE session_id = ? AND path = ? AND created_at > NOW() - INTERVAL '10 seconds'
     LIMIT 1`,
    [sessionId, path]
  );
  if (recent.length) return;

  await pool.query(
    'INSERT INTO page_views (session_id, path, referrer) VALUES (?, ?, ?)',
    [sessionId, path.slice(0, 500), referrer || null]
  );
}

export async function recordEvent({ sessionId, eventType, path, payload }) {
  await pool.query(
    'INSERT INTO analytics_events (session_id, event_type, path, payload) VALUES (?, ?, ?, ?)',
    [
      sessionId || null,
      eventType,
      path?.slice(0, 500) || null,
      payload || null,
    ]
  );
}
