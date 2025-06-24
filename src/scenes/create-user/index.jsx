import {
  Box,
  Button,
  TextField,
  MenuItem,
  InputAdornment,
  useMediaQuery,
} from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import Header from "../../components/Header";
import { useEffect, useState } from "react";
import Api from "../../data/Services/Interceptor";
import { useNavigate } from "react-router-dom";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import BusinessIcon from "@mui/icons-material/Business";
import WorkIcon from "@mui/icons-material/Work";
import { ApiEndpoints } from "../../data/Helpers/ApiEndPoints";

const DEFAULT_PASSWORD = "Cispl@123";

const CreateUser = () => {
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const navigate = useNavigate();

  const [companies, setCompanies] = useState([]);
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const companyRes = await Api.get(ApiEndpoints.COMPANIES);
        setCompanies(companyRes.data.items || []);
      } catch (err) {
        console.error("Failed to fetch companies");
      }
    };
    fetchCompanies();
  }, []);

  const fetchRolesByCompany = async (companyId) => {
    try {
      const roleRes = await Api.get(ApiEndpoints.ROLE +`?companyId=${companyId}`);
      setRoles(roleRes.data.items || []);
    } catch (err) {
      console.error("Failed to fetch roles");
    }
  };

  const handleFormSubmit = async (values) => {
    try {
      const payload = {
        email: values.email,
        password: DEFAULT_PASSWORD,
        companyId: values.companyId,
        name: values.name,
        roles: [values.roleId], // Ensure roles is an array
      };
      
      const response = await Api.post(ApiEndpoints.USERS, payload);
      if (response.success) {
        navigate("/user-list");
      }
    } catch (err) {
      console.error("Failed to create user", err);
    }
  };

  return (
    <Box m="20px">
      <Header title="CREATE USER" subtitle="Create a New User Profile" />

      <Formik
        onSubmit={handleFormSubmit}
        initialValues={initialValues}
        validationSchema={userSchema}
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
                "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
              }}
            >
              <TextField
                fullWidth
                variant="filled"
                label="User Name"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.name}
                name="name"
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
                label="Email"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.email}
                name="email"
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
                label="Select Company"
                name="companyId"
                value={values.companyId}
                onChange={async (e) => {
                  const selectedCompanyId = e.target.value;
                  setFieldValue("companyId", selectedCompanyId);
                  setFieldValue("roleId", ""); // Reset role when company changes
                  setRoles([]);
                  await fetchRolesByCompany(selectedCompanyId);
                }}
                onBlur={handleBlur}
                error={!!touched.companyId && !!errors.companyId}
                helperText={touched.companyId && errors.companyId}
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
                label="Select Role"
                name="roleId"
                value={values.roleId}
                onChange={handleChange}
                onBlur={handleBlur}
                error={!!touched.roleId && !!errors.roleId}
                helperText={touched.roleId && errors.roleId}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <WorkIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ gridColumn: "span 2" }}
                disabled={!values.companyId || roles.length === 0}
              >
                {roles.map((role) => (
                  <MenuItem key={role.id} value={role.id}>
                    {role.displayName}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            <Box display="flex" justifyContent="end" mt="20px">
              <Button type="submit" color="secondary" variant="contained">
                Create New User
              </Button>
            </Box>
          </form>
        )}
      </Formik>
    </Box>
  );
};

const userSchema = yup.object().shape({
  name: yup.string().required("User name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  companyId: yup.string().required("Company is required"),
  roleId: yup.string().required("Role is required"),
});

const initialValues = {
  name: "",
  email: "",
  companyId: "",
  roleId: "",
};

export default CreateUser;
