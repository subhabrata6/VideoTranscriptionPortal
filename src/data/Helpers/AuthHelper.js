// src/Helpers/AuthHelper.js
import { jwtDecode } from "jwt-decode";

export const decodeAndExtract = (token) => {
  const decoded = jwtDecode(token);

  const role =
    decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

  return {
    claims: decoded,
    role: role || null,
  };
};
