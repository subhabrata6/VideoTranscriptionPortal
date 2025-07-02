import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { CheckCircle, Cancel } from "@mui/icons-material";
import Api from "../../data/Services/Interceptor";
import { ToastContainer } from "react-toastify";
import * as messageHelper from "../../data/Helpers/MessageHelper";
import { ApiEndpoints } from "../../data/Helpers/ApiEndPoints";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("payload");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});

  const minLengthValid = newPassword.length >= 8 && newPassword.length <= 12;
  const uppercaseValid = /[A-Z]/.test(newPassword);
  const specialCharValid = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
  const noSpaceValid = !/\s/.test(newPassword);
  const passwordsMatch = newPassword === confirmPassword;

  const showValidation = newPassword.length >= 3;

  const passwordRules = [
    {
      label: "8–12 characters long",
      valid: minLengthValid,
    },
    {
      label: "At least 1 uppercase letter",
      valid: uppercaseValid,
    },
    {
      label: "At least 1 special character",
      valid: specialCharValid,
    },
    {
      label: "No spaces",
      valid: noSpaceValid,
    },
    {
      label: "Passwords must match",
      valid: passwordsMatch && confirmPassword.length > 0,
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedPassword = newPassword.trim();
    const trimmedConfirm = confirmPassword.trim();

    const validationErrors = {};
    if (!minLengthValid) {
      validationErrors.newPassword = "Password must be 8–12 characters long.";
    } else if (!uppercaseValid) {
      validationErrors.newPassword = "Include at least one uppercase letter.";
    } else if (!specialCharValid) {
      validationErrors.newPassword = "Include at least one special character.";
    } else if (!noSpaceValid) {
      validationErrors.newPassword = "No spaces allowed.";
    }

    if (trimmedPassword !== trimmedConfirm) {
      validationErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      try {
        const response = await Api.post(ApiEndpoints.AUTH + "/reset-password", {
          payload:token,
          newPassword: trimmedPassword,
        });
        if (response.statusCode === 200 && response.success) {
          messageHelper.showSuccessToast(response.message);
          setTimeout(() => navigate("/login"), 3000);
        } else {
          messageHelper.showErrorToast(response.message);
        }
      } catch (error) {
        messageHelper.showErrorToast(error.message, { autoClose: false });
      }
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(to right, #1e3c72, #2a5298)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        px: 2,
      }}
    >
      <Paper
        elevation={10}
        sx={{
          p: { xs: 3, sm: 5 },
          width: { xs: "100%", sm: 480 },
          borderRadius: 3,
          backgroundColor: "#1a05c5",
        }}
      >
        <Typography
          variant="h5"
          fontWeight={700}
          textAlign="center"
          color="#ffffff"
          mb={2}
        >
          Reset Your Password
        </Typography>

        {showValidation && (
          <Box
            sx={{
              backgroundColor: "#f1f6fe",
              border: "1px solid #1a05c5",
              borderRadius: 2,
              p: 2,
              mb: 3,
            }}
          >
            <Typography variant="subtitle2" color="primary" fontWeight={600}>
              Password reset criteria:
            </Typography>
            <List dense>
              {passwordRules.map((rule, idx) => (
                <ListItem key={idx} sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 30 }}>
                    {rule.valid ? (
                      <CheckCircle sx={{ color: "green" }} />
                    ) : (
                      <Cancel sx={{ color: "red" }} />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={rule.label}
                    primaryTypographyProps={{
                      fontSize: "0.9rem",
                      color: rule.valid ? "green" : "red",
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <TextField
            fullWidth
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            error={!!errors.newPassword}
            helperText={errors.newPassword}
            sx={{ mb: 3 }}
          />

          <TextField
            fullWidth
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword}
            sx={{ mb: 3 }}
          />

          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => navigate("/login")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{
                backgroundColor: "#1e3c72",
                color: "#fff",
                "&:hover": {
                  backgroundColor: "#16315e",
                },
              }}
            >
              Reset Password
            </Button>
          </Stack>
        </form>
      </Paper>
      <ToastContainer />
    </Box>
  );
};

export default ResetPassword;
