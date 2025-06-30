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
import { Edit, Delete, Refresh } from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";
import { ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import GlobalLoader from "../global/Loader";
import Api from "../../data/Services/Interceptor";
import * as messageHelper from "../../data/Helpers/MessageHelper";
import { ApiEndpoints } from "../../data/Helpers/ApiEndPoints";
import { tokens } from "../../theme";

const ActionList = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();

  const [actions, setActions] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [sortColumn, setSortColumn] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");
  const [loading, setLoading] = useState(true);

  // Debounce search input
  useEffect(() => {
    const debounce = setTimeout(() => {
      if (search.length === 0 || search.length >= 3) {
        setDebouncedSearch(search);
      }
    }, 500);
    return () => clearTimeout(debounce);
  }, [search]);

  const fetchActions = async () => {
    setLoading(true);
    try {
      const params = {
        PageNumber: page + 1,
        PageSize: pageSize,
        SortBy: sortColumn,
        SortOrder: sortDirection.toUpperCase(),
        Search: debouncedSearch,
      };

      const response = await Api.get(ApiEndpoints.ACTIONS, { params });

      if (response.statusCode === 200) {
        setActions(response.data.items);
        setTotalCount(response.data.totalCount);
      } else {
        messageHelper.showErrorToast("Failed to load actions.");
      }
    } catch (err) {
      messageHelper.showErrorToast("Error fetching actions: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActions();
  }, [page, pageSize, sortColumn, sortDirection, debouncedSearch]);

  const handleEdit = (row) => {
    navigate(`/create-action/${row.id}`);
  };

  const handleDelete = (id) => {
    messageHelper.showConfirmationToast(
      "Are you sure you want to delete this action?",
      {
        onConfirm: async () => {
          try {
            const response = await Api.delete(`${ApiEndpoints.ACTION}/${id}`);
            if (response.statusCode === 200) {
              messageHelper.showSuccessToast("Action deleted successfully.");
              fetchActions();
            } else {
              messageHelper.showErrorToast("Delete failed.");
            }
          } catch (err) {
            messageHelper.showErrorToast("Error deleting: " + err.message);
          }
        },
      }
    );
  };

  const columns = [
    { field: "id", headerName: "ID", flex: 0.5, hide: true },
    {
      field: "actionName",
      headerName: "Action Name",
      flex: 1,
      renderCell: ({ row }) => (
        <Typography fontSize="large" sx={{ wordBreak: "break-word" }}>
          {row.actionName}
        </Typography>
      ),
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
      renderCell: ({ row }) => (
        <Box display="flex" gap={1}>
          <Tooltip title="Edit">
            <IconButton color="warning" onClick={() => handleEdit(row)}>
              <Edit fontSize="large" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton color="error" onClick={() => handleDelete(row.id)}>
              <Delete fontSize="large" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ minHeight: "100vh", background: colors.primary[400], p: 4 }}>
      <Header title="ACTIONS LIST" subtitle="List of All Actions" />

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
          placeholder="Search by Action Name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: "400px" }}
        />

        <Box ml="auto" display="flex" gap={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={fetchActions}
            startIcon={
              <Refresh
                sx={{
                  color: theme.palette.mode === "dark" ? "#FFEB3B" : "#FBC02D",
                }}
                fontSize="large"
              />
            }
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
            onClick={() => navigate("/create-action")}
          >
            Add Action
          </Button>
        </Box>
      </Box>

      <Paper elevation={4} sx={{ mt: 2, p: 2, borderRadius: 3 }}>
        {loading ? (
          <GlobalLoader />
        ) : (
          <DataGrid
            autoHeight
            rows={actions}
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
                fontSize: "1.1rem",
                py: 2,
              },
              "& .MuiDataGrid-row:hover": {
                backgroundColor: "action.hover",
              },
              "& .MuiCheckbox-root": {
                color: "primary.main",
              },
              "& .wrap-cell": {
                whiteSpace: "normal !important",
                wordBreak: "break-word !important",
                lineHeight: "1.4",
                display: "block",
              },
            }}
          />
        )}
      </Paper>

      <ToastContainer />
    </Box>
  );
};

export default ActionList;
