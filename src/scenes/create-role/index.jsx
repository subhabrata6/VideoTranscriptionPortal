import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  MenuItem,
  TextField,
  Typography,
  Paper,
  InputAdornment,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { tokens } from "../../theme";
import { Formik } from "formik";
import * as yup from "yup";
import WorkIcon from "@mui/icons-material/Work";
import BusinessIcon from "@mui/icons-material/Business";
import Api from "../../data/Services/Interceptor";
import * as messageHelper from "../../data/Helpers/MessageHelper";
import { ToastContainer } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import { ApiEndpoints } from "../../data/Helpers/ApiEndPoints";

const CreateRole = () => {
  const [companies, setCompanies] = useState([]);
  const [roleData, setRoleData] = useState(null);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const { roleId } = useParams();

  // Fetch companies
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await Api.get(ApiEndpoints.COMPANIES);
        setCompanies(response.data.items);
      } catch (error) {
        messageHelper.showErrorToast("Failed to load companies");
      }
    };
    fetchCompanies();
  }, []);

  // Fetch role by ID if editing
  useEffect(() => {
    const fetchRole = async () => {
      if (!roleId) return;
      try {
        const response = await Api.get(`${ApiEndpoints.ROLE}/${roleId}`);
        if (response.statusCode === 200 && response.success) {
          setRoleData({
            roleName: response.data.displayName,
            companyId: response.data.companyId,
          });
        } else {
          messageHelper.showErrorToast("Failed to fetch role");
        }
      } catch (error) {
        messageHelper.showErrorToast("Error loading role details");
      }
    };
    fetchRole();
  }, [roleId]);

  const initialValues = roleData || {
    roleName: "",
    companyId: "",
  };

  const validationSchema = yup.object().shape({
    roleName: yup.string().required("Role Name is required"),
    companyId: yup.string().required("Company is required"),
  });

  const handleFormSubmit = async (values, { resetForm }) => {
    try {
      if (roleId) {
        // Update Role
        const response = await Api.put(`${ApiEndpoints.ROLE}/${roleId}`, {
          name: values.roleName,
          displayName: values.roleName,
          companyId: values.companyId,
        });
        if (response.success && response.statusCode === 200) {
          messageHelper.showSuccessToast("Role updated successfully!");
          //resetForm();
          setTimeout(() => {
            navigate("/role-list");
          }, 3000);
        } else {
          messageHelper.showErrorToast(
            "Failed to update role! " + response.message
          );
        }
      } else {
        // Create Role
        const response = await Api.post(ApiEndpoints.ROLE, {
          name: values.roleName,
          displayName: values.roleName,
          companyId: values.companyId,
        });
        if (response.success && response.statusCode === 201) {
          messageHelper.showSuccessToast("Role created successfully!");
          resetForm();
          setTimeout(() => {
            navigate("/role-list");
          }, 3000);
        } else {
          messageHelper.showErrorToast(
            "Failed to create role! " + response.message
          );
        }
      }
    } catch (error) {
      messageHelper.showErrorToast("Error saving role: " + error.message);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "80vh",
        background: colors.primary[400],
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        px: 2,
      }}
    >
      <Paper
        elevation={4}
        sx={{
          width: "100%",
          maxWidth: "1200px",
          borderRadius: 3,
          p: 4,
          m: "0 auto",
        }}
      >
        <Typography variant="h5" gutterBottom align="center" fontWeight="bold">
          {roleId ? "Edit Role" : "Create Role"}
        </Typography>

        <Formik
          enableReinitialize
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleFormSubmit}
        >
          {({
            values,
            errors,
            touched,
            handleBlur,
            handleChange,
            handleSubmit,
          }) => (
            <form onSubmit={handleSubmit}>
              <Box
                display="flex"
                flexDirection={isNonMobile ? "row" : "column"}
                gap={3}
                py={4}
              >
                <TextField
                  fullWidth
                  name="roleName"
                  label="Role Name"
                  variant="outlined"
                  value={values.roleName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={Boolean(touched.roleName && errors.roleName)}
                  helperText={touched.roleName && errors.roleName}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <WorkIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  select
                  fullWidth
                  name="companyId"
                  label="Select Company"
                  variant="outlined"
                  value={values.companyId}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={Boolean(touched.companyId && errors.companyId)}
                  helperText={touched.companyId && errors.companyId}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BusinessIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                >
                  {companies.map((company) => (
                    <MenuItem key={company.id} value={company.id}>
                      {company.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>

              <Box display="flex" justifyContent="flex-end" mt={4}>
                <Button type="submit" variant="contained" color="primary">
                  {roleId ? "Update Role" : "Create Role"}
                </Button>
                <Button
                  type="button"
                  variant="contained"
                  color="primary"
                  sx={{ ml: 2 }}
                  onClick={() => navigate("/role-list")}
                >
                  Cancel
                </Button>
              </Box>
            </form>
          )}
        </Formik>
        <ToastContainer />
      </Paper>
    </Box>
  );
};

export default CreateRole;
