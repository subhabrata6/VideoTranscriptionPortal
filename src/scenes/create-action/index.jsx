import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Paper,
  TextField,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import Api from "../../data/Services/Interceptor";
import * as messageHelper from "../../data/Helpers/MessageHelper";
import { ApiEndpoints } from "../../data/Helpers/ApiEndPoints";
import Header from "../../components/Header";
import { ToastContainer } from "react-toastify";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";

const validationSchema = Yup.object({
  actionName: Yup.string()
    .required("Action name is required")
    .min(2, "Minimum 2 characters"),
});

const CreateAction = () => {
  const { actionId } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(actionId);

  const [initialValues, setInitialValues] = useState({
    actionName: "",
  });

  // Fetch existing action details for edit
  const fetchActionDetails = async () => {
    try {
      const response = await Api.get(`${ApiEndpoints.ACTIONS}/${actionId}`);
      if (response.statusCode === 200) {
        setInitialValues({
          actionName: response.data.actionName || "",
        });
      } else {
        messageHelper.showErrorToast("Failed to load action details.");
      }
    } catch (error) {
      messageHelper.showErrorToast("Error fetching action: " + error.message);
    }
  };

  useEffect(() => {
    if (isEditMode) {
      fetchActionDetails();
    }
  }, [actionId]);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      if (isEditMode) {
        const response = await Api.put(`${ApiEndpoints.ACTIONS}/${actionId}`, values);
        if (response.statusCode === 200) {
          messageHelper.showSuccessToast("Action updated successfully.");
          setTimeout(() => navigate("/action-list"), 2000);
        } else {
          messageHelper.showErrorToast("Failed to update action.");
        }
      } else {
        const response = await Api.post(ApiEndpoints.ACTIONS, values);
        if (response.statusCode === 201) {
          messageHelper.showSuccessToast("Action created successfully.");
          setTimeout(() => navigate("/action-list"), 2000);
        } else {
          messageHelper.showErrorToast("Failed to create action.");
        }
      }
    } catch (error) {
      messageHelper.showErrorToast("Operation failed: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box p={1}>
      <Header
        title={isEditMode ? "EDIT ACTION" : "CREATE ACTION"}
        subtitle={isEditMode ? "Update existing action" : "Create a new action"}
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
            isSubmitting,
          }) => (
            <Form>
              <Box display="flex" flexDirection="column" gap={3}>
                <TextField
                  label="Action Name"
                  name="actionName"
                  value={values.actionName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={Boolean(touched.actionName && errors.actionName)}
                  helperText={touched.actionName && errors.actionName}
                  fullWidth
                />

                <Box display="flex" justifyContent="flex-end" gap={2}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={isSubmitting}
                  >
                    {isEditMode ? "Update" : "Submit"}
                  </Button>

                  <Button
                    type="button"
                    variant="outlined"
                    color="secondary"
                    onClick={() => navigate("/action-list")}
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

export default CreateAction;
