import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#145c72"
    },
    secondary: {
      main: "#8a4b16"
    },
    background: {
      default: "#f7f8fa",
      paper: "#ffffff"
    },
    success: {
      main: "#2d7a46"
    }
  },
  shape: {
    borderRadius: 8
  },
  typography: {
    fontFamily: "Inter, Arial, sans-serif",
    h4: {
      fontWeight: 700
    },
    h5: {
      fontWeight: 700
    },
    button: {
      textTransform: "none",
      fontWeight: 700
    }
  }
});
