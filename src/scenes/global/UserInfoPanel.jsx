// src/Layout/component/UserInfoPanel.jsx
import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Menu,
  MenuItem,
  IconButton,
  Paper,
} from "@mui/material";
import { AccountCircle } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
// import { AuthContext } from "../../data/Helpers/AuthContext";

const UserInfoPanel = () => {
  //const { auth } = useContext(AuthContext);
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

  const handleChangePassword = () => {
    handleClose();
    navigate("/reset-password");
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Box sx={{ textAlign: "right" }}>
        {/* <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
          {auth?.claims?.name || "User"}
        </Typography>
        <Typography variant="body2" sx={{ fontSize: "0.8rem", color: "#ccc" }}>
          {auth?.role || "User"}
        </Typography> */}
      </Box>

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
        <MenuItem onClick={handleChangePassword}>Change Password</MenuItem>
        <MenuItem onClick={handleLogout}>Logout</MenuItem>
      </Menu>
    </Box>
  );
};

export default UserInfoPanel;
