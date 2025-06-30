import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
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
import EnumDisplay from "../../data/Helpers/EnumHelper";
import Api from "../../data/Services/Interceptor";
import { ToastContainer } from "react-toastify";
import * as messageHelper from "../../data/Helpers/MessageHelper";
import dayjs from "dayjs";
import { ApiEndpoints } from "../../data/Helpers/ApiEndPoints";

const DeletedRolesList = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();

  const [deletedRoles, setDeletedRoles] = useState([]);
  // Removed: const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortColumn, setSortColumn] = useState("deletedAt");
  const [sortDirection, setSortDirection] = useState("desc");
  const [page, setPage] = useState(0); // zero-indexed for MUI
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const GENERIC_ID = "00000000-0000-0000-0000-000000000000";

  const fetchDeletedRoles = async () => {
    // Removed: setLoading(true);
    try {
      const params = {
        companyId: GENERIC_ID,
        PageNumber: page + 1,
        PageSize: pageSize,
        SortBy: sortColumn,
        SortOrder: sortDirection.toUpperCase(),
        Search: search,
        additionalProp1: "string",
        additionalProp2: "string",
        additionalProp3: "string",
      };

      const response = await Api.get(ApiEndpoints.ROLE + "?archived=true", {
        params,
      });
      if (response.statusCode === 200) {
        const enrichedRoles = response.data.items.map((role) => {
          const isGeneric =
            role.companyId === GENERIC_ID ||
            role.companyName === "Generic Role";

          return {
            ...role,
            roleType: isGeneric ? "GENERIC" : "COMPANY_SPECIFIC",
            companyName: isGeneric ? "" : role.companyName,
          };
        });
        setDeletedRoles(enrichedRoles);
        setTotalCount(response.data.totalCount);
      }
    } catch (error) {
      console.error("Error fetching deleted Roles:", error);
      messageHelper.showErrorToast("Failed to load deleted Roles.");
    }
    // Removed: finally { setLoading(false); }
  };

  const handleRestore = async (id) => {
    messageHelper.showConfirmationToast(
      "Are you sure you want to restore this role?",
      {
        onConfirm: async () => {
          //console.log("Confirm clicked!");
          try {
            const response = await Api.post(
              ApiEndpoints.ROLE + `/${id}/unarchive`
            );
            if (response.statusCode === 200) {
              messageHelper.showSuccessToast("Role restored successfully.");
              setTimeout(() => {
                fetchDeletedRoles();
              }, 3000);
            } else {
              messageHelper.showErrorToast("Failed to restore Role.");
            }
          } catch (error) {
            console.error("Error restoring Role:", error);
            messageHelper.showErrorToast("Restore failed: " + error.message);
          }
        },
      }
    );
  };

  const handleDelete = async (id) => {
    messageHelper.showConfirmationToast(
      "Are you sure you want to permanently delete this role?",
      async () => {
        try {
          const response = await Api.delete(ApiEndpoints.ROLE + `/${id}`);
          if (response.statusCode === 200) {
            messageHelper.showSuccessToast("Role deleted permanently.");
            fetchDeletedRoles();
          } else {
            messageHelper.showErrorToast("Failed to delete role.");
          }
        } catch (error) {
          console.error("Error deleting role:", error);
          messageHelper.showErrorToast("Delete failed: " + error.message);
        }
      }
    );
  };

  useEffect(() => {
    fetchDeletedRoles();
  }, [page, pageSize, sortColumn, sortDirection, search]);


  const columns = [
    { field: "id", headerName: "ID", flex: 0.5, hide: true, 
      cellClassName: "wrap-text", headerClassName: "wrap-text" 
    },
    {
      field: "displayName",
      headerName: "Role Name",
      flex: 1.5,
      renderCell: ({ row }) => (
        <Typography fontWeight={500} sx={{ whiteSpace: "pre-line", wordBreak: "break-word" }}>
          {row.displayName}
        </Typography>
      ),
      cellClassName: "wrap-text", headerClassName: "wrap-text"
    },
    {
      field: "roleType",
      headerName: "Role Type",
      flex: 1,
      sortable: false,
      renderCell: ({ row }) => (
        <Box sx={{ whiteSpace: "pre-line", wordBreak: "break-word" }}>
          <EnumDisplay type="RoleType" value={row.roleType} />
        </Box>
      ),
      cellClassName: "wrap-text", headerClassName: "wrap-text"
    },
    {
      field: "companyName",
      headerName: "Company Name",
      flex: 1.5,
      renderCell: ({ row }) => (
        <Typography fontWeight={500} sx={{ whiteSpace: "pre-line", wordBreak: "break-word" }}>
          {row.companyName}
        </Typography>
      ),
      cellClassName: "wrap-text", headerClassName: "wrap-text"
    },
    {
      field: "deletedAt",
      headerName: "Deleted On",
      flex: 1,
      valueFormatter: (params) => new Date(params.value).toLocaleDateString(),
      cellClassName: "wrap-text", headerClassName: "wrap-text"
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.8,
      sortable: false,
      filterable: false,
      renderCell: ({ row }) => (
        <Box display="flex" gap={1} justifyContent="center" sx={{ whiteSpace: "pre-line", wordBreak: "break-word" }}>
          <Tooltip title="Restore">
            <IconButton
              color="info"
              size="medium"
              onClick={() => handleRestore(row.id)}
            >
              <RestoreIcon fontSize="large" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Permanently">
            <IconButton
              sx={{ color: "error.main" }}
              size="medium"
              onClick={() => {
                //handleDelete(row.id);   -> To be implemented after discussion with the team
              }}
            >
              <DeleteIcon fontSize="large" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
      cellClassName: "wrap-text", headerClassName: "wrap-text"
    },
  ];

  return (
    <Box sx={{ minHeight: "100vh", background: colors.primary[400], p: 4 }}>
      <Header title="Archived Roles" subtitle="List of Archived Roles" />

      {/* Search Bar */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <TextField
          variant="outlined"
          label="Search"
          placeholder="Search by Role Name"
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
            onClick={fetchDeletedRoles}
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
            onClick={() => navigate("/role-list")}
          >
            Back to Role List
          </Button>
        </Box>
      </Box>

      {/* Data Table */}
      <Paper elevation={4} sx={{ mt: 2, p: 2, borderRadius: 3 }}>
        {/* Removed loading spinner and conditional rendering */}
        <DataGrid
          autoHeight
          rows={deletedRoles}
          columns={columns}
          getRowId={(row) => row.id}
          pageSize={pageSize}
          onPageChange={(newPage) => setPage(newPage)}
          onPageSizeChange={(newPageSize) => {
            setPageSize(newPageSize);
            setPage(0); // Reset to first page on page size change
          }}
          paginationMode="server"
          sortingMode="server"
          sortModel={[{ field: sortColumn, sort: sortDirection }]}
          onSortModelChange={(model) => {
            if (model.length > 0) {
              setSortColumn(model[0].field);
              setSortDirection(model[0].sort || "desc");
            } else {
              setSortColumn("deletedAt");
              setSortDirection("desc");
            }
          }}
          checkboxSelection
          disableSelectionOnClick
          rowCount={totalCount}
          pagination
          rowsPerPageOptions={[10, 25, 50]}
          sx={{
            fontSize: "1.15rem",
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: theme.palette.mode === "dark"
                  ? colors.primary[600]
                  : colors.primary[900],
              fontWeight: "bold",
              fontSize: "1.2rem",
            },
            "& .MuiDataGrid-row": {
              fontSize: "1.15rem",
            },
            "& .MuiDataGrid-row:hover": {
              backgroundColor: "action.hover",
            },
          }}
        />
      </Paper>
      <ToastContainer />
    </Box>
  );
};

export default DeletedRolesList;
