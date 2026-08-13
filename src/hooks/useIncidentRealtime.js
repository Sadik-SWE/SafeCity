import { useEffect } from 'react';
import { subscribeToIncidents } from '../services/supabase.js';

/**
 * Custom React hook for subscribing to real-time incident events.
 *
 * @param {Function} onEvent - Callback handler for real-time events ({ eventType, incident, oldIncident })
 * @param {Array} deps - Dependency array for re-subscribing if needed
 */
export function useIncidentRealtime(onEvent, deps = []) {
  useEffect(() => {
    if (typeof onEvent !== 'function') return;

    const unsubscribe = subscribeToIncidents((eventData) => {
      try {
        onEvent(eventData);
      } catch (err) {
        console.warn('Error handling real-time incident event:', err);
      }
    });

    return () => {
      unsubscribe();
    };
  }, deps);
}

export default useIncidentRealtime;
