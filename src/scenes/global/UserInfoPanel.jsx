import { useState, useContext } from "react";
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import { AccountCircle } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Api from "../../data/Services/Interceptor";
import { ToastContainer } from "react-toastify";
import { ApiEndpoints } from "../../data/Helpers/ApiEndPoints";
import { AuthContext } from "../../data/Helpers/AuthContext";
import * as messageHelper from "../../data/Helpers/MessageHelper";

const UserInfoPanel = () => {
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = () => {
    localStorage.clear();
    handleClose();
    navigate("/login");
  };


  const handleChangePassword = async () => {
    handleClose();
    const email = auth?.claims?.userEmail;

    if (!email) {
      messageHelper.showErrorToast("Email not found in user claims.");
      return;
    }

    try {
      const response = await Api.post(ApiEndpoints.AUTH + "/forgot-password", { email });
      if (response.statusCode === 200 && response.success) {
        messageHelper.showSuccessToast(response.message || "Reset link sent to your email.");
      } else {
        messageHelper.showErrorToast(response.message || "Failed to trigger password reset.");
      }
    } catch (error) {
      messageHelper.showErrorToast("Error: " + error.message);
    }
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      {/* <Box sx={{ textAlign: "right" }}>
        <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
          {auth?.claims?.name || "User"}
        </Typography>
        <Typography variant="body2" sx={{ fontSize: "0.8rem", color: "#ccc" }}>
          {auth?.role || "User"}
        </Typography>
      </Box> */}

      <IconButton
        color="inherit"
        onClick={handleMenu}
        size="large"
        aria-controls={open ? "user-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
      >
        <AccountCircle />
      </IconButton>

      <Menu
        id="user-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem onClick={() => navigate("/user-profile")}>My Account</MenuItem>
        <MenuItem onClick={handleChangePassword}>Change Password</MenuItem>
        <MenuItem onClick={handleLogout}>Logout</MenuItem>
      </Menu>
      <ToastContainer />
    </Box>
  );
};

export default UserInfoPanel;
