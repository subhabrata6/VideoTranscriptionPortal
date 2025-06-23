// src/components/EnumDisplay.jsx
import React from "react";
import { Typography } from "@mui/material";

export const EnumTypes = {
  RoleType: {
    GENERIC: "Generic Role",
    COMPANY_SPECIFIC: "Company Specific Role",
  },
};

const EnumDisplay = ({ type, value }) => {
  const renderMap = {
    RoleType: {
      GENERIC: "Generic Role",
      COMPANY_SPECIFIC: "Company Specific Role",
    },
  };

  return (
    <Typography>
      {renderMap[type]?.[value] ?? "Unknown"}
    </Typography>
  );
};

export default EnumDisplay;
