import React, { useEffect, useState, useContext } from "react";
import {
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Paper,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate, useParams } from "react-router-dom";
import Api from "../../data/Services/Interceptor";
import { ApiEndpoints } from "../../data/Helpers/ApiEndPoints";
import { tokens } from "../../theme";
import * as messageHelper from "../../data/Helpers/MessageHelper";
import { AuthContext } from "../../data/Helpers/AuthContext";
import Header from "../../components/Header";

const CreateDepartment = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialValues, setInitialValues] = useState({
    name: "",
    companyId: "",
  });
  const { auth } = useContext(AuthContext);

  const isSuperAdmin = auth?.role === "SuperAdmin";
  const loggedInCompanyId = auth?.claims?.companyId;

  const validationSchema = Yup.object({
    name: Yup.string()
      .matches(
        /^[A-Za-z0-9\s.,\-\\/()&]+$/,
        "Only letters, numbers, space, and characters like . , - / ( ) & are allowed"
      )
      .required("Department name is required"),
    companyId: Yup.string().required("Company is required"),
  });

  const fetchCompanies = async () => {
    try {
      if (isSuperAdmin) {
        const response = await Api.get(ApiEndpoints.COMPANIES);
        if (response.statusCode === 200) {
          setCompanies(response.data.items);
        } else {
          messageHelper.showErrorToast("Failed to load companies");
        }
      } else {
        const response = await Api.get(`${ApiEndpoints.COMPANIES}/${loggedInCompanyId}`);
        if (response.statusCode === 200) {
          setCompanies([{ id: response.data.id, name: response.data.name }]);
        } else {
          messageHelper.showErrorToast("Failed to load your company info");
        }
      }
    } catch (error) {
      console.error("Company fetch error:", error);
      messageHelper.showErrorToast("Error fetching company info");
    }
  };

  const fetchDepartmentById = async (id) => {
    try {
      const response = await Api.get(`${ApiEndpoints.DEPARTMENTS}/${id}`);
      if (response.statusCode === 200) {
        setInitialValues({
          name: response.data.name || "",
          companyId: response.data.companyId || "",
        });
      } else {
        messageHelper.showErrorToast("Failed to fetch department details");
      }
    } catch (error) {
      console.error("Error fetching department:", error);
      messageHelper.showErrorToast("Error loading department data");
    }
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      try {
        const payload = {
          name: values.name.trim(),
          companyId: values.companyId,
        };

        const apiCall = isEditMode
          ? Api.put(`${ApiEndpoints.DEPARTMENTS}/${id}`, payload)
          : Api.post(ApiEndpoints.DEPARTMENTS, payload);

        const response = await apiCall;

        if (response.statusCode === 200 || response.statusCode === 201) {
          messageHelper.showSuccessToast(
            `Department ${isEditMode ? "updated" : "created"} successfully`
          );
          setTimeout(() => {
          navigate("/department-list");
        }, 3000);

        } else {
          messageHelper.showErrorToast(response.message || "Operation failed");
        }
      } catch (error) {
        console.error("Save department error:", error);
        messageHelper.showErrorToast("Something went wrong");
      }
    },
  });

  useEffect(() => {
    const initialize = async () => {
      await fetchCompanies();
      if (isEditMode) await fetchDepartmentById(id);
      setLoading(false);
    };
    initialize();
  }, [id]);

  if (loading) {
    return (
      <Box height="80vh" display="flex" justifyContent="center" alignItems="center">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ m: 4 }}>
      <Header
        title={isEditMode ? "EDIT DEPARTMENT" : "CREATE DEPARTMENT"}
        subtitle={isEditMode ? "Edit existing department details" : "Add a new department"}
      />

      <Paper elevation={3} sx={{ p: 4, borderRadius: 3, background: colors.primary[400] }}>
        <form onSubmit={formik.handleSubmit}>
          <Box display="flex" flexDirection="column" gap={3}>
            {/* Department Name */}
            <TextField
              fullWidth
              variant="outlined"
              label="Department Name"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
            />

            {/* Company Dropdown */}
            <TextField
              select
              fullWidth
              variant="outlined"
              label="Company"
              name="companyId"
              value={formik.values.companyId}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={!isSuperAdmin}
              error={formik.touched.companyId && Boolean(formik.errors.companyId)}
              helperText={formik.touched.companyId && formik.errors.companyId}
            >
              {companies.map((company) => (
                <MenuItem key={company.id} value={company.id}>
                  {company.name}
                </MenuItem>
              ))}
            </TextField>

            {/* Buttons */}
            <Box display="flex" justifyContent="flex-end" gap={2}>
              <Button
                type="button"
                variant="contained" color="primary" sx={{ ml: 2 }}
                onClick={() => navigate("/department-list")}
              >
                Cancel
              </Button>
              <Button type="submit" variant="contained" color="secondary">
                {isEditMode ? "Update" : "Create"}
              </Button>
            </Box>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default CreateDepartment;
