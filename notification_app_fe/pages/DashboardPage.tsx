import { Alert, Box, Paper, Stack, TextField, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import { NotificationCard } from "@/components/NotificationCard";
import { NotificationSkeleton } from "@/components/NotificationSkeleton";
import { usePriorityNotifications } from "@/hooks/useNotifications";

export default function DashboardPage() {
  const [limit, setLimit] = useState(10);
  const { notifications, loading, error, unreadCount } = usePriorityNotifications(limit);
  const placementCount = useMemo(
    () => notifications.filter((notification) => notification.type === "Placement").length,
    [notifications]
  );

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4">Dashboard</Typography>
        <Typography color="text.secondary">Priority notifications</Typography>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" },
          gap: 2
        }}
      >
        <Paper elevation={0} sx={{ p: 2, border: "1px solid", borderColor: "divider" }}>
          <Typography variant="body2" color="text.secondary">Unread</Typography>
          <Typography variant="h4">{unreadCount}</Typography>
        </Paper>
        <Paper elevation={0} sx={{ p: 2, border: "1px solid", borderColor: "divider" }}>
          <Typography variant="body2" color="text.secondary">Placement</Typography>
          <Typography variant="h4">{placementCount}</Typography>
        </Paper>
        <TextField
          fullWidth
          type="number"
          label="Top N"
          value={limit}
          inputProps={{ min: 1, max: 25 }}
          onChange={(event) => setLimit(Math.min(25, Math.max(1, Number(event.target.value) || 1)))}
        />
      </Box>

      {error && <Alert severity="error">{error}</Alert>}
      {loading ? (
        <NotificationSkeleton />
      ) : (
        <Stack spacing={2}>
          {notifications.map((notification) => (
            <NotificationCard key={notification.id} notification={notification} />
          ))}
          {notifications.length === 0 && <Alert severity="info">No notifications found.</Alert>}
        </Stack>
      )}
    </Stack>
  );
}
