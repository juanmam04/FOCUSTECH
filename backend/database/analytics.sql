-- Métricas y tráfico — ejecutar: npm run db:analytics

CREATE TABLE IF NOT EXISTS analytics_sessions (
  id VARCHAR(36) PRIMARY KEY,
  first_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_agent VARCHAR(500),
  referrer TEXT,
  page_views_count INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS page_views (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(36) NOT NULL REFERENCES analytics_sessions(id) ON DELETE CASCADE,
  path VARCHAR(500) NOT NULL,
  referrer TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS analytics_events (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(36) REFERENCES analytics_sessions(id) ON DELETE SET NULL,
  event_type VARCHAR(50) NOT NULL,
  path VARCHAR(500),
  payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_page_views_created ON page_views(created_at);
CREATE INDEX IF NOT EXISTS idx_page_views_session ON page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_path ON page_views(path);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_last_seen ON analytics_sessions(last_seen);
