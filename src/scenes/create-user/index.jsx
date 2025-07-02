// Imports (unchanged)
import {
  Box,
  Button,
  TextField,
  MenuItem,
  InputAdornment,
  useMediaQuery,
  Paper,
  useTheme,
} from "@mui/material";
import { tokens } from "../../theme";
import { Formik } from "formik";
import * as yup from "yup";
import Header from "../../components/Header";
import { useEffect, useState, useContext } from "react";
import Api from "../../data/Services/Interceptor";
import { useNavigate, useParams } from "react-router-dom";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import BusinessIcon from "@mui/icons-material/Business";
import WorkIcon from "@mui/icons-material/Work";
import ApartmentIcon from "@mui/icons-material/Apartment";
import { ApiEndpoints } from "../../data/Helpers/ApiEndPoints";
import { ToastContainer } from "react-toastify";
import * as messageHelper from "../../data/Helpers/MessageHelper";
import { useSelector } from "react-redux";
import { AuthContext } from "../../data/Helpers/AuthContext";

const DEFAULT_PASSWORD = "Cispl@123";

const nameRegex = /^[\p{L}\p{M}\s._\-’,;()[\]{}<>]+$/u;

const userSchema = yup.object().shape({
  name: yup
    .string()
    .required("User name is required")
    .matches(nameRegex, "Invalid characters in name"),
  email: yup.string().email("Invalid email").required("Email is required"),
  companyId: yup.string().required("Company is required"),
  roleId: yup.string().required("Role is required"),
  departmentId: yup.string().required("Department is required"),
});

