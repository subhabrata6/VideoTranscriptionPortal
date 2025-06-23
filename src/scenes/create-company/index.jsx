import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  TextField,
  InputAdornment,
  useMediaQuery,
  Paper,
  Typography,
  useTheme,
  CircularProgress,
} from "@mui/material";
import { tokens } from "../../theme";
import { Formik } from "formik";
import * as yup from "yup";
import * as messageHelper from "../../data/Helpers/MessageHelper";
import BusinessIcon from "@mui/icons-material/Business";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, useParams } from "react-router-dom";
import Api from "../../data/Services/Interceptor";
import { ApiEndpoints } from "../../data/Helpers/ApiEndPoints";

const CreateCompany = () => {
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const { companyId } = useParams();

  const [initialValues, setInitialValues] = useState({
    name: "",
    companyAddress: "",
    companyWebsite: "",
    companyPhoneNo: "",
    contactName: "",
    contactEmail: "",
  });
  const [loading, setLoading] = useState(!!companyId);

  const isEditMode = Boolean(companyId);


  const handleFormSubmit = async (values, { resetForm }) => {
  const payload = {
    name: values.name.trim(),
    contactName: values.contactName.trim(),
    contactEmail: values.contactEmail.trim(),
    companyPhoneNo: values.companyPhoneNo.replace(/\s+/g, ""),
    companyAddress: values.companyAddress.trim(),
    companyWebsite: values.companyWebsite.replace(/\s+/g, ""),
  };

  try {
    if (isEditMode) {
      const response = await Api.put(ApiEndpoints.COMPANIES + `/${companyId}`, payload);
      if (response.success && response.statusCode === 200) {
        messageHelper.showSuccessToast("Company updated successfully!");
        resetForm();
        setTimeout(() => {
          navigate("/company-list");
        }, 3000);
      }
    } else {
      const resp = await Api.post(ApiEndpoints.COMPANIES, payload);
      if (resp.statusCode === 201) {
        messageHelper.showSuccessToast("Company created successfully!");
        resetForm();
        setTimeout(() => {
          navigate("/company-list");
        }, 3000);
      }
      else {
        messageHelper.showErrorToast("Failed to create company.");
      }
    }
    
  } catch (error) {
    console.error("Error saving company:", error);
    if (error.response.data.message.includes("Company name must be unique")) {
      messageHelper.showErrorToast("Similar Company Name already exists. Please restore the company from the archive or create a new company with a different name.");
    }
    else{
      messageHelper.showErrorToast("Error saving company. Please try again later.");
    }
  }
};


  const fetchCompany = async () => {
    try {
      const response = await Api.get(ApiEndpoints.COMPANIES + `/${companyId}`);
      if (response.statusCode === 200) {
         // Map API fields to form fields
      setInitialValues({
        name: response.data.name || "",
        companyAddress: response.data.companyAddress || "",
        companyWebsite: response.data.companyWebsite || "",
        companyPhoneNo: response.data.companyPhoneNo || "",
        contactName: response.data.contactName || "",
        contactEmail: response.data.contactEmail || "",
      });
      }
    } catch (error) {
      messageHelper.showErrorToast("Failed to fetch company details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isEditMode) {
      fetchCompany();
    }
  }, [companyId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box m="20px">
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" fontWeight="bold" mb={2}>
          {isEditMode ? "Edit Company" : "Create Company"}
        </Typography>

        <Formik
          enableReinitialize
          initialValues={initialValues}
          validationSchema={companySchema}
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
                  label={
                    <Box display="flex" alignItems="center">
                      Company Name
                      <Typography color="error" component="span" ml={0.5}>*</Typography>
                    </Box>
                  }
                  name="name"
                  placeholder="Enter company name"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.name}
                  error={!!touched.name && !!errors.name}
                  helperText={touched.name && errors.name}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BusinessIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ gridColumn: isNonMobile ? "span 2" : "span 4" }}
                />
                <TextField
                  fullWidth
                  variant="filled"
                  label={
                    <Box display="flex" alignItems="center">
                      Company Address
                      <Typography color="error" component="span" ml={0.5}>*</Typography>
                    </Box>
                  }
                  name="companyAddress"
                  placeholder="Enter company address"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.companyAddress}
                  error={!!touched.companyAddress && !!errors.companyAddress}
                  helperText={touched.companyAddress && errors.companyAddress}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BusinessIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ gridColumn: isNonMobile ? "span 2" : "span 4" }}
                />
                <TextField
                  fullWidth
                  variant="filled"
                  label={
                    <Box display="flex" alignItems="center">
                      Company Website
                      <Typography color="error" component="span" ml={0.5}>*</Typography>
                    </Box>
                  }
                  name="companyWebsite"
                  placeholder="Enter company website"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.companyWebsite}
                  error={!!touched.companyWebsite && !!errors.companyWebsite}
                  helperText={touched.companyWebsite && errors.companyWebsite}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BusinessIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ gridColumn: isNonMobile ? "span 2" : "span 4" }}
                />
                <TextField
                  fullWidth
                  variant="filled"
                  label={
                    <Box display="flex" alignItems="center">
                      Company Phone Number
                      <Typography color="error" component="span" ml={0.5}>*</Typography>
                    </Box>
                  }
                  name="companyPhoneNo"
                  placeholder="Enter company phone number"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.companyPhoneNo}
                  error={!!touched.companyPhoneNo && !!errors.companyPhoneNo}
                  helperText={touched.companyPhoneNo && errors.companyPhoneNo}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BusinessIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ gridColumn: isNonMobile ? "span 2" : "span 4" }}
                />

                <TextField
                  fullWidth
                  variant="filled"
                  label={
                    <Box display="flex" alignItems="center">
                      Contact Person Name
                      <Typography color="error" component="span" ml={0.5}>*</Typography>
                    </Box>
                  }
                  name="contactName"
                  placeholder="Enter contact person's name"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.contactName}
                  error={!!touched.contactName && !!errors.contactName}
                  helperText={touched.contactName && errors.contactName}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ gridColumn: isNonMobile ? "span 2" : "span 4" }}
                />

                <TextField
                  fullWidth
                  variant="filled"
                  label={
                    <Box display="flex" alignItems="center">
                      Contact Person Email
                      <Typography color="error" component="span" ml={0.5}>*</Typography>
                    </Box>
                  }
                  placeholder="Enter contact person's email"
                  name="contactEmail"
                  type="email"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.contactEmail}
                  error={!!touched.contactEmail && !!errors.contactEmail}
                  helperText={touched.contactEmail && errors.contactEmail}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ gridColumn: isNonMobile ? "span 2" : "span 4"}}
                />
              </Box>

              <Box display="flex" justifyContent="flex-end" mt={3}>
                <Button type="submit" variant="contained" color="primary">
                  {isEditMode ? "Update Company" : "Create Company"}
                </Button>
                <Button type="button" variant="contained" color="primary" sx={{ ml: 2 }} onClick={() => navigate("/company-list")}>
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

const companySchema = yup.object().shape({
  name: yup.string().required("Company name is required"),
  companyAddress: yup.string().required("Company address is required"),
  companyWebsite: yup.string().matches(
            /((https?):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/,
            'Enter correct url!'
        )
        .required('Please enter website'),
  companyPhoneNo: yup.string().required("Company phone number is required"),
  contactName: yup.string().required("Contact person name is required"),
  contactEmail: yup
    .string()
    .email("Invalid email address")
    .required("Email is required"),
});


export default CreateCompany;
