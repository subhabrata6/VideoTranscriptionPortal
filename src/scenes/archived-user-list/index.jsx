import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Tooltip,
  Button,
  TextField,
} from "@mui/material";
import RestoreIcon from "@mui/icons-material/Restore";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Api from "../../data/Services/Interceptor";
import { ToastContainer } from "react-toastify";
import * as messageHelper from "../../data/Helpers/MessageHelper";
import { ApiEndpoints } from "../../data/Helpers/ApiEndPoints";

const ArchivedUsersList = () => {
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [sortColumn, setSortColumn] = useState("deletedAt");
  const [sortDirection, setSortDirection] = useState("desc");

  const [archivedUsers, setArchivedUsers] = useState([]);
  const [search, setSearch] = useState("");

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = setTimeout(() => {
      if (search.length === 0 || search.length >= 3) {
        setDebouncedSearch(search);
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchArchivedUsers = async () => {
    try {
      const params = {
        PageNumber: page + 1,
        PageSize: pageSize,
        SortBy: sortColumn,
        SortOrder: sortDirection?.toUpperCase() || "DESC",
        Search: debouncedSearch,
      };
      const response = await Api.get(ApiEndpoints.USERS + "?archived=true", {
        params,
      });
      if (response.statusCode === 200) {
        setArchivedUsers(response.data.items);
        setTotalCount(response.data.totalCount);
      }
    } catch (error) {
      console.error("Error fetching archived users:", error);
      messageHelper.showErrorToast("Failed to load archived users.");
    }
  };

  const handleRestore = (id) => {
    messageHelper.showConfirmationToast(
      "Are you sure you want to restore this user?",
      {
        onConfirm: async () => {
          try {
            const response = await Api.post(
              `${ApiEndpoints.USERS}/${id}/unarchive`
            );
            if (response.statusCode === 200) {
              messageHelper.showSuccessToast("User restored successfully.");
              fetchArchivedUsers();
            } else {
              messageHelper.showErrorToast("Failed to restore user.");
            }
          } catch (error) {
            console.error("Error restoring user:", error);
            messageHelper.showErrorToast("Restore failed: " + error.message);
          }
        },
      }
    );
  };

  const handleDelete = async (id) => {
    messageHelper.showConfirmationToast(
      "Are you sure you want to permanently delete this user?",
      {
        onConfirm: async () => {
          messageHelper.showInfoToast(
            "To be implemented after discussion with the team."
          );
        },
      }
    );
  };

  useEffect(() => {
    fetchArchivedUsers();
  }, [page, pageSize, debouncedSearch, sortColumn, sortDirection]);

  const columns = [
    { field: "id", headerName: "ID", flex: 0.5, hide: true },
    {
      field: "fullName",
      headerName: "Full Name",
      flex: 1.5,
      renderCell: ({ row }) => (
        <Typography fontSize={"large"} sx={{ whiteSpace: "pre-line", wordBreak: "break-word" }}>
          {`${row.name}`}
        </Typography>
      ),
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1.5,
      renderCell: ({ row }) => (
        <Typography fontSize={"large"} sx={{ whiteSpace: "pre-line", wordBreak: "break-word" }}>
          {row.email}
        </Typography>
      ),
    },
    {
      field: "companyName",
      headerName: "Company Name",
      flex: 1.5,
      renderCell: ({ row }) => (
        <Typography fontSize={"large"} sx={{ whiteSpace: "pre-line", wordBreak: "break-word" }}>
          {row.companyName}
        </Typography>
      ),
    },
    {
      field: "departmentName",
      headerName: "Department Name",
      flex: 1.5,
      renderCell: ({ row }) => (
        <Typography fontSize={"large"} sx={{ whiteSpace: "pre-line", wordBreak: "break-word" }}>
          {row.departmentName}
        </Typography>
      ),
    },
    {
      field: "deletedAt",
      headerName: "Deleted On",
      flex: 1,
      valueFormatter: (params) =>
        new Date(params.value).toLocaleDateString(),
      renderCell: ({ value }) => (
        <Typography fontSize={"large"} sx={{ whiteSpace: "pre-line", wordBreak: "break-word" }}>
          {new Date(value).toLocaleDateString()}
        </Typography>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.8,
      sortable: false,
      filterable: false,
      renderCell: ({ row }) => (
        <Box display="flex" gap={1} justifyContent="center">
          <Tooltip title="Restore">
            <span>
              <IconButton
                color="info"
                size="large"
                onClick={() => handleRestore(row.id)}
              >
                <RestoreIcon fontSize="large" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Delete Permanently">
            <IconButton
              sx={{ color: "error.main" }}
              size="large"
              onClick={() => handleDelete(row.id)}
            >
              <DeleteIcon fontSize="large" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ minHeight: "100vh", background: colors.primary[400], p: 5 }}>
      <Header title="ARCHIVED USERS" subtitle="List of Archived Users" />

      {/* Search and Actions */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <TextField
          variant="outlined"
          label="Search"
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: "400px" }}
        />
        <Box ml="auto" display="flex" gap={2} alignItems="center">
          <Button
            variant="contained"
            color="primary"
            startIcon={
              <RefreshIcon
                sx={{
                  color: theme.palette.mode === "dark" ? "#FFEB3B" : "#FBC02D",
                }}
                fontSize="large"
              />
            }
            onClick={fetchArchivedUsers}
            sx={{
              textTransform: "none",
              fontWeight: 500,
              backgroundColor:
                theme.palette.mode === "dark"
                  ? colors.primary[600]
                  : colors.primary[500],
              "&:hover": {
                backgroundColor:
                  theme.palette.mode === "dark"
                    ? colors.primary[700]
                    : colors.primary[600],
              },
            }}
          >
            Refresh List
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => navigate("/user-list")}
          >
            Back to User List
          </Button>
        </Box>
      </Box>

      {/* Data Table */}
      <Paper elevation={4} sx={{ mt: 2, p: 2, borderRadius: 3 }}>
        <DataGrid
          autoHeight
          rows={archivedUsers}
          columns={columns}
          getRowId={(row) => row.id}
          page={page}
          onPageChange={(newPage) => setPage(newPage)}
          pageSize={pageSize}
          onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
          rowCount={totalCount}
          pagination
          paginationMode="server"
          sortingMode="server"
          onSortModelChange={(sortModel) => {
            if (sortModel.length > 0) {
              setSortColumn(sortModel[0].field);
              setSortDirection(sortModel[0].sort || "desc");
            } else {
              setSortColumn("deletedAt");
              setSortDirection("desc");
            }
          }}
          checkboxSelection
          disableSelectionOnClick
          rowsPerPageOptions={[10, 25, 50]}
          sx={{
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor:
                theme.palette.mode === "dark"
                  ? colors.primary[600]
                  : colors.primary[900],
              fontWeight: "bold",
              fontSize: "1.2rem",
            },
            "& .MuiDataGrid-cell": {
              fontSize: "1.15rem",
              py: 2,
            },
            "& .MuiDataGrid-row": {
              minHeight: "60px !important",
              maxHeight: "60px !important",
            },
            "& .MuiDataGrid-row:hover": {
              backgroundColor: "action.hover",
            },
            "& .MuiTablePagination-root": {
              fontSize: "1.1rem",
            },
            "& .MuiDataGrid-footerContainer": {
              fontSize: "1.1rem",
            },
          }}
        />
      </Paper>

      <ToastContainer />
    </Box>
  );
};

export default ArchivedUsersList;
