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
  Tab,
  Tabs,
  Typography,
  Pagination,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";

import { NotificationCard } from "../components/NotificationCard";
import { NotificationFilter } from "../components/NotificationFilter";
import { useNotifications } from "../hooks/useNotifications";

export function NotificationsPage() {
  const [currentTab, setCurrentTab] = useState(0); // 0 = All Notifications, 1 = Priority Feed
  const [filter, setFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [topN, setTopN] = useState("All");

  const mode = currentTab === 0 ? "all" : "priority";
  const { notifications, totalPages, loading, error } = useNotifications(mode, page, filter, topN);

  // Derive unread count dynamically
  const unreadCount = notifications.filter((n) => {
    const read = n.read !== undefined 
      ? n.read 
      : (n.isRead !== undefined 
        ? n.isRead 
        : (n.is_read !== undefined ? n.is_read : true));
    return !read;
  }).length;

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
    setFilter("All");
    setPage(1);
    setTopN("All");
  };

  const handleFilterChange = (event, newFilter) => {
    if (newFilter !== null) {
      setFilter(newFilter);
      setPage(1);
    }
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleTopNChange = (event) => {
    setTopN(event.target.value);
  };

  return (
    <Box sx={{ maxWidth: 720, mx: "auto", px: 2, py: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Badge badgeContent={unreadCount} color="primary" max={99}>
            <NotificationsIcon sx={{ fontSize: 28 }} />
          </Badge>
          <Typography variant="h5" fontWeight={700}>
            Notifications Portal
          </Typography>
        </Stack>

        {currentTab === 1 && (
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
        )}
      </Stack>

      <Tabs 
        value={currentTab} 
        onChange={handleTabChange} 
        variant="fullWidth" 
        sx={{ mb: 3, borderBottom: 1, borderColor: "divider" }}
      >
        <Tab label="All Notifications" sx={{ fontWeight: 600 }} />
        <Tab label="Priority Feed" sx={{ fontWeight: 600 }} />
      </Tabs>

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

      {!loading && currentTab === 0 && totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            shape="rounded"
          />
        </Box>
      )}
    </Box>
  );
}
