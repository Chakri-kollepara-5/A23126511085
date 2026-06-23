import { Card, CardContent, Typography, Box, Chip } from "@mui/material";
import WorkIcon from "@mui/icons-material/Work";
import AssessmentIcon from "@mui/icons-material/Assessment";
import EventIcon from "@mui/icons-material/Event";
import FiberNewIcon from "@mui/icons-material/FiberNew";

export function NotificationCard({ notification }) {
  const { title, content, type, date, read } = notification;

  const getTypeIcon = () => {
    switch (type) {
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
    switch (type) {
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

  const formattedDate = new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 2,
        borderColor: read ? "divider" : "primary.light",
        borderWidth: read ? 1 : 1.5,
        backgroundColor: read ? "background.paper" : "action.hover",
        boxShadow: read ? "none" : "0 2px 8px rgba(25, 118, 210, 0.08)",
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
                backgroundColor: read ? "action.selected" : "primary.light",
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
                fontWeight={read ? 600 : 700}
                color="text.primary"
                component="div"
              >
                {title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {content}
              </Typography>
            </Box>
          </Box>
          <Box display="flex" flexDirection="column" alignItems="flex-end" gap={1}>
            <Chip
              label={type}
              size="small"
              color={getTypeColor()}
              variant={read ? "outlined" : "filled"}
              sx={{ fontWeight: 600, fontSize: "0.75rem" }}
            />
            <Typography variant="caption" color="text.disabled" sx={{ whiteSpace: "nowrap" }}>
              {formattedDate}
            </Typography>
            {!read && (
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
