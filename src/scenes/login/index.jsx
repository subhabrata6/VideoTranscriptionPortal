import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Checkbox,
  FormControlLabel,
  InputAdornment,
  IconButton,
  Grid,
} from "@mui/material";
import { Visibility, VisibilityOff, Person, Lock } from "@mui/icons-material";
import { AuthContext } from "../../data/Helpers/AuthContext";
import Api from "../../data/Services/Interceptor";

export default function LoginForm() {
  const navigate = useNavigate();
  const { setAuth } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await Api.post("/Auth/login", { email, password });
      if (response.statusCode === 200 && response.data?.token) {
        const { token, refreshToken, expires } = response.data;
        setAuth({ token, refreshToken, expires });
        navigate("/dashboard");
      } else {
        setError(response.message || "Login failed");
      }
    } catch (err) {
      setError("Login failed");
    }
  };

  return (
    <Grid container sx={{ height: "100vh" }}>
      {/* Left Half - Login Form */}
      <Grid
        item
        xs={12}
        md={6}
        sx={{
          background: "linear-gradient(to bottom, #00b4db, #5f2c82)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Paper
          elevation={12}
          sx={{
            p: 4,
            width: 360,
            borderRadius: 3,
            backdropFilter: "blur(10px)",
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
            color: "#fff",
          }}
        >
          <Box textAlign="center" mb={2}>
            <Box sx={{ fontSize: 60, mb: 1, color: "#fff" }}>
              <Person fontSize="inherit" />
            </Box>
            <Typography variant="h5" fontWeight="bold">
              Sign in
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              variant="outlined"
              margin="normal"
              placeholder="Username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person sx={{ color: "#fff" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                input: { color: "#fff" },
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
              margin="normal"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
              }}
              sx={{
                input: { color: "#fff" },
                fieldset: { borderColor: "#fff" },
                "& .MuiOutlinedInput-root:hover fieldset": {
                  borderColor: "#90caf9",
                },
              }}
            />

            <FormControlLabel
              control={<Checkbox sx={{ color: "#fff" }} />}
              label={<Typography sx={{ color: "#fff" }}>Remember me</Typography>}
              sx={{ mt: 1 }}
            />

            <Button
              fullWidth
              variant="outlined"
              type="submit"
              sx={{
                mt: 2,
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

      {/* Right Half - Corporate Image */}
      <Grid item xs={12} md={6}>
        <Box
          sx={{
            height: "100%",
            width: "100%",
            backgroundImage: `url('https://www.shutterstock.com/image-photo/cyber-security-concept-login-user-600nw-2478101101.jpg')`, // Replace with your actual image URL
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      </Grid>
    </Grid>
  );
}
