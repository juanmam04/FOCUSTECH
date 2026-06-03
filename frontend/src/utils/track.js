import api from '../api/client';
import { getAnalyticsSessionId } from './analyticsSession';

export function trackPage(path) {
  const sessionId = getAnalyticsSessionId();
  if (!sessionId || !path) return;
  api
    .post('/analytics/track', {
      session_id: sessionId,
      path,
      referrer: document.referrer || undefined,
    })
    .catch(() => {});
}

export function trackEvent(eventType, path, payload) {
  const sessionId = getAnalyticsSessionId();
  if (!sessionId) return;
  api
    .post('/analytics/track', {
      session_id: sessionId,
      path: path || window.location.pathname,
      event_type: eventType,
      payload,
    })
    .catch(() => {});
}