const CreateUser = () => {
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const navigate = useNavigate();
  const { userId } = useParams();
  const isEditMode = Boolean(userId);
  const { auth } = useContext(AuthContext);
  const theme = useTheme();
    const colors = tokens(theme.palette.mode);

  const [companies, setCompanies] = useState([]);
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(!!isEditMode);

  const isSuperAdmin = auth?.role === "SuperAdmin";

  const [initialValues, setInitialValues] = useState({
    name: "",
    email: "",
    companyId: "",
    roleId: "",
    departmentId: "",
  });

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await Api.get(ApiEndpoints.COMPANIES);
        setCompanies(res.data.items || []);
      } catch (err) {
        console.error("Failed to fetch companies");
      }
    };

    fetchCompanies();
  }, []);

  useEffect(() => {
    const fetchUserDetails = async () => {
      setLoading(true);
      try {
        const response = await Api.get(`${ApiEndpoints.USERS}/${userId}`);
        if (response.statusCode === 200 && response.success) {
          const userData = response.data;

          const companyId = userData.companyId || "";
          const departmentId = userData.departmentId || "";
          const roleId = userData.roleId?.[0] || "";

          setInitialValues({
            name: userData.name || "",
            email: userData.email || "",
            companyId,
            roleId,
            departmentId,
          });

          // Delay fetch until Formik is ready to set fields
          setTimeout(() => {
            fetchRelatedData(companyId, true, roleId, departmentId, () => {});
          }, 0);
        } else {
          messageHelper.showErrorToast("User not found");
          setTimeout(() => navigate("/user-list"), 3000);
        }
      } catch (err) {
        console.error("Error fetching user details", err);
        navigate("/user-list");
      } finally {
        setLoading(false);
      }
    };

    if (isEditMode) fetchUserDetails();
  }, [userId]);

  const fetchRelatedData = async (
    companyId,
    isEditing = false,
    selectedRoleId = null,
    selectedDeptId = null,
    setFieldValue
  ) => {
    try {
      const response = await Api.get(
        `${ApiEndpoints.COMPANIES}/${companyId}/related/departments,roles`
      );
      const fetchedRoles = response.data?.roles || [];
      const fetchedDepartments = response.data?.departments || [];

      setRoles(fetchedRoles);
      setDepartments(fetchedDepartments);

      if (isEditing) {
        setFieldValue("roleId", selectedRoleId || "");
        setFieldValue("departmentId", selectedDeptId || "");
      } else if (isSuperAdmin) {
        const adminRole = fetchedRoles.find((r) =>
          r.displayName.toLowerCase().includes("admin")
        );
        const adminDept = fetchedDepartments.find((d) =>
          d.name.toLowerCase().includes("admin")
        );

        setFieldValue("roleId", adminRole?.id || fetchedRoles[0]?.id || "");
        setFieldValue(
          "departmentId",
          adminDept?.id || fetchedDepartments[0]?.id || ""
        );
      }
    } catch (err) {
      console.error("Failed to fetch roles or departments", err);
    }
  };

  const handleFormSubmit = async (values) => {
    try {
      const payload = {
        email: values.email,
        departmentId: values.departmentId,
        name: values.name,
        roles: [values.roleId],
        ...(isEditMode ? {} : { password: DEFAULT_PASSWORD }),
      };

      // Determine API endpoint
      let endpoint = isEditMode
        ? `${ApiEndpoints.USERS}/${userId}`
        : ApiEndpoints.USERS;

      // Append companyId if user is SuperAdmin
      if (isSuperAdmin) {
        const connector = endpoint.includes("?") ? "&" : "?";
        endpoint = `${endpoint}${connector}companyId=${values.companyId}`;
      }

      const response = isEditMode
        ? await Api.put(endpoint, payload)
        : await Api.post(endpoint, payload);

      if (response.success) {
        messageHelper.showSuccessToast(
          isEditMode
            ? "User updated successfully."
            : "User created successfully."
        );
        setTimeout(() => navigate("/user-list"), 3000);
      } else {
        messageHelper.showErrorToast("User save failed: " + response.message);
      }
    } catch (err) {
      console.error("User save failed", err);
      messageHelper.showErrorToast("Operation failed: " + err.message);
    }
  };

  return (
    <Box m="20px" sx={{ backgroundColor: colors.primary[400] }}>
      <Header
        title={isEditMode ? "EDIT USER" : "CREATE USER"}
        subtitle={
          isEditMode
            ? "Update an existing user profile"
            : "Create a new user profile"
        }
      />
      <Paper elevation={3} sx={{ p: 4 }}>
        {!loading && (
          <Formik
            enableReinitialize
            initialValues={initialValues}
            validationSchema={userSchema}
            onSubmit={handleFormSubmit}
          >
            {({
              values,
              errors,
              touched,
              handleBlur,
              handleChange,
              handleSubmit,
              setFieldValue,
            }) => (
              <form onSubmit={handleSubmit}>
                <Box
                  display="grid"
                  gap="30px"
                  gridTemplateColumns="repeat(4, minmax(0, 1fr))"
                  sx={{
                    "& > div": {
                      gridColumn: isNonMobile ? undefined : "span 4",
                    },
                  }}
                >
                  <TextField
                    fullWidth
                    variant="filled"
                    label={
                      <span>
                        Name <span style={{ color: "red" }}>*</span>
                      </span>
                    }
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={!!touched.name && !!errors.name}
                    helperText={touched.name && errors.name}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ gridColumn: "span 2" }}
                  />

                  <TextField
                    fullWidth
                    variant="filled"
                    label={
                      <span>
                        Email <span style={{ color: "red" }}>*</span>
                      </span>
                    }
                    name="email"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={!!touched.email && !!errors.email}
                    helperText={touched.email && errors.email}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ gridColumn: "span 2" }}
                  />

                  <TextField
                    select
                    fullWidth
                    variant="filled"
                    label={
                      <span>
                        Company <span style={{ color: "red" }}>*</span>
                      </span>
                    }
                    name="companyId"
                    value={values.companyId}
                    onChange={async (e) => {
                      const selectedCompanyId = e.target.value;
                      setFieldValue("companyId", selectedCompanyId);
                      setFieldValue("roleId", "");
                      setFieldValue("departmentId", "");
                      await fetchRelatedData(
                        selectedCompanyId,
                        false,
                        null,
                        null,
                        setFieldValue
                      );
                    }}
                    onBlur={handleBlur}
                    error={!!touched.companyId && !!errors.companyId}
                    helperText={touched.companyId && errors.companyId}
                    disabled={isEditMode}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <BusinessIcon />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ gridColumn: "span 2" }}
                  >
                    {companies.map((company) => (
                      <MenuItem key={company.id} value={company.id}>
                        {company.name}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    select
                    fullWidth
                    variant="filled"
                    label={
                      <span>
                        Role <span style={{ color: "red" }}>*</span>
                      </span>
                    }
                    name="roleId"
                    value={values.roleId}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={!!touched.roleId && !!errors.roleId}
                    helperText={touched.roleId && errors.roleId}
                    disabled={!values.companyId}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <WorkIcon />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ gridColumn: "span 2" }}
                  >
                    {roles.map((role) => (
                      <MenuItem key={role.id} value={role.id}>
                        {role.displayName}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    select
                    fullWidth
                    variant="filled"
                    label={
                      <span>
                        Department <span style={{ color: "red" }}>*</span>
                      </span>
                    }
                    name="departmentId"
                    value={values.departmentId}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={!!touched.departmentId && !!errors.departmentId}
                    helperText={touched.departmentId && errors.departmentId}
                    disabled={!values.companyId}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <ApartmentIcon />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ gridColumn: "span 2" }}
                  >
                    {departments.map((dept) => (
                      <MenuItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>

                <Box display="flex" justifyContent="end" mt="20px">
                  <Button type="submit" color="secondary" variant="contained">
                    {isEditMode ? "Update User" : "Create New User"}
                  </Button>
                  <Button
                    type="button"
                    variant="contained"
                    color="primary"
                    sx={{ ml: 2 }}
                    onClick={() => navigate("/user-list")}
                  >
                    Cancel
                  </Button>
                </Box>
              </form>
            )}
          </Formik>
        )}
        <ToastContainer />
      </Paper>
    </Box>
  );
};

export default CreateUser;
