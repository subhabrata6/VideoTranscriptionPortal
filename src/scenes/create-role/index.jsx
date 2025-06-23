import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  MenuItem,
  TextField,
  Typography,
  Paper,
  InputAdornment,
  useMediaQuery,
  useTheme,
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
import { display } from "@mui/system";
import { ApiEndpoints } from "../../data/Helpers/ApiEndPoints";

const CreateRole = () => {
  const [companies, setCompanies] = useState([]);
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const { roleId } = useParams(); // Get companyId from URL params if needed
  const isEditMode = Boolean(roleId);
  const [loading, setLoading] = useState(!!roleId);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await Api.get("/Companies");
        setCompanies(response.data.items);
      } catch (error) {
        messageHelper.showErrorToast("Failed to load companies");
      }
    };

    fetchCompanies();
  }, []);

  const initialValues = {
    name: "",
    companyId: "",
    displayName: ""
  };

  const validationSchema = yup.object().shape({
    roleName: yup.string().required("Role name is required"),
    companyId: yup.string().required("Please select a company"),
  });

  const handleFormSubmit = async (values, { resetForm }) => {
    try {
      console.log("Creating Role:", values);
      const response = await Api.post(ApiEndpoints.ROLE, {
        name: values.roleName,
        companyId: values.companyId,
        displayName: values.roleName, // Assuming displayName is same as roleName
      });
      if (response.success == true && response.statusCode === 201) {
        messageHelper.showSuccessToast("Role created successfully!");
        resetForm();
        navigate("/role-list"); // Redirect to roles list after creation
      }
      else {
        messageHelper.showErrorToast("Failed to create role ! " + response.message);
      }
      
    } catch (error) {
      messageHelper.showErrorToast("Failed to create role");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "80vh",
        background: `${colors.primary[400]}`,
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
          maxWidth: "1200px", // matches typical content width
          borderRadius: 3,
          p: 4,
          m: "0 auto", // centers the Paper in the main area
        }}
      >
        <Typography variant="h5" gutterBottom align="center" fontWeight="bold">
          Create Role
        </Typography>
        <Formik
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
                sx={{
                  minHeight: "30vh",
                  background: `${colors.primary[400]}`,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "flex-start", // aligns at the top
                  py: 6,
                  px: 3,
                }}
              >
                <TextField
                  fullWidth
                  name="roleName"
                  label="Role Name"
                  variant="outlined"
                  value={values.roleName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={!!touched.roleName && !!errors.roleName}
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
                  error={!!touched.companyId && !!errors.companyId}
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
                  Create Role
                </Button>
                <Button
                  type="button" variant="contained" color="primary" sx={{ ml: 2 }} 
                  onClick={() => navigate("/role-list")}>Cancel</Button>
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
