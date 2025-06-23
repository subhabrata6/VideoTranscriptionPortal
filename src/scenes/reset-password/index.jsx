import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Api from "../../data/Services/Interceptor";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
} from "@mui/material";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [token, setToken] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const paramsToken = params.get("payload");
    if (paramsToken) {
      setToken(paramsToken);
    }
  }, [location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { newPassword, confirmPassword } = formData;

    if (!newPassword || !confirmPassword) {
      toast.error("Please fill in both fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      const response = await Api.post("/Auth/reset-password", {
        newPassword,
        payload: token,
      });

      if (response.status !== 200) {
        toast.error("Password reset failed.");
        return;
      }

      toast.success("Password reset successful. You can now log in.", {
        onClose: () => navigate("/login"),
        autoClose: 3000,
      });
    } catch (error) {
      console.error("Reset failed:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  const handleCancel = () => {
    navigate("/login");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(to right,rgb(88, 168, 248),rgb(5, 53, 107))",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        px: 2,
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
        <Typography variant="h4" gutterBottom align="center" fontWeight="bold">
          Reset Password
        </Typography>
        <Typography variant="body1" align="center" mb={3}>
          Enter your new password to regain access to your account.
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            label="New Password"
            name="newPassword"
            type="password"
            fullWidth
            margin="normal"
            value={formData.newPassword}
            onChange={handleChange}
            required
          />
          <TextField
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            fullWidth
            margin="normal"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
          <Grid container spacing={2} justifyContent="flex-end" mt={2}>
            <Grid item>
              <Button onClick={handleCancel} variant="outlined" color="secondary">
                Cancel
              </Button>
            </Grid>
            <Grid item>
              <Button type="submit" variant="contained" color="primary">
                Submit
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
      <ToastContainer />
    </Box>
  );
};

export default ResetPassword;
