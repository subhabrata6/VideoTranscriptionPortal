// src/context/AuthContext.js
import React, {
  createContext,
  useEffect,
  useState,
  useMemo
} from "react";
import { decodeAndExtract } from "../Helpers/AuthHelper";
import Api from "../../data/Services/Interceptor";
import { ApiEndpoints } from "./ApiEndPoints";

export const AuthContext = createContext(null);

const getStoredAuth = () => {
  try {
    const token = localStorage.getItem("token");
    const refreshToken = localStorage.getItem("refreshToken");
    const expires = localStorage.getItem("expires");

    if (!token || !expires) return null;

    const expiryTime = new Date(expires).getTime();
    if (expiryTime <= Date.now()) return null;

    const { claims, role } = decodeAndExtract(token);
    return { token, refreshToken, expires, claims, role };
  } catch (error) {
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

  const [isLoading, setIsLoading] = useState(true);
  const isAuthenticated = useMemo(() => !!auth.token, [auth.token]);

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

  const setAuth = ({ token, refreshToken, expires, rememberMe }) => {
    try {
      const { claims, role } = decodeAndExtract(token);
      localStorage.setItem("token", token);
      localStorage.setItem("refreshToken", refreshToken || "");
      localStorage.setItem("expires", expires || "");

      if (!rememberMe) {
        localStorage.removeItem("rememberCredentials");
      }

      setAuthState({ token, refreshToken, expires, claims, role });
      scheduleAutoLogout(new Date(expires));
    } catch (err) {
      clearAuth();
    }
  };

  // 🔄 Refresh token logic (as raw JSON string)
  const refreshTokenIfNeeded = async () => {
    try {
      if (!auth.refreshToken) throw new Error("No refresh token available");

      const response = await Api.post(
        ApiEndpoints.AUTH + "/refresh-token",
        JSON.stringify(auth.refreshToken), // Send raw string
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.statusCode === 200 && response.data?.token) {
        setAuth({
          token: response.data.token,
          refreshToken: response.data.refreshToken || auth.refreshToken,
          expires: response.data.expires,
          rememberMe: true,
        });
        return true;
      }
    } catch (err) {
      console.error("Token refresh failed", err);
    }
    return false;
  };

  const scheduleAutoLogout = (expiresAt) => {
    const timeout = expiresAt.getTime() - Date.now();
    if (timeout > 0) {
      setTimeout(async () => {
        const refreshed = await refreshTokenIfNeeded();
        if (!refreshed) {
          const remember = localStorage.getItem("rememberCredentials");
          if (remember) {
            const { email, password } = JSON.parse(remember);
            try {
              const response = await Api.post("/Auth/login", { email, password });
              if (response.statusCode === 200 && response.data?.token) {
                setAuth({ ...response.data, rememberMe: true });
                return;
              }
            } catch (err) {
              console.warn("Retry login failed", err);
            }
          }
          clearAuth();
        }
      }, timeout);
    } else {
      clearAuth();
    }
  };

  useEffect(() => {
    const stored = getStoredAuth();
    if (stored) {
      setAuthState(stored);
      scheduleAutoLogout(new Date(stored.expires));
    }
    setIsLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ auth, setAuth, clearAuth, isAuthenticated, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
