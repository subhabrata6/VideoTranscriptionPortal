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
import { tokens } from "../../theme";
import { DataGrid } from "@mui/x-data-grid";
import Header from "../../components/Header";
import Api from "../../data/Services/Interceptor";
import * as messageHelper from "../../data/Helpers/MessageHelper";
import { ToastContainer } from "react-toastify";
import EditIcon from "@mui/icons-material/Edit";
import ArchiveIcon from "@mui/icons-material/Archive";
import { useNavigate } from "react-router-dom";
import { ApiEndpoints } from "../../data/Helpers/ApiEndPoints";

const CompanyList = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [sortColumn, setSortColumn] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();

  const fetchCompanies = async () => {
    try {
      const params = {
        PageNumber: page + 1, // API is 1-indexed
        PageSize: pageSize,
        SortBy: sortColumn,
        SortOrder: sortDirection?.toUpperCase() || "ASC",
        Search: search,
        additionalProp1: "string",
        additionalProp2: "string",
        additionalProp3: "string",
      };
      const response = await Api.get(ApiEndpoints.COMPANIES, { params });
      if (response.statusCode === 200) {
        setCompanies(response.data.items);
        setTotalCount(response.data.totalCount);
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
      messageHelper.showErrorToast(
        "Failed to load company data: " + error.message,
        {
          autoClose: false,
        }
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [page, pageSize, search, sortColumn, sortDirection]);

  const columns = [
    { field: "id", headerName: "ID", flex: 0.5, hide: true },
    {
      field: "name",
      headerName: "Company Name",
      flex: 1,
      renderCell: ({ row }) => (
        <Typography fontWeight={500}>{row.name}</Typography>
      ),
    },
    {
      field: "contactName",
      headerName: "Contact Person",
      flex: 1,
    },
    {
      field: "contactEmail",
      headerName: "Email",
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

  const handleDelete = async (id) => {
    messageHelper.showConfirmationToast(
      "Are you sure you want to archive this company?",
      {
        onConfirm: async () => {
          console.log("Confirm clicked!"); // <-- Add this line
          try {
            const response = await Api.delete(
              ApiEndpoints.COMPANIES + `/${id}`
            );
            if (response.statusCode === 200) {
              messageHelper.showSuccessToast("Company archived successfully.");
              fetchCompanies();
            } else {
              messageHelper.showErrorToast(
                "Failed to archive company: " + response.message,
                { autoClose: false }
              );
            }
          } catch (error) {
            console.error("Error archiving company:", error);
            messageHelper.showErrorToast(
              "Failed to archive company: " + error.message,
              { autoClose: false }
            );
          }
        },
      }
    );
  };

  const handleEdit = (id) => {
    navigate(`/create-company/${id}`);
  };
  return (
    <Box sx={{ minHeight: "100vh", background: colors.primary[400], p: 4 }}>
      <Header title="COMPANY LIST" subtitle="List of All Companies" />

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
          label="Search"
          placeholder="Search by Company Name, Contact Name, or Email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: "400px" }} // Set your desired width here
        />

        <Box ml="auto" display="flex" gap={2}>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => navigate("/create-company")}
          >
            Add New Company
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => navigate("/archived-companies")}
          >
            Archived Companies
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
                setSortDirection(sortModel[0].sort || "asc");
              } else {
                setSortColumn("name");
                setSortDirection("asc");
              }
            }}
            rowsPerPageOptions={[10, 25, 50]}
            checkboxSelection
            disableSelectionOnClick
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

export default CompanyList;
