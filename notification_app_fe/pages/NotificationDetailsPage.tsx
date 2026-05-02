import { Link as RouterLink, useParams } from "react-router-dom";
import { Alert, Box, Button, Chip, Paper, Skeleton, Stack, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import MarkEmailUnreadIcon from "@mui/icons-material/MarkEmailUnread";
import { useNotificationDetails } from "@/hooks/useNotifications";

export default function NotificationDetailsPage() {
  const { id } = useParams();
  const { notification, loading, error, toggleRead } = useNotificationDetails(id);

  return (
    <Stack spacing={3}>
      <Button component={RouterLink} to="/notifications" startIcon={<ArrowBackIcon />} sx={{ alignSelf: "flex-start" }}>
        Back
      </Button>

      {error && <Alert severity="error">{error}</Alert>}
      {loading ? (
        <Paper elevation={0} sx={{ p: 3, border: "1px solid", borderColor: "divider" }}>
          <Skeleton width={140} height={32} />
          <Skeleton width="85%" height={48} />
          <Skeleton width={260} />
        </Paper>
      ) : notification ? (
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 4 },
            border: "1px solid",
            borderColor: notification.read ? "divider" : "primary.main",
            bgcolor: notification.read ? "background.paper" : "#eef8fb"
          }}
        >
          <Stack spacing={2}>
            <Box>
              <Chip
                label={notification.type}
                color={notification.type === "Placement" ? "success" : notification.type === "Result" ? "secondary" : "primary"}
              />
              {!notification.read && <Chip sx={{ ml: 1 }} label="Unread" variant="outlined" color="primary" />}
            </Box>
            <Typography variant="h5">{notification.message}</Typography>
            <Typography color="text.secondary">
              {new Intl.DateTimeFormat("en", { dateStyle: "full", timeStyle: "medium" }).format(new Date(notification.timestamp))}
            </Typography>
            <Button
              onClick={toggleRead}
              startIcon={notification.read ? <MarkEmailUnreadIcon /> : <MarkEmailReadIcon />}
              variant="contained"
              sx={{ alignSelf: "flex-start" }}
            >
              Mark as {notification.read ? "Unread" : "Read"}
            </Button>
          </Stack>
        </Paper>
      ) : (
        <Alert severity="warning">Notification not found.</Alert>
      )}
    </Stack>
  );
}
