import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  IconButton,
  CircularProgress,
  Button,
  Tooltip,
  TextField,
  useTheme,
} from "@mui/material";
import { tokens } from "../../theme";
import { useNavigate } from "react-router-dom";
import { DataGrid } from "@mui/x-data-grid";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import EditIcon from "@mui/icons-material/Edit";
import Header from "../../components/Header";
import Api from "../../data/Services/Interceptor";
import * as messageHelper from "../../data/Helpers/MessageHelper";
import { ToastContainer } from "react-toastify";
import { ApiEndpoints } from "../../data/Helpers/ApiEndPoints";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [sortColumn, setSortColumn] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const navigate = useNavigate();

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const fetchUsers = async () => {
    try {
      const params = {
        PageNumber: page + 1, // API is 1-indexed
        PageSize: pageSize,
        SortBy: sortColumn,
        SortOrder: sortDirection.toUpperCase(),
        Search: search,
      };

      const response = await Api.get(ApiEndpoints.USERS, { params });

      if (response.statusCode === 200) {
        const usersWithAccess = response.data.items.map((user) => ({
          ...user,
          accessLevel: user.roles[0] || "User",
        }));
        setUsers(usersWithAccess);
        setTotalCount(response.data.totalCount);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      messageHelper.showErrorToast(
        "Failed to load team data with error: " + error.message,
        { autoClose: false }
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, pageSize, search, sortColumn, sortDirection]);

  const getAccessIcon = (level) => {
    switch (level.toLowerCase()) {
      case "admin":
        return (
          <Tooltip title="Admin">
            <AdminPanelSettingsOutlinedIcon color="error" />
          </Tooltip>
        );
      case "manager":
        return (
          <Tooltip title="Manager">
            <SecurityOutlinedIcon color="warning" />
          </Tooltip>
        );
      case "user":
      default:
        return (
          <Tooltip title="User">
            <LockOpenOutlinedIcon color="info" />
          </Tooltip>
        );
    }
  };

  const handleEdit = (id) => {
    navigate(`/create-user/${id}`);
  };

  const handleDelete = async (id) => {
    messageHelper.showConfirmationToast(
      "Are you sure you want to make this member inactive?",
      {
        onConfirm: async () => {
          try {
            const response = await Api.delete(ApiEndpoints.USERS + `/${id}`);
            if (response.statusCode === 200) {
              messageHelper.showSuccessToast(
                "Member made inactive successfully."
              );
              fetchUsers();
            } else {
              messageHelper.showErrorToast(
                "Failed to make member inactive: " + response.message,
                { autoClose: false }
              );
            }
          } catch (error) {
            console.error("Error making member inactive:", error);
            messageHelper.showErrorToast(
              "Failed to make member inactive: " + error.message,
              { autoClose: false }
            );
          }
        },
      }
    );
  };

  const columns = [
    { field: "id", headerName: "ID", flex: 0.5, hide: true },
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      sortable: true,
      renderCell: ({ row }) => (
        <Typography fontWeight={500}>{row.name}</Typography>
      ),
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1.5,
      sortable: true,
    },
    {
      field: "departmentName",
      headerName: "Department",
      flex: 1,
      sortable: false,
    },
    {
      field: "companyName",
      headerName: "Company",
      flex: 1,
      sortable: false,
    },
    {
      field: "accessLevel",
      headerName: "Access",
      flex: 1,
      sortable: false,
      renderCell: ({ row }) => (
        <Box display="flex" alignItems="center" gap={1}>
          {getAccessIcon(row.accessLevel)}
          <Typography variant="body2">{row.accessLevel}</Typography>
        </Box>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.8,
      sortable: false,
      filterable: false,
      renderCell: ({ row }) => (
        <Box display="flex" gap={1}>
          <Tooltip title="Edit">
            <IconButton
              color="primary"
              size="small"
              onClick={() => handleEdit(row.id)}
            >
              <EditIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Inactive">
            <IconButton
              color="error"
              size="small"
              onClick={() => handleDelete(row.id)}
            >
              <CancelIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ minHeight: "100vh", background: colors.primary[400], p: 4 }}>
      <Header title="TEAM" subtitle="Managing the Team Members" />

      {/* Search */}

      <Box
        mb={2}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <TextField
          variant="outlined"
          label="Search"
          placeholder="Search by name, email, etc."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: 400 }}
        />

        <Box ml="auto" display="flex" gap={2}>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => navigate("/create-user")}
          >
            Add New Member
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => navigate("/archived-users")}
          >
            Trash Members
          </Button>
        </Box>
      </Box>

      {/* Table */}
      <Paper elevation={4} sx={{ mt: 2, p: 2, borderRadius: 3 }}>
        {loading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="50vh"
          >
            <CircularProgress />
          </Box>
        ) : (
          <DataGrid
            autoHeight
            rows={users}
            columns={columns}
            page={page}
            onPageChange={(newPage) => setPage(newPage)}
            pageSize={pageSize}
            onPageSizeChange={(newSize) => setPageSize(newSize)}
            rowCount={totalCount}
            pagination
            paginationMode="server"
            rowsPerPageOptions={[10, 25, 50]}
            checkboxSelection
            disableSelectionOnClick
            onSortModelChange={(model) => {
              if (model.length > 0) {
                setSortColumn(model[0].field);
                setSortDirection(model[0].sort);
              }
            }}
            getRowId={(row) => row.id}
            sx={{
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "primary.light",
                fontWeight: "bold",
              },
              "& .MuiDataGrid-row:hover": {
                backgroundColor: "action.hover",
              },
              "& .MuiCheckbox-root": {
                color: "primary.main",
              },
            }}
          />
        )}
      </Paper>
      <ToastContainer />
    </Box>
  );
};

export default UserList;
