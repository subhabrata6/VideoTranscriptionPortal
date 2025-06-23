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
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Api from "../../data/Services/Interceptor";
import { ToastContainer } from "react-toastify";
import * as messageHelper from "../../data/Helpers/MessageHelper";
import dayjs from "dayjs";
import { ApiEndpoints } from "../../data/Helpers/ApiEndPoints";

const DeletedCompaniesList = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();

  const [deletedCompanies, setDeletedCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchDeletedCompanies = async () => {
    try {
      const response = await Api.get(ApiEndpoints.COMPANIES + "?archived=true");
      if (response.statusCode === 200) {
        setDeletedCompanies(response.data.items);
      }
    } catch (error) {
      console.error("Error fetching deleted companies:", error);
      messageHelper.showErrorToast("Failed to load deleted companies.");
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = (id) => {
    messageHelper.showConfirmationToast(
      "Are you sure you want to restore this company?",
      {
        onConfirm: async () => {
          //console.log("Confirm clicked!");
          try {
            const response = await Api.post(
              ApiEndpoints.COMPANIES + `/${id}/unarchive`
            );
            if (response.statusCode === 200) {
              messageHelper.showSuccessToast("Company restored successfully.");
              setTimeout(() => {
                fetchDeletedCompanies();
              }, 3000);
            } else {
              messageHelper.showErrorToast("Failed to restore company.");
            }
          } catch (error) {
            console.error("Error restoring company:", error);
            messageHelper.showErrorToast("Restore failed: " + error.message);
          }
        },
      }
    );
  };
  const handleDelete = async (id) => {
    messageHelper.showConfirmationToast(
      "Are you sure you want to permanently delete this company?",
      {
        onConfirm: async () => {
          //console.log("Confirm clicked!");
          try {

            messageHelper.showInfoToast("To be implemented after discussion with the team.");
            // Uncomment the following lines after discussion with the team

            // const response = await Api.delete(ApiEndpoints.COMPANIES + `/${id}`);
            // if (response.statusCode === 200) {
            //   messageHelper.showSuccessToast("Company deleted permanently.");
            //   setTimeout(() => {
            //     fetchDeletedCompanies();
            //   }, 3000);
            // } else {
            //   messageHelper.showErrorToast("Failed to delete Company.");
            // }
          } catch (error) {
            console.error("Error deleting company:", error);
            messageHelper.showErrorToast("Delete failed: " + error.message);
          }
        },
      }
    );
  };

  useEffect(() => {
    fetchDeletedCompanies();
  }, []);

  const filteredData = deletedCompanies.filter((company) =>
    company.name.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      field: "name",
      headerName: "Company Name",
      flex: 1.5,
      renderCell: ({ row }) => (
        <Typography fontWeight={500}>{row.name}</Typography>
      ),
    },
    {
      field: "deletedAt",
      headerName: "Deleted On",
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
        <Box display="flex" gap={1} justifyContent="center">
          <Tooltip title="Restore">
            <IconButton
              color="primary"
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
                handleDelete(row.id);
              }}
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
      <Header
        title="ARCHIVED COMPANIES"
        subtitle="List of Archived Companies"
      />

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
          placeholder="Search by Company Name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: "400px" }}
        />
        <Button
          variant="contained"
          color="secondary"
          onClick={() => navigate("/company-list")}
        >
          Back to Company List
        </Button>
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
            rows={filteredData}
            columns={columns}
            getRowId={(row) => row.id}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            sx={{
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "primary.light",
                fontWeight: "bold",
              },
              "& .MuiDataGrid-row:hover": {
                backgroundColor: "action.hover",
              },
            }}
          />
        )}
      </Paper>
      <ToastContainer />
    </Box>
  );
};

export default DeletedCompaniesList;
