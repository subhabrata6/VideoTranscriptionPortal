import React, { useEffect, useState, useMemo, useCallback } from "react";
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
import { tokens } from "../../theme";
import { DataGrid } from "@mui/x-data-grid";
import Header from "../../components/Header";
import Api from "../../data/Services/Interceptor";
import * as messageHelper from "../../data/Helpers/MessageHelper";
import { ToastContainer } from "react-toastify";
import EditIcon from "@mui/icons-material/Edit";
import ArchiveIcon from "@mui/icons-material/Archive";
import RefreshIcon from '@mui/icons-material/Refresh';
import { useNavigate } from "react-router-dom";
import { ApiEndpoints } from "../../data/Helpers/ApiEndPoints";
import GlobalLoader from "../global/Loader";

const CompanyList = () => {
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [sortColumn, setSortColumn] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      if (search.length === 0 || search.length >= 3) {
        setDebouncedSearch(search);
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [search]);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const params = {
        PageNumber: page + 1,
        PageSize: pageSize,
        SortBy: sortColumn,
        SortOrder: sortDirection?.toUpperCase() || "DESC",
        Search: debouncedSearch,
      };
      const response = await Api.get(ApiEndpoints.COMPANIES, { params });
      if (response.statusCode === 200) {
        setCompanies(response.data.items);
        setTotalCount(response.data.totalCount);
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
      messageHelper.showErrorToast("Failed to load company data: " + error.message, {
        autoClose: false,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [page, pageSize, debouncedSearch, sortColumn, sortDirection]);

  const handleEdit = (id) => {
    navigate(`/create-company/${id}`);
  };

  const handleDelete = async (id) => {
    messageHelper.showConfirmationToast(
      "Are you sure you want to archive this company?",
      {
        onConfirm: async () => {
          try {
            const response = await Api.delete(ApiEndpoints.COMPANIES + `/${id}`);
            if (response.statusCode === 200) {
              messageHelper.showSuccessToast("Company archived successfully.");
              fetchCompanies();
            } else {
              messageHelper.showErrorToast("Failed to archive company: " + response.message, {
                autoClose: false,
              });
            }
          } catch (error) {
            console.error("Error archiving company:", error);
            messageHelper.showErrorToast("Failed to archive company: " + error.message, {
              autoClose: false,
            });
          }
        },
      }
    );
  };

  const columns = [
    { field: "id", headerName: "ID", flex: 0.5, hide: true, cellClassName: "wrap-cell" },
    {
      field: "name",
      headerName: "Company Name",
      flex: 1,
      cellClassName: "wrap-cell",
      renderCell: ({ row }) => (
        <Typography fontSize={"large"} sx={{ whiteSpace: "pre-line", wordBreak: "break-word" }}>
          {row.name}
        </Typography>
      ),
    },
    {
      field: "contactName",
      headerName: "Contact Person",
      flex: 1,
      cellClassName: "wrap-cell",
      renderCell: ({ value }) => (
        <Typography sx={{ whiteSpace: "pre-line", wordBreak: "break-word" }}>
          {value}
        </Typography>
      ),
    },
    {
      field: "contactEmail",
      headerName: "Email",
      flex: 1.5,
      cellClassName: "wrap-cell",
      renderCell: ({ value }) => (
        <Typography sx={{ whiteSpace: "pre-line", wordBreak: "break-word" }}>
          {value}
        </Typography>
      ),
    },
    {
      field: "createdAt",
      headerName: "Created On",
      flex: 1,
      cellClassName: "wrap-cell",
      valueFormatter: (params) =>
        new Date(params.value).toLocaleDateString(),
      renderCell: ({ value }) => (
        <Typography sx={{ whiteSpace: "pre-line", wordBreak: "break-word" }}>
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
      cellClassName: "wrap-cell",
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
    },
  ];

  return (
    <Box sx={{ minHeight: "100vh", background: colors.primary[400], p: 4 }}>
      <Header title="COMPANY LIST" subtitle="List of All Companies" />
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
          label="Search"
          placeholder="Search by Company Name, Contact Name, or Email"
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
                  color:
                    theme.palette.mode === "dark"
                      ? "#FFEB3B"
                      : "#FBC02D",
                }}
                fontSize="large"
              />
            }
            onClick={fetchCompanies}
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
          <Button variant="contained" color="secondary" onClick={() => navigate("/create-company")}>
            Add New Company
          </Button>
          <Button variant="contained" color="secondary" onClick={() => navigate("/archived-companies")}>
            Archived Companies
          </Button>
        </Box>
      </Box>

      <Paper elevation={4} sx={{ mt: 2, p: 2, borderRadius: 3 }}>
        {loading ? (
          <GlobalLoader />
        ) : (
          <DataGrid
            autoHeight
            rows={companies}
            columns={columns}
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
                setSortColumn("createdAt");
                setSortDirection("desc");
              }
            }}
            rowsPerPageOptions={[10, 25, 50]}
            checkboxSelection
            disableSelectionOnClick
            getRowId={(row) => row.id}
            sx={{
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: theme.palette.mode === "dark"
                  ? colors.primary[600]
                  : colors.primary[900],
                fontWeight: "bold",
                fontSize: "1.2rem",
              },
              "& .MuiDataGrid-cell": {
                fontSize: "1.1rem",
                py: 2, // Increase vertical padding
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

export default CompanyList;
