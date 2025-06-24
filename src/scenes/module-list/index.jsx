import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  IconButton,
  TextField,
  Typography,
  Paper,
  Tooltip,
  useTheme,
} from "@mui/material";
import { Delete, Edit, Refresh } from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";
import { ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import RefreshIcon from '@mui/icons-material/Refresh';
import GlobalLoader from "../global/Loader";
import Api from "../../data/Services/Interceptor";
import * as messageHelper from "../../data/Helpers/MessageHelper";
import { ApiEndpoints } from "../../data/Helpers/ApiEndPoints";
import { tokens } from "../../theme";

const ModuleList = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();

  const [modules, setModules] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [sortColumn, setSortColumn] = useState("createdOn");
  const [sortDirection, setSortDirection] = useState("desc");
  const [loading, setLoading] = useState(true);

  // Debounced Search
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (search.length === 0 || search.length >= 3) {
        setDebouncedSearch(search);
      }
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [search]);

  const fetchModules = async () => {
    setLoading(true);
    try {
      const params = {
        PageNumber: page + 1,
        PageSize: pageSize,
        SortBy: sortColumn,
        SortOrder: sortDirection.toUpperCase(),
        Search: debouncedSearch,
      };
      const response = await Api.get(ApiEndpoints.MODULES, { params });
      if (response.statusCode === 200) {
        setModules(response.data.items);
        setTotalCount(response.data.totalCount);
      }
    } catch (error) {
      messageHelper.showErrorToast("Failed to fetch modules: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModules();
  }, [page, pageSize, sortColumn, sortDirection, debouncedSearch]);

  const handleEdit = (module) => {
    navigate(`/edit-module/${module.id}`);
  };

  const handleDelete = async (id) => {
    messageHelper.showConfirmationToast(
      "Are you sure you want to delete this module?",
      {
        onConfirm: async () => {
          try {
            const response = await Api.delete(`${ApiEndpoints.MODULES}/${id}`);
            if (response.statusCode === 200) {
              messageHelper.showSuccessToast("Module deleted successfully.");
              fetchModules();
            } else {
              messageHelper.showErrorToast("Failed to delete module.");
            }
          } catch (err) {
            messageHelper.showErrorToast("Delete failed: " + err.message);
          }
        },
      }
    );
  };

  const columns = [
    { field: "id", headerName: "ID", flex: 0.5, hide: true },
    {
      field: "name",
      headerName: "Module Name",
      flex: 1,
      renderCell: ({ row }) => (
        <Typography fontWeight={500}>{row.name}</Typography>
      ),
    },
    {
      field: "createdOn",
      headerName: "Created On",
      flex: 1,
      valueFormatter: (params) => new Date(params.value).toLocaleDateString(),
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.8,
      sortable: false,
      renderCell: ({ row }) => (
        <Box display="flex" gap={1}>
          <Tooltip title="Edit">
            <IconButton color="primary" onClick={() => handleEdit(row)}>
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton color="error" onClick={() => handleDelete(row.id)}>
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ minHeight: "100vh", background: colors.primary[400], p: 4 }}>
      <Header title="MODULE LIST" subtitle="List of All Modules" />

      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        gap={2}
        flexWrap="wrap"
        mb={2}
      >
        <TextField
          label="Search"
          placeholder="Search by Module Name"
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
            onClick={fetchModules}
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
            onClick={() => navigate("/create-module")}
          >
            Add Module
          </Button>
        </Box>
      </Box>

      <Paper elevation={4} sx={{ mt: 2, p: 2, borderRadius: 3 }}>
        {loading ? (
          <GlobalLoader />
        ) : (
          <DataGrid
            autoHeight
            rows={modules}
            columns={columns}
            getRowId={(row) => row.id}
            page={page}
            onPageChange={(newPage) => setPage(newPage)}
            pageSize={pageSize}
            onPageSizeChange={(newSize) => setPageSize(newSize)}
            rowCount={totalCount}
            paginationMode="server"
            sortingMode="server"
            onSortModelChange={(model) => {
              if (model.length > 0) {
                setSortColumn(model[0].field);
                setSortDirection(model[0].sort || "desc");
              }
            }}
            rowsPerPageOptions={[10, 25, 50]}
            checkboxSelection
            disableSelectionOnClick
          />
        )}
      </Paper>

      <ToastContainer />
    </Box>
  );
};

export default ModuleList;
