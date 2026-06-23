import { useState, useEffect } from "react";
import { fetchNotifications } from "../api/notifications";

export function useNotifications(page = 1, filter = "All") {
  const [notifications, setNotifications] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchNotifications(page, filter);
        if (isMounted) {
          setNotifications(data.notifications ?? []);
          setTotal(data.total ?? 0);
          setTotalPages(data.totalPages ?? 0);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Something went wrong while fetching notifications");
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
  }, [page, filter]);

  return { notifications, total, totalPages, loading, error };
}
