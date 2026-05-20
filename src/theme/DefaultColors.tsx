import { grey } from "@mui/material/colors";

const baselightTheme = {
  direction: "ltr",
  palette: {
    primary: {
      main: "#2196f3", // A shade of blue
      light: "#ffffff",
      dark: "#CC3A22", // Adjusted for new main
    },
    secondary: {
      main: "#49BEFF", // Kept original, but consider if this still works well
      light: "#E8F7FF",
      dark: "#23afdb",
    },
    success: {
      main: "#13DEB9", // Kept original
      light: "#E6FFFA",
      dark: "#02b3a9",
      contrastText: "#ffffff",
    },
    info: {
      main: "#2979ff", // A brighter blue
      light: "#EBF3FE",
      dark: "#1682d4",
      contrastText: "#ffffff",
    },
    error: {
      main: "#df1c40",
      light: "#FDEDF1",
      dark: "#C91A3A",
      contrastText: "#ffffff",
    },
    warning: {
      main: "#FFAE1F", // Kept original
      light: "#FEF5E5",
      dark: "#ae8e59",
      contrastText: "#ffffff",
    },
    purple: {
      A50: "#EBF3FE",
      A100: "#6610f2",
      A200: "#557fb9",
    },
    grey: {
      100: "#F2F6FA",
      200: "#EAEFF4",
      300: "#DFE5EF",
      400: "#7C8FAC",
      500: "#5A6A85",
      600: "#2A3547",
    },
    text: {
      primary: "#2A3547",
      secondary: "#5A6A85",
    },
    action: {
      disabledBackground: "rgba(73,82,88,0.12)",
      hoverOpacity: 0.02,
      hover: "#f6f9fc",
    },
    divider: "#ebf1f6",
    icons: {
      primary: "#5A6A85",
    },
  },
};

const baseDarkTheme = {
  direction: "ltr",
  palette: {
    primary: {
      main: "#90caf9", // A light blue
      light: "#ffffff",
      dark: "#CC3A22", // Adjusted for new main
    },
    secondary: {
      main: "#777e89", // Kept original
      light: "#1C455D",
      dark: "#173f98",
    },
    success: {
      main: "#13DEB9", // Kept original
      light: "#1B3C48",
      dark: "#02b3a9",
      contrastText: "#ffffff",
    },
    info: {
      main: "#539BFF", // Kept original
      light: "#223662",
      dark: "#1682d4",
      contrastText: "#ffffff",
    },
    error: {
      main: "#df1c40",
      light: "#4d1f2a",
      dark: "#C91A3A",
      contrastText: "#ffffff",
    },
    warning: {
      main: "#FFAE1F", // Kept original
      light: "#4D3A2A",
      dark: "#ae8e59",
      contrastText: "#ffffff",
    },
    purple: {
      A50: "#EBF3FE",
      A100: "#6610f2",
      A200: "#557fb9",
    },
    grey: {
      100: "#333F55",
      200: "#465670",
      300: "#7C8FAC",
      400: "#DFE5EF",
      500: "#EAEFF4",
      600: "#F2F6FA",
    },
    text: {
      primary: "#EAEFF4",
      secondary: "#7C8FAC",
    },
    action: {
      disabledBackground: "rgba(73,82,88,0.12)",
      hoverOpacity: 0.02,
      hover: "#333F55",
    },
    divider: grey[100],
    background: {
      default: "#171c23",
      dark: "#171c23",
      paper: "#171c23",
    },
    icons: {
      primary: "#7C8FAC",
    },
  },
};

declare module '@mui/material/styles' {
  interface Palette {
    icons: {
      primary: string;
    };
  }
}

export { baseDarkTheme, baselightTheme };
