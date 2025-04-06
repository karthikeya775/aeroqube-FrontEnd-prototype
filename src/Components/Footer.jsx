import React from "react";
import { Box, Typography } from "@mui/material";

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: "black",
        color: "white",
        textAlign: "center",
        py: 2,
        width: "100%",
        left: 0,
        right: 0,
        position: "absolute",
        boxSizing: "border-box",
      }}
    >
      <Typography variant="body2">
        © {new Date().getFullYear()} NewsApp. All rights reserved.
      </Typography>
    </Box>
  );
};

export default Footer;