import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box
} from "@mui/material";

export function NotificationCard({ notification }) {
  const {
    title,
    content,
    type,
    date,
    read
  } = notification;

  return (
    <Card
      sx={{
        mb: 2,
        border: read ? "1px solid #ddd" : "1px solid #1976d2",
        backgroundColor: read ? "#fff" : "#f5f9ff"
      }}
    >
      <CardContent>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <Chip
            label={type}
            size="small"
            color="primary"
          />

          {!read && (
            <Chip
              label="New"
              size="small"
              color="success"
            />
          )}
        </Box>

        <Typography
          variant="h6"
          sx={{ mt: 1 }}
        >
          {title}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 1 }}
        >
          {content}
        </Typography>

        <Typography
          variant="caption"
          sx={{
            display: "block",
            mt: 2
          }}
        >
          {new Date(date).toLocaleString()}
        </Typography>
      </CardContent>
    </Card>
  );
}