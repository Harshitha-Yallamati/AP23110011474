import { memo } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Box, Button, Chip, Paper, Stack, Typography } from "@mui/material";
import MarkEmailUnreadIcon from "@mui/icons-material/MarkEmailUnread";
import DraftsIcon from "@mui/icons-material/Drafts";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { Notification } from "@/services/types";

const chipColor = {
  Placement: "success",
  Result: "secondary",
  Event: "primary"
} as const;

function NotificationCardBase({ notification }: { notification: Notification }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        border: "1px solid",
        borderColor: notification.read ? "divider" : "primary.main",
        bgcolor: notification.read ? "background.paper" : "#eef8fb"
      }}
    >
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ xs: "flex-start", sm: "center" }}>
        <Box sx={{ color: notification.read ? "text.secondary" : "primary.main", display: "flex" }}>
          {notification.read ? <DraftsIcon /> : <MarkEmailUnreadIcon />}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Chip size="small" color={chipColor[notification.type]} label={notification.type} />
            {!notification.read && <Chip size="small" variant="outlined" color="primary" label="Unread" />}
          </Stack>
          <Typography variant="subtitle1" sx={{ mt: 1, fontWeight: notification.read ? 500 : 800 }}>
            {notification.message}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(notification.timestamp))}
          </Typography>
        </Box>
        <Button component={RouterLink} to={`/notifications/${notification.id}`} endIcon={<OpenInNewIcon />} variant="outlined">
          Details
        </Button>
      </Stack>
    </Paper>
  );
}

export const NotificationCard = memo(NotificationCardBase);
