import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  IconButton,
  Tooltip,
  useTheme,
  Button,
  TextField,
  MenuItem,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import ArchiveIcon from "@mui/icons-material/Archive";
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
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortColumn, setSortColumn] = useState("Name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [page, setPage] = useState(0); // zero-indexed for MUI
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const GENERIC_ID = "00000000-0000-0000-0000-000000000000";

  const fetchRoles = async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
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
    { field: "id", headerName: "ID", flex: 0.5, hide: true },
    {
      field: "displayName",
      headerName: "Role Name",
      flex: 1.2,
    },
    {
      field: "roleType",
      headerName: "Role Type",
      flex: 1,
      sortable: false,
      renderCell: ({ row }) => (
        <EnumDisplay type="RoleType" value={row.roleType} />
      ),
    },
    {
      field: "companyName",
      headerName: "Company Name",
      flex: 1.5,
    },
    {
      field: "createdAt",
      headerName: "Created On",
      flex: 1,
      valueFormatter: (params) => new Date(params.value).toLocaleDateString(),
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
          <Tooltip title="Archive">
            <IconButton
              color="error"
              size="small"
              onClick={() => handleDelete(row.id)}
            >
              <ArchiveIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
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
                setSortDirection(sortModel[0].sort || "asc");
              } else {
                setSortColumn("name");
                setSortDirection("asc");
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

export default RoleList;
