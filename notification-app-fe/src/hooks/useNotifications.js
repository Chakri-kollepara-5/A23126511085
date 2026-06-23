import { useState, useEffect } from "react";
import { fetchEvaluationNotifications, fetchLocalNotifications } from "../api/notifications";

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

  const recencyScore = Math.max(0, 100 - ageInHours);
  return weight + recencyScore;
}

export function useNotifications(mode = "all", page = 1, filter = "All", topN = "All") {
  const [notifications, setNotifications] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        if (mode === "priority") {
          // Priority Mode: Fetch all evaluation notifications, score, filter, sort, and slice
          const data = await fetchEvaluationNotifications();
          let items = Array.isArray(data) ? data : (data?.notifications || []);
          
          let processed = items.map((n) => ({
            ...n,
            priorityScore: calculatePriorityScore(n)
          }));

          if (filter !== "All") {
            processed = processed.filter(
              (n) => (n.type || n.category || "").toLowerCase() === filter.toLowerCase()
            );
          }

          // Sort by score (descending)
          processed.sort((a, b) => b.priorityScore - a.priorityScore);

          // Slice Top N
          if (topN !== "All") {
            const limit = parseInt(topN, 10);
            if (!isNaN(limit)) {
              processed = processed.slice(0, limit);
            }
          }

          if (isMounted) {
            setNotifications(processed);
            setTotalPages(1); // No pagination pages needed for top priority list
          }
        } else {
          // Standard Mode: Fetch paginated items from local backend/fallback
          const data = await fetchLocalNotifications(page, filter);
          if (isMounted) {
            setNotifications(data.notifications || []);
            setTotalPages(data.totalPages || 0);
          }
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
  }, [mode, page, filter, topN]);

  return { notifications, totalPages, loading, error };
}
