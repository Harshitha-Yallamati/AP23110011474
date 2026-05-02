import { Paper, Skeleton, Stack } from "@mui/material";

export function NotificationSkeleton({ count = 4 }: { count?: number }) {
  return (
    <Stack spacing={2}>
      {Array.from({ length: count }).map((_, index) => (
        <Paper key={index} elevation={0} sx={{ p: 2, border: "1px solid", borderColor: "divider" }}>
          <Skeleton width={140} height={28} />
          <Skeleton width="80%" height={32} />
          <Skeleton width={220} />
        </Paper>
      ))}
    </Stack>
  );
}
