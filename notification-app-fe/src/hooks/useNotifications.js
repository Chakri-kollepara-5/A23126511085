import { useState, useEffect } from "react";
import { fetchNotifications } from "../api/notifications";

const TYPE_WEIGHTS = {
  Placement: 100,
  Result: 80,
  Event: 50
};

function calculatePriorityScore(notification) {
  const type = notification.type || notification.category || "Event";
  const weight = TYPE_WEIGHTS[type] !== undefined ? TYPE_WEIGHTS[type] : 50;

  const dateStr = notification.created_at || notification.date || notification.createdAt;
  if (!dateStr) {
    return weight;
  }

  const createdTime = new Date(dateStr).getTime();
  const now = Date.now();
  const ageInHours = Math.max(0, (now - createdTime) / (1000 * 60 * 60));

  // Recency score starts at 100 and drops by 1 point per hour down to a minimum of 0
  const recencyScore = Math.max(0, 100 - ageInHours);

  return weight + recencyScore;
}

export function useNotifications(topN = "All", filter = "All") {
  const [rawNotifications, setRawNotifications] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchNotifications();
        let items = [];
        if (Array.isArray(data)) {
          items = data;
        } else if (data && Array.isArray(data.notifications)) {
          items = data.notifications;
        }
        
        if (isMounted) {
          setRawNotifications(items);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Failed to load notifications");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    // Process priority scores
    let processed = rawNotifications.map((n) => ({
      ...n,
      priorityScore: calculatePriorityScore(n)
    }));

    // Filter by type
    if (filter !== "All") {
      processed = processed.filter(
        (n) => (n.type || n.category || "").toLowerCase() === filter.toLowerCase()
      );
    }

    // Sort by Priority Score descending
    processed.sort((a, b) => b.priorityScore - a.priorityScore);

    // Limit to Top N
    if (topN !== "All") {
      const limit = parseInt(topN, 10);
      if (!isNaN(limit)) {
        processed = processed.slice(0, limit);
      }
    }

    setNotifications(processed);
  }, [rawNotifications, topN, filter]);

  return { notifications, loading, error };
}
