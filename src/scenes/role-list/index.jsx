import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Tooltip,
  useTheme,
  Button,
  TextField,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import ArchiveIcon from "@mui/icons-material/Archive";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import EnumDisplay from "../../data/Helpers/EnumHelper";
import Header from "../../components/Header";
import Api from "../../data/Services/Interceptor";
import * as messageHelper from "../../data/Helpers/MessageHelper";
import { ToastContainer } from "react-toastify";
import { tokens } from "../../theme";
import { ApiEndpoints } from "../../data/Helpers/ApiEndPoints";

const RoleList = () => {
  const [roles, setRoles] = useState([]);
  const [search, setSearch] = useState("");
  const [sortColumn, setSortColumn] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");
  const [page, setPage] = useState(0); // zero-indexed for MUI
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const GENERIC_ID = "00000000-0000-0000-0000-000000000000";

  // Removed loading state

  const fetchRoles = async () => {
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

      const response = await Api.get(ApiEndpoints.ROLE, { params });

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
        setRoles(enrichedRoles);
        setTotalCount(response.data.totalCount);
      }
    } catch (error) {
      messageHelper.showErrorToast("Error fetching roles: " + error.message);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, [page, pageSize, sortColumn, sortDirection, search]);

  const handleEdit = (id) => {
    navigate(`/create-role/${id}`);
  };

  const handleDelete = async (id) => {
    messageHelper.showConfirmationToast(
      "Are you sure you want to archive this role?",
      {
        onConfirm: async () => {
          try {
            const response = await Api.delete(ApiEndpoints.ROLE + `/${id}`);
            if (response.statusCode === 200) {
              messageHelper.showSuccessToast("Role archived successfully.");
              fetchRoles();
            } else {
              messageHelper.showErrorToast(
                "Failed to archive role: " + response.message
              );
            }
          } catch (error) {
            messageHelper.showErrorToast(
              "Failed to archive role: " + error.message
            );
          }
        },
      }
    );
  };

  const columns = [
    { field: "id", headerName: "ID", flex: 0.5, hide: true, cellClassName: "wrap-cell" },
    {
      field: "displayName",
      headerName: "Role Name",
      flex: 1.2,
      cellClassName: "wrap-cell",
    },
    {
      field: "roleType",
      headerName: "Role Type",
      flex: 1,
      sortable: false,
      renderCell: ({ row }) => (
        <EnumDisplay type="RoleType" value={row.roleType} />
      ),
      cellClassName: "wrap-cell",
    },
    {
      field: "companyName",
      headerName: "Company Name",
      flex: 1.5,
      cellClassName: "wrap-cell",
    },
    {
      field: "createdAt",
      headerName: "Created On",
      flex: 1,
      valueFormatter: (params) => new Date(params.value).toLocaleDateString(),
      cellClassName: "wrap-cell",
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
              color="warning"
              size="small"
              onClick={() => handleEdit(row.id)}
            >
              <EditIcon fontSize="large" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Archive">
            <IconButton
              color="error"
              size="small"
              onClick={() => handleDelete(row.id)}
            >
              <ArchiveIcon fontSize="large" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
      cellClassName: "wrap-cell",
    },
  ];

  return (
    <Box sx={{ minHeight: "100vh", background: colors.primary[400], p: 4 }}>
      <Header title="ROLE LIST" subtitle="List of All Roles" />

      {/* Filters */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        gap={2}
        flexWrap="wrap"
        mb={2}
      >
        <TextField
          variant="outlined"
          size="small"
          label="Search"
          placeholder="Search by Role Name or Company Name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: "400px" }}
        />

        <Box ml="auto" display="flex" gap={2}>
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
            onClick={fetchRoles}
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
            onClick={() => navigate("/create-role")}
          >
            Add New Role
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => navigate("/archived-roles")}
          >
            Archived Roles
          </Button>
        </Box>
      </Box>

      {/* Data Table */}
      <Paper elevation={4} sx={{ mt: 2, p: 2, borderRadius: 3 }}>
        <DataGrid
          autoHeight
          rows={roles}
          columns={columns}
          pageSize={pageSize}
          rowsPerPageOptions={[10, 25, 50]}
          rowCount={totalCount}
          pagination
          paginationMode="server"
          sortingMode="server"
          onSortModelChange={(sortModel) => {
            if (sortModel.length > 0) {
              setSortColumn(sortModel[0].field);
              setSortDirection(sortModel[0].sort || "desc");
            } else {
              setSortColumn("createdAt");
              setSortDirection("desc");
            }
          }}
          onPageChange={(newPage) => setPage(newPage)}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setPage(0); // Reset to first page
          }}
          getRowId={(row) => row.id}
          sx={{
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: theme.palette.mode === "dark"
                  ? colors.primary[600]
                  : colors.primary[900],
              fontWeight: "bold",
              fontSize: "1.2rem",
            },
            "& .MuiDataGrid-row": {
              fontSize: "1.15rem",
              minHeight: "56px",
              maxHeight: "56px",
            },
            "& .MuiDataGrid-cell": {
              fontSize: "1.15rem",
              py: 2,
            },
            "& .MuiDataGrid-row:hover": {
              backgroundColor: "action.hover",
            },
            "& .MuiCheckbox-root": {
              color: "primary.main",
            },
          }}
        />
      </Paper>
      <ToastContainer />
    </Box>
  );
};

export default RoleList;
