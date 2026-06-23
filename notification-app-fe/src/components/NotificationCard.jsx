import { Card, CardContent, Typography, Box, Chip } from "@mui/material";
import WorkIcon from "@mui/icons-material/Work";
import AssessmentIcon from "@mui/icons-material/Assessment";
import EventIcon from "@mui/icons-material/Event";
import FiberNewIcon from "@mui/icons-material/FiberNew";
import SpeedIcon from "@mui/icons-material/Speed";

export function NotificationCard({ notification }) {
  const {
    title,
    content,
    message,
    text,
    type,
    category,
    date,
    created_at,
    createdAt,
    read,
    isRead,
    is_read,
    priorityScore
  } = notification;

  const displayTitle = title || "No Title";
  const displayContent = content || message || text || "";
  const displayType = type || category || "Event";
  const displayRawDate = created_at || date || createdAt;
  
  const isNotificationRead = read !== undefined 
    ? read 
    : (isRead !== undefined 
      ? isRead 
      : (is_read !== undefined ? is_read : true));

  const getTypeIcon = () => {
    switch (displayType) {
      case "Placement":
        return <WorkIcon fontSize="small" sx={{ color: "success.main" }} />;
      case "Result":
        return <AssessmentIcon fontSize="small" sx={{ color: "info.main" }} />;
      case "Event":
        return <EventIcon fontSize="small" sx={{ color: "warning.main" }} />;
      default:
        return <EventIcon fontSize="small" />;
    }
  };

  const getTypeColor = () => {
    switch (displayType) {
      case "Placement":
        return "success";
      case "Result":
        return "info";
      case "Event":
        return "warning";
      default:
        return "default";
    }
  };

  // Safe date parsing and formatting
  let formattedDate = "Recent";
  if (displayRawDate) {
    const parsedDate = new Date(displayRawDate);
    if (!isNaN(parsedDate.getTime())) {
      formattedDate = parsedDate.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      formattedDate = String(displayRawDate);
    }
  } else {
    formattedDate = new Date().toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 2,
        borderColor: isNotificationRead ? "divider" : "primary.light",
        borderWidth: isNotificationRead ? 1 : 1.5,
        backgroundColor: isNotificationRead ? "background.paper" : "action.hover",
        boxShadow: isNotificationRead ? "none" : "0 2px 8px rgba(25, 118, 210, 0.08)",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
          borderColor: "primary.main",
        },
      }}
    >
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={2}>
          <Box display="flex" gap={1.5} alignItems="flex-start">
            <Box
              sx={{
                p: 1,
                borderRadius: "50%",
                backgroundColor: isNotificationRead ? "action.selected" : "primary.light",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {getTypeIcon()}
            </Box>
            <Box>
              <Typography
                variant="subtitle1"
                fontWeight={isNotificationRead ? 600 : 700}
                color="text.primary"
                component="div"
              >
                {displayTitle}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {displayContent}
              </Typography>
            </Box>
          </Box>
          <Box display="flex" flexDirection="column" alignItems="flex-end" gap={1}>
            <Box display="flex" gap={0.5} alignItems="center">
              {priorityScore !== undefined && (
                <Chip
                  icon={<SpeedIcon style={{ fontSize: 14 }} />}
                  label={`Score: ${priorityScore.toFixed(1)}`}
                  size="small"
                  variant="outlined"
                  color="secondary"
                  sx={{
                    height: 20,
                    fontWeight: 700,
                    fontSize: "0.7rem",
                    "& .MuiChip-icon": { ml: 0.5, mr: -0.2 }
                  }}
                />
              )}
              <Chip
                label={displayType}
                size="small"
                color={getTypeColor()}
                variant={isNotificationRead ? "outlined" : "filled"}
                sx={{ fontWeight: 600, fontSize: "0.75rem", height: 20 }}
              />
            </Box>
            <Typography variant="caption" color="text.disabled" sx={{ whiteSpace: "nowrap" }}>
              {formattedDate}
            </Typography>
            {!isNotificationRead && (
              <Chip
                icon={<FiberNewIcon />}
                label="New"
                size="small"
                color="primary"
                sx={{ height: 20, "& .MuiChip-label": { px: 1 } }}
              />
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}