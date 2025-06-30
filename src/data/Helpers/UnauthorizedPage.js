// src/pages/Unauthorized.js
import React from "react";
import { Typography, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <Box textAlign="center" mt={10}>
      <Typography variant="h4" gutterBottom>
        403 - Unauthorized
      </Typography>
      <Typography variant="body1">
        You do not have permission to view this page.
      </Typography>
      <Button variant="contained" onClick={() => navigate("/")}>
        Go to Home
      </Button>
    </Box>
  );
};

export default Unauthorized;
