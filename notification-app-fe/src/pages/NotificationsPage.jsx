import { useState } from "react";
import {
  Alert,
  Badge,
  Box,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";

import { NotificationCard } from "../components/NotificationCard";
import { NotificationFilter } from "../components/NotificationFilter";
import { useNotifications } from "../hooks/useNotifications";

export function NotificationsPage() {
  const [filter, setFilter] = useState("All");
  const [topN, setTopN] = useState("All");

  const { notifications, loading, error } = useNotifications(topN, filter);

  // Derive unread count dynamically
  const unreadCount = notifications.filter((n) => {
    const read = n.read !== undefined 
      ? n.read 
      : (n.isRead !== undefined 
        ? n.isRead 
        : (n.is_read !== undefined ? n.is_read : true));
    return !read;
  }).length;

  const handleFilterChange = (event, newFilter) => {
    if (newFilter !== null) {
      setFilter(newFilter);
    }
  };

  const handleTopNChange = (event) => {
    setTopN(event.target.value);
  };

  return (
    <Box sx={{ maxWidth: 720, mx: "auto", px: 2, py: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Badge badgeContent={unreadCount} color="primary" max={99}>
            <NotificationsIcon sx={{ fontSize: 28 }} />
          </Badge>
          <Typography variant="h5" fontWeight={700}>
            Notifications
          </Typography>
        </Stack>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="top-n-select-label">Top N</InputLabel>
          <Select
            labelId="top-n-select-label"
            id="top-n-select"
            value={topN}
            label="Top N"
            onChange={handleTopNChange}
          >
            <MenuItem value="All">All Items</MenuItem>
            <MenuItem value="3">Top 3</MenuItem>
            <MenuItem value="5">Top 5</MenuItem>
            <MenuItem value="10">Top 10</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      <Divider sx={{ mb: 3 }} />

      <Box sx={{ marginBottom: 3 }}>
        <NotificationFilter value={filter} onChange={handleFilterChange} />
      </Box>

      {loading && (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      )}

      {!loading && error && (
        <Alert severity="error">Failed to load notifications: {error}</Alert>
      )}

      {!loading && !error && notifications.length === 0 && (
        <Alert severity="info">No notifications found.</Alert>
      )}

      {!loading && !error && notifications.length > 0 && (
        <Stack spacing={1.5}>
          {notifications.map((n, idx) => (
            <NotificationCard key={n.id || n.notificationId || idx} notification={n} />
          ))}
        </Stack>
      )}
    </Box>
  );
}
