import { recordEvent, recordPageView } from '../services/analyticsService.js';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function track(req, res, next) {
  try {
    const { session_id: sessionId, path, referrer, event_type: eventType, payload } = req.body;

    if (!sessionId || !UUID_RE.test(sessionId)) {
      return res.status(400).json({ success: false, message: 'session_id inválido' });
    }
    if (!path) {
      return res.status(400).json({ success: false, message: 'path requerido' });
    }

    const userAgent = req.headers['user-agent'];

    if (eventType) {
      await recordEvent({
        sessionId,
        eventType: String(eventType).slice(0, 50),
        path,
        payload,
      });
    } else {
      await recordPageView({
        sessionId,
        path,
        referrer: referrer || req.headers.referer,
        userAgent,
      });
    }

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}
