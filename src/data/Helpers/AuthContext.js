// src/context/AuthContext.js
import React, { createContext, useEffect, useState } from "react";
import { decodeAndExtract } from "./AuthHelper";

export const AuthContext = createContext(null);

const getStoredAuth = () => {
  try {
    const token = localStorage.getItem("token");
    const refreshToken = localStorage.getItem("refreshToken");
    const expires = localStorage.getItem("expires");

    if (!token) return null;

    const { claims, role } = decodeAndExtract(token);
    return { token, refreshToken, expires, claims, role };
  } catch (error) {
    console.error("Failed to parse stored token:", error);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [auth, setAuthState] = useState({
    token: null,
    refreshToken: null,
    expires: null,
    claims: null,
    role: null,
  });

  // Sets auth state and also persists to localStorage
  const setAuth = (authResponse) => {
    const { token, refreshToken, expires } = authResponse;

    if (token) {
      try {
        const { claims, role } = decodeAndExtract(token);

        // Persist
        localStorage.setItem("token", token);
        localStorage.setItem("refreshToken", refreshToken || "");
        localStorage.setItem("expires", expires || "");

        // Set state
        setAuthState({ token, refreshToken, expires, claims, role });
      } catch (err) {
        console.error("Token decoding failed", err);
        clearAuth();
      }
    }
  };

  const clearAuth = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("expires");
    setAuthState({
      token: null,
      refreshToken: null,
      expires: null,
      claims: null,
      role: null,
    });
  };

  useEffect(() => {
    const stored = getStoredAuth();
    if (stored) {
      setAuthState(stored);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ auth, setAuth, clearAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
