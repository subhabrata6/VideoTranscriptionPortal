import React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useLoader } from "../../data/Helpers/LoaderContext";

const GlobalLoader = () => {
  const { loading } = useLoader();

  if (!loading) return null;

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      width="100vw"
      height="100vh"
      zIndex={1300}
      display="flex"
      alignItems="center"
      justifyContent="center"
      bgcolor="rgba(0, 0, 0, 0.4)"
    >
      <Box textAlign="center" color="#fff">
        <CircularProgress size={80} thickness={5} />
        <Typography variant="h6" mt={2}>
          Loading...
        </Typography>
      </Box>
    </Box>
  );
};

export default GlobalLoader;
