import React from "react";
import { Box, Typography } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import LanguageSelector from "./LanguageSelector";

const Header = () => {
  const location = useLocation();

  const isDashboard = location.pathname === "/dashboard";

  return (
    <Box
      sx={{
        backgroundColor: "Black",
        width: "100%",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 1300,
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      <Box
        sx={{
          padding: "1rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <Link to="/" style={{ textDecoration: "none" }}>
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: 700,
              fontSize: "1.8rem",
              color: "White",
              letterSpacing: "0.5px",
              textShadow: "0 1px 2px rgba(0,0,0,0.1)",
            }}
          >
            News App
          </Typography>
        </Link>

        {isDashboard && <LanguageSelector />}
      </Box>
    </Box>
  );
};

export default Header;
