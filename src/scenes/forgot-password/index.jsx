import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Api from "../../data/Services/Interceptor";

import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
} from "@mui/material";

const ForgetPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }

    try {
      await sendResetEmail(email);
      setEmail("");
      toast.success("Please check your email to reset your password.", {
        onClose: () => navigate("/login"),
        autoClose: 3000,
      });
    } catch (error) {
      toast.error("Failed to send reset email. Please try again.");
    }
  };

  const sendResetEmail = async (email) => {
    const response = await Api.post("/Auth/forgot-password", { email });
    return response.data;
  };

  const handleCancel = () => {
    navigate("/login");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(to right,rgb(88, 168, 248),rgb(5, 53, 107))",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        px: 5,
      }}
    >
      <Paper
        elevation={10}
        sx={{
          p: 6,
          width: 500,
          maxWidth: "100%",
          borderRadius: 4,
          backgroundColor: "#0c35fd",
          boxShadow: "0 6px 24px rgba(0,0,0,0.1)",
        }}
      >
        <Typography
          variant="h5"
          fontWeight="bold"
          gutterBottom
          textAlign="center"
        >
          Forgot Password
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          textAlign="center"
          mb={3}
        >
          Enter your registered email address. We'll send you a link to reset
          your password.
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            label="Email Address"
            variant="outlined"
            fullWidth
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{
              mb: 3,
            }}
          />

          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button onClick={handleCancel} variant="outlined" color="secondary">
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary">
              Submit
            </Button>
          </Stack>
        </form>
      </Paper>

      <ToastContainer />
    </Box>
  );
};

export default ForgetPassword;
