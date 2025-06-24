import React, { useEffect, useState, useContext } from "react";
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
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import Api from "../../data/Services/Interceptor";
import * as messageHelper from "../../data/Helpers/MessageHelper";
import { ApiEndpoints } from "../../data/Helpers/ApiEndPoints";
import GlobalLoader from "../global/Loader";
import Header from "../../components/Header";

const validationSchema = Yup.object({
  name: Yup.string().required("Module name is required"),
});

const CreateModule = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [actionsList, setActionsList] = useState([]);
  //const { showLoader, hideLoader } = useContext(LoaderContext);
  const [initialValues, setInitialValues] = useState({ name: "", actions: [] });

  const isEditMode = Boolean(id);

  const fetchActions = async () => {
    try {
      const response = await Api.get(ApiEndpoints.ACTION);
      if (response.statusCode === 200 && Array.isArray(response.data)) {
        setActionsList(response.data); // Assumes array of strings like ["Create", "Read", ...]
      } else {
        messageHelper.showErrorToast("Failed to load actions.");
      }
    } catch (error) {
      messageHelper.showErrorToast("Error fetching actions: " + error.message);
    }
  };

  const fetchModule = async () => {
    //showLoader();
    try {
      const response = await Api.get(`${ApiEndpoints.MODULES}/${id}`);
      if (response.statusCode === 200) {
        setInitialValues({
          name: response.data.name || "",
          actions: response.data.actions || [],
        });
      }
    } catch (error) {
      messageHelper.showErrorToast("Failed to load module: " + error.message);
    } finally {
      //hideLoader();
    }
  };

  useEffect(() => {
    fetchActions();
  }, []);

  useEffect(() => {
    if (isEditMode) {
      fetchModule();
    }
  }, [id]);

  const handleSubmit = async (values, { setSubmitting }) => {
    //showLoader();
    try {
      if (isEditMode) {
        const response = await Api.put(`${ApiEndpoints.MODULES}/${id}`, values);
        if (response.statusCode === 200) {
          messageHelper.showSuccessToast("Module updated successfully.");
          navigate("/module-list");
        }
      } else {
        const response = await Api.post(ApiEndpoints.MODULES, values);
        if (response.statusCode === 200) {
          messageHelper.showSuccessToast("Module created successfully.");
          navigate("/module-list");
        }
      }
    } catch (error) {
      messageHelper.showErrorToast("Operation failed: " + error.message);
    } finally {
      setSubmitting(false);
      //hideLoader();
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
                  name="name"
                  value={values.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={Boolean(touched.name && errors.name)}
                  helperText={touched.name && errors.name}
                  fullWidth
                />

                <FormControl fullWidth disabled={values.name.trim().length < 2}>
                  <InputLabel id="actions-label">Module Actions</InputLabel>
                  <Select
                    labelId="actions-label"
                    multiple
                    name="actions"
                    value={values.actions}
                    onChange={(e) => setFieldValue("actions", e.target.value)}
                    input={<OutlinedInput label="Module Actions" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} />
                        ))}
                      </Box>
                    )}
                  >
                    {actionsList.map((action) => (
                      <MenuItem key={action} value={action}>
                        {action}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Box display="flex" justifyContent="flex-end" gap={2}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate("/module-list")}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting}
                  >
                    {isEditMode ? "Update" : "Create"}
                  </Button>
                </Box>
              </Box>
            </Form>
          )}
        </Formik>
      </Paper>
    </Box>
  );
};

export default CreateModule;
