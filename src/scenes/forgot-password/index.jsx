import React from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
} from "@mui/material";
import { ApiEndpoints } from "../../data/Helpers/ApiEndPoints";
import { ToastContainer } from "react-toastify";
import * as messageHelper from "../../data/Helpers/MessageHelper";
import "react-toastify/dist/ReactToastify.css";
import Api from "../../data/Services/Interceptor";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
});

const ForgotPassword = () => {
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: { email: "" },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const response = await Api.post(
          ApiEndpoints.AUTH + "/forgot-password",
          { email: values.email.trim() }
        );
        if (response.statusCode === 200 && response.success) {
          messageHelper.showSuccessToast(response.message);
          setTimeout(() => navigate("/login"), 3000);
        } else {
          messageHelper.showErrorToast(response.message);
        }
      } catch (err) {
        messageHelper.showErrorToast("Error: " + err.message, { autoClose: false });
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#0439d3",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        px: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 4, sm: 6 },
          width: { xs: "100%", sm: 600 },
          minHeight: 400,
          borderRadius: 0,
          backgroundColor: "transparent",
          boxShadow: "none",
        }}
      >
        <Typography
          variant="h3"
          fontWeight={800}
          mb={4}
          textAlign="center"
          sx={{ fontSize: { xs: 24, sm: 40 }, letterSpacing: 1 }}
        >
          Find Your Account
        </Typography>

        <Typography
          variant="h6"
          mb={6}
          color="white"
          sx={{
            fontSize: { xs: 14, sm: 18 },
            textAlign: "center",
            letterSpacing: 0.5,
            lineHeight: 1.6,
          }}
        >
          Please enter your email address to search for your account. We will send you a reset link to your registered email address.
        </Typography>

        <form onSubmit={formik.handleSubmit} noValidate>
          <TextField
            fullWidth
            label="Email Address"
            type="email"
            name="email"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
            sx={{
              mb: 4,
              "& .MuiInputBase-input": { fontSize: 18, py: 2 },
              "& .MuiInputLabel-root": { fontSize: 16 },
            }}
            InputProps={{
              style: { height: 56 },
            }}
          />

          <Stack
            direction="row"
            spacing={2}
            justifyContent="center"
            sx={{ mt: 2 }}
          >
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => navigate("/login")}
              sx={{
                fontSize: 16,
                px: 4,
                py: 1,
                borderWidth: 2,
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={formik.isSubmitting}
              sx={{
                backgroundColor: "#1e3c72",
                color: "#fff",
                fontSize: 16,
                px: 5,
                py: 1.2,
                borderRadius: 2,
                "&:hover": {
                  backgroundColor: "#16315e",
                },
              }}
            >
              Search
            </Button>
          </Stack>
        </form>

        <Box mt={6} textAlign="center">
          <Typography
            variant="body1"
            color="white"
            sx={{ fontSize: 16, mb: 1 }}
          >
            Need more help?
          </Typography>
          <Typography
            variant="body2"
            color="white"
            sx={{ fontSize: 14 }}
          >
            Contact our support team at{" "}
            <a href="mailto:support@example.com" style={{ color: "#37beff" }}>
              support@example.com
            </a>
          </Typography>
        </Box>
      </Paper>
      <ToastContainer />
    </Box>
  );
};

export default ForgotPassword;
