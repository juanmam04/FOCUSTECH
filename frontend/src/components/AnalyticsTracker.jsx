import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPage } from '../utils/track';

export default function AnalyticsTracker() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    trackPage(pathname + search);
  }, [pathname, search]);

  return null;
}
