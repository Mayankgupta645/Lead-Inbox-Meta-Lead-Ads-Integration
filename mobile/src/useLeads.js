import { useCallback, useEffect, useRef, useState } from 'react';
import { LayoutAnimation } from 'react-native';
import { io } from 'socket.io-client';
import { API_URL, NEW_LEAD_EVENT } from './config';
import { fetchLeads, normalizeLead } from './api';

const newestFirst = (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

export default function useLeads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connected, setConnected] = useState(false);
  const [arrived, setArrived] = useState(0); // leads that came in while the app was open
  const seen = useRef(new Set()); // ids we already know about

  const load = useCallback(async () => {
    try {
      setError(null);
      const list = await fetchLeads();
      list.forEach((l) => seen.current.add(l.id));
      setLeads((current) => {
        const merged = new Map(current.map((lead) => [lead.id, lead]));
        list.forEach((lead) => {
          const currentLead = merged.get(lead.id);
          merged.set(lead.id, currentLead ? { ...lead, isNew: currentLead.isNew } : lead);
        });
        return Array.from(merged.values()).sort(newestFirst);
      });
    } catch (e) {
      setError(e.message || 'Unable to load leads');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();

    const socket = io(API_URL, { transports: ['websocket'], reconnectionDelay: 1000 });

    socket.on('connect', () => {
      setConnected(true);
      load(); // catch anything we missed while offline
    });
    socket.on('disconnect', () => setConnected(false));
    socket.on('connect_error', () => setConnected(false));

    socket.on(NEW_LEAD_EVENT, (payload) => {
      let lead;
      try {
        lead = { ...normalizeLead(payload), isNew: true };
      } catch (e) {
        setError(e.message || 'The server sent an invalid lead');
        return;
      }

      // reconnects can replay an event, don't show the same lead twice
      if (seen.current.has(lead.id)) return;
      seen.current.add(lead.id);

      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setLeads((current) => [lead, ...current].sort(newestFirst));
      setArrived((n) => n + 1);
    });

    return () => socket.disconnect();
  }, [load]);

  return { leads, loading, error, connected, arrived, refresh: load };
}
