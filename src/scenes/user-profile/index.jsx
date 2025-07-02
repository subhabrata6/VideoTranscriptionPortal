import React, { useEffect, useState } from "react";
import {
  Grid,
  TextField,
  Typography,
  Box,
  Button,
  Avatar,
  useTheme,
  Paper,
  CircularProgress,
  Stack,
  Divider,
  IconButton,
  Tooltip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { useFormik } from "formik";
import * as Yup from "yup";
import { tokens } from "../../theme";
import Api from "../../data/Services/Interceptor";
import { ApiEndpoints } from "../../data/Helpers/ApiEndPoints";
import * as messageHelper from "../../data/Helpers/MessageHelper";

const UserProfile = () => {
  const [initialValues, setInitialValues] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await Api.get(ApiEndpoints.USERS + "/me");
        setInitialValues(userRes.data);
      } catch (error) {
        messageHelper.showErrorToast("Failed to load profile data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: initialValues || {
      name: "",
      email: "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Name is required"),
    }),
    onSubmit: async (values) => {
      try {
        const response = await Api.put(ApiEndpoints.USERS + "/me", values);
        if (response.statusCode === 200 || response.success) {
          messageHelper.showSuccessToast("Profile updated successfully.");
          setInitialValues(values); // update initial after successful save
          setIsEditing(false);
        } else {
          messageHelper.showErrorToast("Failed to update profile.");
        }
      } catch (error) {
        messageHelper.showErrorToast("Update failed.");
      }
    },
  });

  const handleCancel = () => {
    formik.resetForm(); // revert changes
    setIsEditing(false);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!initialValues) return null;

return (
    <Box
        maxWidth={700}
        mx="auto"
        mt={4}
        display="flex"
        flexDirection="column"
        justifyContent="center"
        minHeight="80vh"
    >
        <Paper
            elevation={3}
            sx={{
                borderRadius: 3,
                p: 4,
                bgcolor: colors.primary[500],
                minHeight: "70vh",
            }}
        >
            <form onSubmit={formik.handleSubmit}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
                    <Typography variant="h5" fontWeight={700} color={colors.primary[500]}>
                        My Profile
                    </Typography>
                </Stack>
                <Divider sx={{ mb: 3, bgcolor: colors.divider }} />

                <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                        <Box display="flex" flexDirection="column" alignItems="center">
                            <Avatar
                                src={initialValues.profileImage}
                                sx={{
                                    width: 100,
                                    height: 100,
                                    mb: 2,
                                    border: `3px solid ${colors.primary[600]}`,
                                    bgcolor: colors.primary[500],
                                }}
                            />
                            <Typography variant="subtitle2" color={colors.text.secondary}>
                                User Role: {initialValues.roles?.join(", ") || "N/A"}
                            </Typography>
                        </Box>
                    </Grid>

                    <Grid item xs={12} md={8}>
                        <Box
                            p={3}
                            borderRadius={2}
                            bgcolor={colors.background.default}
                            boxShadow={1}
                        >
                            <Typography fontWeight="bold" mb={2} variant="subtitle1" color={colors.primary[500]}>
                                Profile Information
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Box position="relative">
                                        <TextField
                                            name="name"
                                            label="Name"
                                            fullWidth
                                            value={formik.values.name}
                                            onChange={formik.handleChange}
                                            error={formik.touched.name && Boolean(formik.errors.name)}
                                            helperText={formik.touched.name && formik.errors.name}
                                            variant="outlined"
                                            size="small"
                                            InputProps={{
                                                readOnly: !isEditing,
                                                sx: {
                                                    bgcolor: colors.primary[500],
                                                    color: colors.primary[100],
                                                },
                                            }}
                                            InputLabelProps={{
                                                sx: { color: colors.text.secondary },
                                            }}
                                        />
                                        {!isEditing && (
                                            <Tooltip title="Edit Name">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => setIsEditing(true)}
                                                    sx={{
                                                        position: "absolute",
                                                        right: 8,
                                                        top: "50%",
                                                        transform: "translateY(-50%)",
                                                        opacity: 0.6,
                                                        color: colors.primary[400],
                                                        "&:hover": { opacity: 1, color: colors.primary[300] },
                                                    }}
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                    </Box>
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        label="Email"
                                        value={formik.values.email}
                                        fullWidth
                                        disabled
                                        variant="outlined"
                                        size="small"
                                        InputLabelProps={{
                                            shrink: true,
                                            sx: { color: colors.text.secondary },
                                        }}
                                        InputProps={{
                                            sx: {
                                                bgcolor: colors.primary[500],
                                                color: colors.primary[500],
                                            },
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        label="Contact Number"
                                        value={initialValues.contactNumber || ""}
                                        fullWidth
                                        disabled
                                        variant="outlined"
                                        size="small"
                                        InputLabelProps={{
                                            shrink: true,
                                            sx: { color: colors.text.secondary },
                                        }}
                                        InputProps={{
                                            sx: {
                                                bgcolor: colors.primary[500],
                                                color: colors.primary[500],
                                            },
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        label="Department Name"
                                        value={initialValues.departmentName || ""}
                                        fullWidth
                                        disabled
                                        variant="outlined"
                                        size="small"
                                        InputLabelProps={{
                                            shrink: true,
                                            sx: { color: colors.text.secondary },
                                        }}
                                        InputProps={{
                                            sx: {
                                                bgcolor: colors.primary[500],
                                                color: colors.primary[500],
                                            },
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        label="Company Name"
                                        value={initialValues.companyName || ""}
                                        fullWidth
                                        disabled
                                        variant="outlined"
                                        size="small"
                                        InputLabelProps={{
                                            shrink: true,
                                            sx: { color: colors.text.secondary },
                                        }}
                                        InputProps={{
                                            sx: {
                                                bgcolor: colors.primary[500],
                                                color: colors.primary[500],
                                            },
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                    </Grid>
                </Grid>

                {isEditing && (
                    <Box display="flex" justifyContent="flex-end" mt={4} gap={2}>
                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={handleCancel}
                            sx={{
                                borderRadius: 2,
                                px: 4,
                                color: colors.secondary[400],
                                borderColor: colors.secondary[400],
                                "&:hover": {
                                    borderColor: colors.secondary[300],
                                    backgroundColor: colors.secondary[900],
                                },
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            type="submit"
                            sx={{
                                borderRadius: 2,
                                px: 4,
                                bgcolor: colors.primary[500],
                                color: colors.primary[100],
                                "&:hover": {
                                    bgcolor: colors.primary[300],
                                },
                            }}
                        >
                            Update
                        </Button>
                    </Box>
                )}
            </form>
        </Paper>
    </Box>
);
};

export default UserProfile;
