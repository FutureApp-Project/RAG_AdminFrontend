import { useContext } from "react";
import { AuthContext } from "../context/AuthContext.tsx";
import { Typography, Box, styled } from "@mui/material";
import { motion } from "framer-motion";
import botDoctor from "../images/botDoctor.png";

import config from "../config.ts";
import AuthorizedPage from "../components/AuthorizedPage.tsx";

/** Home page welcomes the logged-in user. */
export default function Home() {
  const { user } = useContext(AuthContext);
  const isBonn = config.ASSESSMENT_CLINIC_NAME === "Bonn";
  return (
    <AuthorizedPage>
      <WelcomeContainer>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <WelcomeText variant="h4" mb={3} sx={{ color: "#000000" }}>
            <HighlightText>smartCare:</HighlightText>{" "}
            {isBonn
              ? "Das intelligente Klinik-Assistenzsystem"
              : "Das intelligente Pflege-Assistenzsystem"}
          </WelcomeText>
          <Box sx={{ height: 16 }} />
          <WelcomeText variant="h4" mb={3}>
            {config.CLINIC_NAME}
          </WelcomeText>
          <Box
            component="img"
            src={botDoctor}
            sx={{
              display: "block",
              width: "100%",        // takes full available width
              maxWidth: "645px",    // optional: limits size on large screens
              height: "auto",       // keeps proportions correct
              mx: "auto",
              mb: 4,
        }}
          />
          <WelcomeText variant="h4">
            Willkommen <HighlightText>{user?.username}</HighlightText>
          </WelcomeText>
          <IOSSubtitle variant="subtitle1">
            Schön, dass du wieder da bist
          </IOSSubtitle>
        </motion.div>
      </WelcomeContainer>
    </AuthorizedPage>
  );
}

const WelcomeContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "60vh",
  padding: theme.spacing(3),
  background: "linear-gradient(to bottom, #f6f9fc, #ffffff)",
  borderRadius: (theme.shape.borderRadius as number) * 3,
  boxShadow: theme.shadows[2],
  margin: theme.spacing(2),
  [theme.breakpoints.up("md")]: {
    margin: theme.spacing(4),
  },
}));

const WelcomeText = styled(Typography)(() => ({
  color: "#0f2c49", // Primary color
  fontWeight: 600,
  textAlign: "center",
  letterSpacing: "-0.015em",
  textShadow: "0 1px 1px rgba(0,0,0,0.05)",
  fontSize: "clamp(1.5rem, 5vw, 2.5rem)",
}));

const HighlightText = styled("span")(({ theme }) => ({
  color: theme.palette.primary.main,
  fontWeight: 700,
  display: "inline-block",
}));

const IOSSubtitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  textAlign: "center",
  fontWeight: 400,
  letterSpacing: "0.01em",
  opacity: 0.8,
  marginTop: theme.spacing(1),
}));
