import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography,
  Avatar,
  useMediaQuery,
  InputAdornment,
  IconButton,
} from "@mui/material";
import {
  Search as SearchIcon,
  Group as GroupIcon,
  Close as CloseIcon,
} from "@mui/icons-material";

import { useTheme } from "@mui/material/styles";
import { ToastContainer } from "react-toastify";
import * as messageHelper from "../../data/Helpers/MessageHelper";
import { ApiEndpoints } from "../../data/Helpers/ApiEndPoints";
import { tokens } from "../../theme";
import Api from "../../data/Services/Interceptor";

const RolePermissionsManager = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));

  const [roles, setRoles] = useState([]);
  const [modules, setModules] = useState([]);
  const [actionMap, setActionMap] = useState({});
  const [moduleActionsMap, setModuleActionsMap] = useState({});
  const [loadingData, setLoadingData] = useState(true);
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [selectedRoleName, setSelectedRoleName] = useState("");
  const [savedPermissions, setSavedPermissions] = useState({});
  const [currentPermissions, setCurrentPermissions] = useState({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const fetchInitialData = async () => {
    setLoadingData(true);
    try {
      const [rolesRes, modulesRes, actionsRes, moduleActionsRes] =
        await Promise.all([
          Api.get(ApiEndpoints.ROLE),
          Api.get(ApiEndpoints.MODULE),
          Api.get(ApiEndpoints.ACTIONS),
          Api.get(ApiEndpoints.MODULE_ACTIONS),
        ]);

      // 1. Actions
      const actionsList = actionsRes.data?.items || [];
      const actMap = {};
      actionsList.forEach((action) => {
        actMap[String(action.id)] = action.actionName;
      });
      setActionMap(actMap);

      // 2. Module-Actions Mapping
      const moduleActions = moduleActionsRes.data || [];
      const lookup = {}; // moduleId -> [actionName]

      moduleActions.forEach(({ moduleId, actionId }) => {
        const actionName = actMap[String(actionId)];
        if (actionName) {
          if (!lookup[moduleId]) {
            lookup[moduleId] = [];
          }
          if (!lookup[moduleId].includes(actionName)) {
            lookup[moduleId].push(actionName);
          }
        }
      });

      // 3. Modules
      const modulesList = modulesRes.data?.items || [];
      const enrichedModules = modulesList.map((mod) => ({
        ...mod,
        name: mod.moduleName,
        actions: lookup[mod.id] || [],
      }));
      setModules(enrichedModules);
      setModuleActionsMap(lookup);

      // 4. Roles
      const roleItems = rolesRes.data?.items || [];
      setRoles(
        roleItems.map((r) => ({
          id: r.id,
          name: r.name,
        }))
      );

    } catch (err) {
      messageHelper.showErrorToast("Failed to load roles/modules/actions.");
      console.error(err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    setSelectedRoleId(null);
    setSelectedRoleName("");
    setSearchTerm("");
    setSavedPermissions({});
    setCurrentPermissions({});
  }, []);

  useEffect(() => {
    const fetchPermissions = async () => {
      if (!selectedRoleId || modules.length === 0) return;

      setLoadingPermissions(true);
      try {
        const role = roles.find((r) => r.id === selectedRoleId);
        setSelectedRoleName(role?.name || "");

        const res = await Api.get(
          `${ApiEndpoints.ROLE_PERMISSIONS}/get-role-wise-permissions/role/${selectedRoleId}`
        );
        const perms = res?.data || {};
        const normalized = {};
        console.log("Fetched permissions:", perms);

        modules.forEach(({ id, name, actions }) => {
          const modulePerm = perms.modules?.find((m) => m.moduleId === id);
          const enabledActionIds = modulePerm?.actionIds || [];
          normalized[name] = {};
          actions.forEach((actionName) => {
            const actionId = Object.entries(actionMap).find(
              ([id, name]) => name === actionName
            )?.[0];
            normalized[name][actionName] = enabledActionIds.includes(actionId);
          });
        });
        console.log("Resolved permissions:", normalized);
        setSavedPermissions(normalized);
        setCurrentPermissions(normalized);
      } catch (err) {
        messageHelper.showErrorToast("Failed to load permissions");
        console.error(err);
      } finally {
        setLoadingPermissions(false);
      }
    };

    fetchPermissions();
  }, [selectedRoleId, modules, actionMap]);

const handleSave = async () => {
  if (!selectedRoleId) {
    messageHelper.showErrorToast("No role selected");
    return;
  }

  const payload = {
    roleId: selectedRoleId,
    modules: [],
  };

  modules.forEach((module) => {
    const modulePerms = currentPermissions[module.name];
    if (!modulePerms) return;

    const selectedActionIds = Object.entries(modulePerms)
      .filter(([, isEnabled]) => isEnabled)
      .map(([actionName]) => {
        // Find the actionId from actionMap by actionName
        const actionId = Object.entries(actionMap).find(
          ([, name]) => name === actionName
        )?.[0];
        return actionId;
      })
      .filter(Boolean); // Remove undefined/null

    if (selectedActionIds.length > 0) {
      payload.modules.push({
        moduleId: module.id,
        actionIds: selectedActionIds,
      });
    }
  });

  try {
    const resp = await Api.post(ApiEndpoints.ROLE_PERMISSIONS + "/save-role-wise-permissions", payload);
    if (resp.statusCode === 201 || resp.success) {
      messageHelper.showSuccessToast("Permissions updated successfully");
      setSavedPermissions(currentPermissions);
      setSnackbarOpen(true);
    }
  } catch (err) {
    messageHelper.showErrorToast("Failed to update permissions");
  }
};



  const togglePermission = (moduleName, action, isChecked ) => {
    setCurrentPermissions((prev) => ({
      ...prev,
      [moduleName]: {
        ...prev[moduleName],
        [action]: isChecked,
      },
    }));
  };

 const toggleSelectAll = (action) => {
  const eligibleModules = modules.filter((mod) => mod.actions.includes(action));

  const isAllChecked = eligibleModules.every(
    (mod) => currentPermissions[mod.name]?.[action]
  );

  const updatedPermissions = { ...currentPermissions };

  eligibleModules.forEach(({ name }) => {
    if (!updatedPermissions[name]) {
      updatedPermissions[name] = {};
    }
    updatedPermissions[name][action] = !isAllChecked;
  });

  setCurrentPermissions(updatedPermissions);
};

const allCheckedForAction = (action) => {
  const eligibleModules = modules.filter((mod) => mod.actions.includes(action));
  if (eligibleModules.length === 0) return false;

  return eligibleModules.every(
    (mod) => currentPermissions[mod.name]?.[action]
  );
};



  const isAllSelected = (action) =>
    modules
      .filter(({ actions }) => actions.includes(action))
      .every(({ name }) => currentPermissions[name]?.[action]);

  // Fix: Ensure filteredRoles is always up-to-date and not empty on role select
  const filteredRoles = useMemo(() => {
    return searchTerm.trim()
      ? roles.filter((r) =>
          r.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : roles;
  }, [searchTerm, roles]);

  // Fix: Ensure currentPermissions is always rebuilt when selectedRoleId or modules change
  useEffect(() => {
    if (!selectedRoleId || modules.length === 0) return;

    const fetchPermissions = async () => {
      setLoadingPermissions(true);
      try {
        const role = roles.find((r) => r.id === selectedRoleId);
        setSelectedRoleName(role?.name || "");

        const res = await Api.get(
          `${ApiEndpoints.ROLE_PERMISSIONS}/get-role-wise-permissions/role/${selectedRoleId}`
        );
        const perms = res?.data || {};
        const normalized = {};

        modules.forEach(({ id, name, actions }) => {
          const modulePerm = perms.modules?.find((m) => m.moduleId === id);
          const enabledActionIds = modulePerm?.actionIds || [];
          normalized[name] = {};
          actions.forEach((actionName) => {
            const actionId = Object.entries(actionMap).find(
              ([id, n]) => n === actionName
            )?.[0];
            normalized[name][actionName] = enabledActionIds.includes(actionId);
          });
        });

        setSavedPermissions(normalized);
        setCurrentPermissions(normalized);
      } catch (err) {
        messageHelper.showErrorToast("Failed to load permissions");
        console.error(err);
      } finally {
        setLoadingPermissions(false);
      }
    };

    fetchPermissions();
    // eslint-disable-next-line
  }, [selectedRoleId, modules, actionMap]);

  return (
    <Box
      sx={{
        backgroundColor:
          tokens(theme.palette?.mode || "light")?.background?.default || "#fff",
      }}
    >
      {loadingData ? (
        <Box display="flex" justifyContent="center" alignItems="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Box
          display="flex"
          flexDirection={isSmallScreen ? "column" : "row"}
          gap={2}
        >
          {/* Role Selector */}
          <Paper
            sx={{ width: isSmallScreen ? "100%" : 300, p: 2 }}
            elevation={3}
          >
            <Typography variant="h6">Select Role</Typography>

            <TextField
              size="small"
              fullWidth
              placeholder="Search roles"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              sx={{ my: 2 }}
            />

            <List
              dense
              sx={{
                border: "1px solid #ccc",
                borderRadius: 1,
                maxHeight: 400,
                overflow: "auto",
              }}
            >
              {filteredRoles.length === 0 ? (
                <Typography textAlign="center" color="text.secondary" p={2}>
                  No roles found.
                </Typography>
              ) : (
                filteredRoles.map(({ id, name }) => (
                  <ListItemButton
                    key={id}
                    selected={id === selectedRoleId}
                    onClick={() => setSelectedRoleId(id)}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: "primary.main" }}>
                        <GroupIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={name.includes("_")
                        ? name.split("_").map((part, idx) => (
                          <span key={idx}>
                          {part}
                          {idx !== name.split("_").length - 1 && <br />}
                          </span>
                        ))
                        : name } />
                  </ListItemButton>
                ))
              )}
            </List>
          </Paper>

          <Paper sx={{ flex: 1, p: 3 }} elevation={3}>
            <Typography variant="h6" gutterBottom>
              Permissions for:{" "}
              <Box
                component="span"
                fontWeight="bold"
                color={selectedRoleId ? "text.primary" : "text.disabled"}
              >
                {selectedRoleName || "(Select a role)"}
              </Box>
            </Typography>

            {loadingPermissions ? (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                mt={4}
              >
                <CircularProgress />
              </Box>
            ) : (
              <>
                {(modules[0]?.actions || []).length === 0 ? (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    textAlign="center"
                    mt={2}
                  >
                    No module actions found to display.
                  </Typography>
                ) : (
                  <Box
                    component="table"
                    sx={{ width: "100%", borderCollapse: "collapse", mb: 2 }}
                  >
                    <thead>
                      <tr>
                        <th
                          style={{
                            textAlign: "center",
                            padding: 8,
                            border: "2px solid rgb(27, 59, 163)",
                            background: "rgb(2 35 157)",
                            fontWeight: "bold",
                            fontSize: "1.1rem",
                            color: "rgb(255 255 255)",
                          }}
                        >
                          Module
                        </th>
                        {(modules[0]?.actions || []).map((action) => (
                          <th
                            key={action}
                            style={{
                              textAlign: "center",
                              padding: 8,
                              border: "2px solid rgb(27, 59, 163)",
                              background: "rgb(2 35 157)",
                              fontWeight: "bold",
                              fontSize: "1.1rem",
                              color: "rgb(255 255 255)",
                            }}
                          >
                            <FormControlLabel
                              control={
                                <Checkbox
                                  size="small"
                                  checked={allCheckedForAction(action)}
                                  onChange={() => toggleSelectAll(action)}
                                  disabled={!selectedRoleId}
                                  sx={{
                                    color: "#1caee9",
                                    '&.Mui-checked': {
                                      color: "#1caee9",
                                    },
                                  }}
                                />
                              }
                              label={action}
                              labelPlacement="top"
                              sx={{ userSelect: "none" }}
                            />
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {modules.map(({ name, actions }) => (
                        <tr key={name}>
                          <td style={{ padding: 8 }}>{name}</td>
                          {actions.map((action) => (
                            <td key={action} style={{ textAlign: "center" }}>
                              <Checkbox
                                size="small"
                                checked={
                                  currentPermissions[name]?.[action] || false
                                }
                                onChange={(e) => togglePermission(name, action, e.target.checked)}
                                disabled={!selectedRoleId}
                                sx={{
                                  color: "#1caee9",
                                  '&.Mui-checked': {
                                    color: "#1caee9",
                                  },
                                }}
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </Box>
                )}

                <Stack direction="row" justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    color="warning"
                    disabled={!selectedRoleId}
                    onClick={() => {
                      const reset = {};
                      modules.forEach(({ name, actions }) => {
                        reset[name] = {};
                        actions.forEach((a) => (reset[name][a] = false));
                      });
                      setCurrentPermissions(reset);
                      setSavedPermissions(reset);
                    }}
                  >
                    Revert to Default
                  </Button>
                  <Button
                    variant="outlined"
                    disabled={!selectedRoleId}
                    onClick={() => setCurrentPermissions(savedPermissions)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    disabled={!selectedRoleId}
                    onClick={handleSave}
                  >
                    Save Changes
                  </Button>
                </Stack>
              </>
            )}
          </Paper>
        </Box>
      )}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message="Permissions saved"
        action={
          <IconButton
            size="small"
            onClick={() => setSnackbarOpen(false)}
            color="inherit"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />
    </Box>
  );
};

export default RolePermissionsManager;
