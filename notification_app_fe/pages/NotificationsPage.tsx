import {
  Alert,
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { NotificationCard } from "@/components/NotificationCard";
import { NotificationSkeleton } from "@/components/NotificationSkeleton";
import { useNotificationList } from "@/hooks/useNotifications";
import { NotificationType } from "@/services/types";

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [type, setType] = useState<NotificationType | "">("");
  const { notifications, total, loading, error } = useNotificationList(page, limit, type || undefined);
  const pages = useMemo(() => Math.max(Math.ceil(total / limit), 1), [limit, total]);

  useEffect(() => {
    if (page > pages) {
      setPage(pages);
    }
  }, [page, pages]);

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4">All Notifications</Typography>
        <Typography color="text.secondary">{total} total</Typography>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 260px))" },
          gap: 2
        }}
      >
        <FormControl fullWidth>
          <InputLabel id="type-label">Type</InputLabel>
          <Select
            labelId="type-label"
            label="Type"
            value={type}
            onChange={(event) => {
              setType(event.target.value as NotificationType | "");
              setPage(1);
            }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Placement">Placement</MenuItem>
            <MenuItem value="Result">Result</MenuItem>
            <MenuItem value="Event">Event</MenuItem>
          </Select>
        </FormControl>
        <TextField
          fullWidth
          type="number"
          label="Limit"
          value={limit}
          inputProps={{ min: 1, max: 20 }}
          onChange={(event) => {
            setLimit(Math.min(20, Math.max(1, Number(event.target.value) || 1)));
            setPage(1);
          }}
        />
      </Box>

      {error && <Alert severity="error">{error}</Alert>}
      {loading ? (
        <NotificationSkeleton count={limit} />
      ) : (
        <Stack spacing={2}>
          {notifications.map((notification) => (
            <NotificationCard key={notification.id} notification={notification} />
          ))}
          {notifications.length === 0 && <Alert severity="info">No notifications found.</Alert>}
        </Stack>
      )}

      <Pagination count={pages} page={page} onChange={(_, value) => setPage(value)} color="primary" />
    </Stack>
  );
}
