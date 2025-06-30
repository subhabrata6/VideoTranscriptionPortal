import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  useTheme,
  CircularProgress,
} from "@mui/material";
import { People, Work } from "@mui/icons-material";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { toast, ToastContainer } from "react-toastify";
import * as messageHelper from "../../data/Helpers/MessageHelper";
import Api from "../../data/Services/Interceptor";
import { ApiEndpoints } from "../../data/Helpers/ApiEndPoints";
import { tokens } from "../../theme";
import "react-toastify/dist/ReactToastify.css";

const AdminDashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [loading, setLoading] = useState(true);
  const [activeUsers, setActiveUsers] = useState(0);
  const [activeProjects, setActiveProjects] = useState(0);
  const [departmentData, setDepartmentData] = useState([]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [usersRes, projectsRes, deptRes] = await Promise.all([
        Api.get(ApiEndpoints.USER.ACTIVE_USER_COUNT),
        Api.get(ApiEndpoints.PROJECT.ACTIVE_PROJECT_COUNT),
        Api.get(ApiEndpoints.PROJECT.DEPARTMENT_WISE_PROJECTS),
      ]);

      setActiveUsers(usersRes?.data?.count || 0);
      setActiveProjects(projectsRes?.data?.count || 0);
      setDepartmentData(deptRes?.data || []);
    } catch (error) {
      messageHelper.showErrorToast(error.message);
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="70vh">
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <ToastContainer />
      <Typography variant="h4" mb={2} fontWeight="bold">
        Admin Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Total Active Users */}
        <Grid item xs={12} sm={6} md={4}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              backgroundColor: colors.primary[400],
              color: colors.grey[100],
              display: "flex",
              alignItems: "center",
              gap: 2,
              height: "100%",
            }}
          >
            <People sx={{ fontSize: 40, color: colors.blueAccent[300] }} />
            <Box>
              <Typography variant="h6">Active Users</Typography>
              <Typography variant="h4" fontWeight="bold">
                {activeUsers}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Total Active Projects */}
        <Grid item xs={12} sm={6} md={4}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              backgroundColor: colors.primary[400],
              color: colors.grey[100],
              display: "flex",
              alignItems: "center",
              gap: 2,
              height: "100%",
            }}
          >
            <Work sx={{ fontSize: 40, color: colors.greenAccent[400] }} />
            <Box>
              <Typography variant="h6">Active Projects</Typography>
              <Typography variant="h4" fontWeight="bold">
                {activeProjects}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Department-wise Projects */}
      <Box mt={5}>
        <Typography variant="h6" gutterBottom>
          Department-wise Projects
        </Typography>
        <Paper elevation={3} sx={{ p: 3, backgroundColor: colors.primary[400] }}>
          {departmentData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentData}>
                <XAxis dataKey="department" stroke={colors.grey[100]} />
                <YAxis stroke={colors.grey[100]} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: colors.primary[500],
                    border: "none",
                  }}
                />
                <Bar dataKey="projectCount" fill={colors.greenAccent[500]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Typography variant="body1" color="textSecondary">
              No data available.
            </Typography>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default AdminDashboard;
