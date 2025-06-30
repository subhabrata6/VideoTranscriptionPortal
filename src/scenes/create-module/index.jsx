import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  OutlinedInput,
  Chip,
  Checkbox,
  ListItemText,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import Api from "../../data/Services/Interceptor";
import * as messageHelper from "../../data/Helpers/MessageHelper";
import { ApiEndpoints } from "../../data/Helpers/ApiEndPoints";
import Header from "../../components/Header";
import { ToastContainer } from "react-toastify";

const validationSchema = Yup.object({
  moduleName: Yup.string().required("Module name is required"),
  actions: Yup.array().min(1, "Select at least one action"),
});

const CreateModule = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const [actionsList, setActionsList] = useState([]);
  const [initialValues, setInitialValues] = useState({ moduleName: "", actions: [] });
  const isEditMode = Boolean(moduleId);

  const fetchActions = async () => {
    try {
      const response = await Api.get(ApiEndpoints.ACTIONS);
      if (response.statusCode === 200 && Array.isArray(response.data?.items)) {
        setActionsList(response.data.items);
      } else {
        messageHelper.showErrorToast("Failed to load actions.");
      }
    } catch (error) {
      messageHelper.showErrorToast("Error fetching actions: " + error.message);
    }
  };

  const fetchModule = async () => {
    try {
      const response = await Api.get(`${ApiEndpoints.MODULE}/${moduleId}`);
      if (response.statusCode === 200) {
        setInitialValues(prev => ({
          ...prev,
          moduleName: response.data.moduleName || ""
        }));
      }
    } catch (error) {
      messageHelper.showErrorToast("Failed to load module: " + error.message);
    }
  };

  const fetchModuleActions = async () => {
    try {
      const response = await Api.get(`${ApiEndpoints.MODULE_ACTIONS}/module/${moduleId}`);
      if (response.statusCode === 200 && Array.isArray(response.data)) {
        const actionIds = response.data.map(ma => ma.actionId);
        setInitialValues(prev => ({
          ...prev,
          actions: actionIds,
        }));
      }
    } catch (error) {
      messageHelper.showErrorToast("Failed to load module actions: " + error.message);
    }
  };

  useEffect(() => {
    fetchActions();
  }, []);

  useEffect(() => {
    if (isEditMode) {
      fetchModule();
      fetchModuleActions();
    }
  }, [moduleId]);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      if (isEditMode) {
        const response = await Api.put(`${ApiEndpoints.MODULE}/${moduleId}`, {
          moduleName: values.moduleName,
        });

        if (response.success && response.statusCode === 200) {
          // Update module actions
          const actionPayload = {
            moduleId,
            actionIds: values.actions,
          };

          const actionsResponse = await Api.post(
            `${ApiEndpoints.MODULE_ACTIONS}/module`,
            actionPayload
          );

          if (actionsResponse.success && actionsResponse.statusCode === 201) {
            messageHelper.showSuccessToast("Module updated successfully.");
            setTimeout(() => navigate("/module-list"), 3000);
          } else {
            messageHelper.showErrorToast("Module updated but failed to assign actions.");
          }
        } else {
          messageHelper.showErrorToast("Failed to update module.");
        }
      } else {
        const moduleResponse = await Api.post(ApiEndpoints.MODULE, {
          moduleName: values.moduleName,
        });

        if (moduleResponse.success && moduleResponse.statusCode === 201) {
          const newModuleId = moduleResponse.data?.id;

          if (!newModuleId) {
            messageHelper.showErrorToast("Module ID missing from response.");
            return;
          }

          const actionPayload = {
            moduleId: newModuleId,
            actionIds: values.actions,
          };

          const actionsResponse = await Api.post(
            `${ApiEndpoints.MODULE_ACTIONS}/module`,
            actionPayload
          );

          if (actionsResponse.success && actionsResponse.statusCode === 201) {
            messageHelper.showSuccessToast("Module created successfully.");
            setTimeout(() => navigate("/module-list"), 3000);
          } else {
            messageHelper.showErrorToast("Module created but failed to assign actions.");
          }
        } else {
          messageHelper.showErrorToast("Failed to create module.");
        }
      }
    } catch (error) {
      messageHelper.showErrorToast("Operation failed: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box p={4}>
      <Header
        title={isEditMode ? "EDIT MODULE" : "CREATE MODULE"}
        subtitle={isEditMode ? "Update existing module" : "Create a new module"}
      />
      <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
        <Formik
          initialValues={initialValues}
          enableReinitialize
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            setFieldValue,
            isSubmitting,
          }) => (
            <Form>
              <Box display="flex" flexDirection="column" gap={3}>
                <TextField
                  label="Module Name"
                  name="moduleName"
                  value={values.moduleName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={Boolean(touched.moduleName && errors.moduleName)}
                  helperText={touched.moduleName && errors.moduleName}
                  fullWidth
                />

                <FormControl fullWidth disabled={values.moduleName.trim().length < 2}>
                  <InputLabel id="actions-label">Module Actions</InputLabel>
                  <Select
                    labelId="actions-label"
                    multiple
                    name="actions"
                    value={values.actions}
                    onChange={(e) => {
                      const selected = e.target.value;
                      if (selected.includes("all")) {
                        const allIds = actionsList.map((a) => a.id);
                        setFieldValue(
                          "actions",
                          values.actions?.length === allIds.length ? [] : allIds
                        );
                      } else {
                        setFieldValue("actions", selected);
                      }
                    }}
                    input={<OutlinedInput label="Module Actions" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {selected.map((id) => {
                          const action = actionsList.find((a) => a.id === id);
                          return <Chip key={id} label={action?.actionName || id} />;
                        })}
                      </Box>
                    )}
                  >
                    <MenuItem value="all">
                      <Checkbox
                        checked={
                          actionsList.length > 0 &&
                          values.actions.length === actionsList.length
                        }
                        indeterminate={
                          values.actions.length > 0 &&
                          values.actions.length < actionsList.length
                        }
                      />
                      <ListItemText primary="Select All" />
                    </MenuItem>

                    {actionsList.map((action) => (
                      <MenuItem key={action.id} value={action.id}>
                        <Checkbox checked={values.actions.includes(action.id)} />
                        <ListItemText primary={action.actionName} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Box display="flex" justifyContent="flex-end" gap={2}>
                  <Button type="submit" variant="contained" disabled={isSubmitting}>
                    {isEditMode ? "Update" : "Create"}
                  </Button>
                  <Button
                    type="button"
                    variant="contained"
                    color="primary"
                    sx={{ ml: 1 }}
                    onClick={() => navigate("/module-list")}
                  >
                    Cancel
                  </Button>
                </Box>
              </Box>
            </Form>
          )}
        </Formik>
        <ToastContainer />
      </Paper>
    </Box>
  );
};

export default CreateModule;
