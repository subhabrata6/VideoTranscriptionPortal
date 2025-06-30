// src/routes/PrivateRoute.js
import React, { useContext } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthContext } from "../Helpers/AuthContext";
import GlobalLoader from "../../scenes/global/Loader";

/**
 * Usage:
 * <Route element={<PrivateRoute allowedRoles={["Admin", "Manager"]} />}>
 *   <Route path="/admin-dashboard" element={<AdminDashboard />} />
 * </Route>
 */
const PrivateRoute = ({ allowedRoles = [] }) => {
  const { auth, isAuthenticated, isLoading } = useContext(AuthContext);
  const location = useLocation();

  if (isLoading) 
    return <GlobalLoader />;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(auth?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
