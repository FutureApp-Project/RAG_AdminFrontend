import type { FC } from "react";
import { Link } from "react-router";
import { styled, useTheme } from "@mui/material/styles";
import config from "src/context/config";
import configs from "src/config";
import { motion } from "framer-motion";
import useMediaQuery from "@mui/material/useMediaQuery";

const Logo: FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const TopbarHeight = config.topbarHeight;

  const LinkStyled = styled(Link)(({ theme }) => ({
    height: TopbarHeight,
    minWidth: "auto",
    overflow: "visible",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textDecoration: "none",
    transition: "all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)",
    padding: theme.spacing(0, 2),
    margin: theme.spacing(0, 1),
    "&:hover": {
      transform: "scale(1.02)", // Subtle zoom effect
    },
  }));

  const LogoText = styled("span")(({ theme }) => ({
    fontWeight: 600,
    whiteSpace: "nowrap",
    fontSize: "1rem",
    color: theme.palette.text.secondary,
    letterSpacing: "0.6px",
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1.5), // Increased gap
    padding: theme.spacing(0.5, 1),
    fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
    [theme.breakpoints.down("sm")]: {
      display: "none",
    },
  }));

  const Badge = styled("span")(({ theme }) => ({
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    borderRadius: "5px", // More rounded corners
    padding: theme.spacing(0.5, 1.5), // More padding
    fontSize: "0.7rem", // Slightly smaller
    fontWeight: 500, // Medium weight

    lineHeight: 1.7,
    boxShadow: "0 1px 2px rgba(0,0,0,0.1)", // Subtle shadow
    fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "36px", // Consistent width
    height: "22px", // Consistent height
  }));

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.4,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      style={{
        display: "flex",
        alignItems: "center",
        height: "100%",
      }}
    >
      <LinkStyled to="/">
        <Badge> {configs.SHORT_TITLE}</Badge>
        {!isMobile && <LogoText> {configs.LONG_TITLE}</LogoText>}
      </LinkStyled>
    </motion.div>
  );
};

export default Logo;
