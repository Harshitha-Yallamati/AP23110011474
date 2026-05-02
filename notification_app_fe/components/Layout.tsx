import { Link as RouterLink, useLocation } from "react-router-dom";
import { AppBar, Box, Button, Container, Toolbar, Typography } from "@mui/material";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import DashboardIcon from "@mui/icons-material/Dashboard";
import InboxIcon from "@mui/icons-material/Inbox";
import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar position="sticky" color="inherit" elevation={1}>
        <Toolbar sx={{ gap: 1.5, minHeight: 68, flexWrap: "wrap" }}>
          <NotificationsActiveIcon color="primary" />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 800 }}>
            Campus Notifications
          </Typography>
          <Button
            component={RouterLink}
            to="/"
            startIcon={<DashboardIcon />}
            variant={location.pathname === "/" ? "contained" : "text"}
          >
            Dashboard
          </Button>
          <Button
            component={RouterLink}
            to="/notifications"
            startIcon={<InboxIcon />}
            variant={location.pathname.startsWith("/notifications") ? "contained" : "text"}
          >
            Inbox
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
        {children}
      </Container>
    </Box>
  );
}
