import React, { useEffect, useState } from "react";
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
import { useNavigate } from "react-router-dom";
import { DataGrid } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import CancelIcon from "@mui/icons-material/Cancel";
import RefreshIcon from "@mui/icons-material/Refresh";
import Header from "../../components/Header";
import Api from "../../data/Services/Interceptor";
import { ApiEndpoints } from "../../data/Helpers/ApiEndPoints";
import * as messageHelper from "../../data/Helpers/MessageHelper";
import { tokens } from "../../theme";
import { ToastContainer } from "react-toastify";

const DepartmentList = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [sortColumn, setSortColumn] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const params = {
        PageNumber: page + 1,
        PageSize: pageSize,
        SortBy: sortColumn,
        SortOrder: sortDirection.toUpperCase(),
        Search: search,
      };

      const response = await Api.get(ApiEndpoints.DEPARTMENTS, { params });

      if (response.statusCode === 200) {
        setDepartments(response.data.items);
        setTotalCount(response.data.totalCount);
      } else {
        messageHelper.showWarningToast(response.message);
        setDepartments([]);
        setTotalCount(0);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
      messageHelper.showErrorToast("Failed to load departments: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, [page, pageSize, search, sortColumn, sortDirection]);

  const handleEdit = (id) => {
    navigate(`/create-department/${id}`);
  };

  const handleArchive = async (id) => {
    messageHelper.showConfirmationToast(
      "Are you sure you want to archive this department?",
      {
        onConfirm: async () => {
          try {
            const response = await Api.delete(`${ApiEndpoints.DEPARTMENTS}/${id}`);
            if (response.statusCode === 200) {
              messageHelper.showSuccessToast("Department archived successfully.");
              fetchDepartments();
            } else {
              messageHelper.showErrorToast("Archive failed: " + response.message);
            }
          } catch (error) {
            console.error("Error archiving department:", error);
            messageHelper.showErrorToast("Archive failed: " + error.message);
          }
        },
      }
    );
  };

  const columns = [
    {
      field: "name",
      headerName: "Department Name",
      flex: 1.5,
      sortable: true,
      renderCell: ({ row }) => (
        <Typography sx={{ whiteSpace: "normal", wordBreak: "break-word" }}>
          {row.name}
        </Typography>
      ),
    },
    {
      field: "companyName",
      headerName: "Company Name",
      flex: 1.5,
      sortable: false,
      renderCell: ({ row }) => (
        <Typography sx={{ whiteSpace: "normal", wordBreak: "break-word" }}>
          {row.companyName}
        </Typography>
      ),
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
      renderCell: ({ row }) => (
        <Box display="flex" gap={1}>
          <Tooltip title="Edit">
            <IconButton color="warning" onClick={() => handleEdit(row.id)}>
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Archive">
            <IconButton color="error" onClick={() => handleArchive(row.id)}>
              <CancelIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ minHeight: "100vh", background: colors.primary[400], p: 4 }}>
      <Header title="DEPARTMENTS" subtitle="Managing the Departments" />

      <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
        <TextField
          variant="outlined"
          label="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: 400 }}
        />
        <Box ml="auto" display="flex" gap={2}>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={fetchDepartments}
            sx={{ textTransform: "none" }}
          >
            Refresh List
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => navigate("/create-department")}
          >
            Create Department
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => navigate("/archived-departments")}
          >
            Archived Department
          </Button>
        </Box>
      </Box>

      <Paper elevation={4} sx={{ mt: 2, p: 2, borderRadius: 3 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
            <CircularProgress />
          </Box>
        ) : (
          <DataGrid
            autoHeight
            rows={departments}
            columns={columns}
            page={page}
            onPageChange={(newPage) => setPage(newPage)}
            pageSize={pageSize}
            onPageSizeChange={(newSize) => setPageSize(newSize)}
            rowCount={totalCount}
            pagination
            paginationMode="server"
            rowsPerPageOptions={[10, 25, 50]}
            onSortModelChange={(model) => {
              if (model.length > 0) {
                setSortColumn(model[0].field);
                setSortDirection(model[0].sort);
              }
            }}
            getRowId={(row) => row.id}
            sx={{
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor:
                  theme.palette.mode === "dark"
                    ? colors.primary[600]
                    : colors.primary[900],
                fontWeight: "bold",
                fontSize: "1.2rem",
              },
              "& .MuiDataGrid-row": {
                fontSize: "1.1rem",
              },
              "& .MuiDataGrid-cell": {
                fontSize: "1.1rem",
              },
            }}
          />
        )}
      </Paper>
      <ToastContainer />
    </Box>
  );
};

export default DepartmentList;
