import React, { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Box, Paper, TextField, Button, Typography, Checkbox,
  FormControlLabel, InputAdornment, IconButton, Grid
} from "@mui/material";
import { Visibility, VisibilityOff, Person, Lock } from "@mui/icons-material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { AuthContext } from "../../data/Helpers/AuthContext";
import Api from "../../data/Services/Interceptor";

const sqlInjectionPattern = /('|--|;|\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|EXEC|UNION|OR|AND)\b)/i;

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .required("Username is required")
    .test("sql-injection", "Invalid input detected", value => !sqlInjectionPattern.test(value || "")),
  password: Yup.string()
    .required("Password is required")
    .test("sql-injection", "Invalid input detected", value => !sqlInjectionPattern.test(value || "")),
  rememberMe: Yup.boolean()
});

export default function LoginForm() {
  const navigate = useNavigate();
  const { setAuth } = useContext(AuthContext);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
    validationSchema,
    onSubmit: async (values) => {
      setError("");
      try {
        const response = await Api.post("/Auth/login", {
          email: values.email,
          password: values.password,
        });

        if (response.statusCode === 200 && response.data?.token) {
          const { token, refreshToken, expires } = response.data;

          if (values.rememberMe) {
            localStorage.setItem("rememberCredentials", JSON.stringify({
              email: values.email,
              password: values.password
            }));
          } else {
            localStorage.removeItem("rememberCredentials");
          }

          setAuth({ token, refreshToken, expires, rememberMe: values.rememberMe });
          navigate("/dashboard");
        } else {
          setError(response.message || "Login failed");
        }
      } catch (err) {
        setError("Login failed");
      }
    },
  });

  return (
    <Grid container sx={{ height: "100vh" }}>
      <Grid
        item xs={12} md={6}
        sx={{
          background: "linear-gradient(to bottom, #00b4db, #5f2c82)",
          display: "flex", alignItems: "center", justifyContent: "center"
        }}
      >
        <Paper elevation={12}
          sx={{
            p: 4, width: 380, borderRadius: 3,
            backdropFilter: "blur(10px)",
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
            color: "#fff"
          }}
        >
          <Box textAlign="center" mb={2}>
            <Box sx={{ fontSize: 60, mb: 1, color: "#fff" }}>
              <Person fontSize="inherit" />
            </Box>
            <Typography variant="h5" fontWeight="bold">Sign in</Typography>
          </Box>

          <form onSubmit={formik.handleSubmit}>
            <TextField
              fullWidth
              variant="outlined"
              name="email"
              placeholder="Username"
              margin="normal"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person sx={{ color: "#fff" }} />
                  </InputAdornment>
                ),
                sx: {
                  fontSize: "1rem",
                  py: 1.2
                }
              }}
              sx={{
                input: { color: "#fff", fontSize: "1rem", py: 1.2 },
                fieldset: { borderColor: "#fff" },
                "& .MuiOutlinedInput-root:hover fieldset": {
                  borderColor: "#90caf9",
                },
              }}
            />

            <TextField
              fullWidth
              variant="outlined"
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              margin="normal"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: "#fff" }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      sx={{ color: "#fff" }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
                sx: {
                  fontSize: "1rem",
                  py: 1.2
                }
              }}
              onKeyDown={(e) => e.key === "Enter" && formik.handleSubmit()}
              sx={{
                input: { color: "#fff", fontSize: "1rem", py: 1.2 },
                fieldset: { borderColor: "#fff" },
                "& .MuiOutlinedInput-root:hover fieldset": {
                  borderColor: "#90caf9",
                },
              }}
            />

            <FormControlLabel
              control={
                <Checkbox
                  name="rememberMe"
                  checked={formik.values.rememberMe}
                  onChange={formik.handleChange}
                  sx={{ color: "#fff" }}
                />
              }
              label={<Typography sx={{ color: "#fff" }}>Remember me</Typography>}
              sx={{ mt: 1 }}
            />

            <Button
              fullWidth
              variant="outlined"
              type="submit"
              sx={{
                mt: 2,
                py: 1.3,
                fontSize: "1rem",
                borderColor: "#fff",
                backgroundColor: "rgb(88, 192, 233)",
                color: "#fff",
                "&:hover": {
                  backgroundColor: "rgba(61, 130, 157, 1)",
                  borderColor: "#90caf9",
                },
              }}
            >
              Login
            </Button>

            {error && (
              <Typography color="error" sx={{ mt: 2, fontSize: 14, textAlign: "center" }}>
                {error}
              </Typography>
            )}

            <Grid container sx={{ mt: 2 }} direction="column" alignItems="center">
              <Grid item>
                <Link to="/forget-password" style={{ color: "#fff", fontSize: 14 }}>
                  Forgot password?
                </Link>
              </Grid>
              <Grid item sx={{ mt: 1 }}>
                <Link to="/register" style={{ color: "#fff", fontSize: 14 }}>
                  Don't have an account? Register now
                </Link>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Box
          sx={{
            height: "100%",
            width: "100%",
            backgroundImage: `url('https://www.shutterstock.com/image-photo/cyber-security-concept-login-user-600nw-2478101101.jpg')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      </Grid>
    </Grid>
  );
}
