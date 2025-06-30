import { useState,useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Topbar from "./scenes/global/Topbar";
import Sidebar from "./scenes/global/Sidebar";
import Dashboard from "./scenes/dashboard";
import UserList from "./scenes/user-list";
import Invoices from "./scenes/invoices";
import Contacts from "./scenes/contacts";
import Bar from "./scenes/bar";
import Line from "./scenes/line";
import Pie from "./scenes/pie";
import FAQ from "./scenes/faq";
import Geography from "./scenes/geography";
import Calendar from "./scenes/calendar/calendar";
import LoginForm from "./scenes/login";
import ForgetPassword from "./scenes/forgot-password";
import ResetPassword from "./scenes/reset-password";
import PrivateRoute from "./data/Services/PrivateRoute";
import CreateCompany from "./scenes/create-company";
import CompanyList from "./scenes/company-list";
import DeletedCompaniesList from "./scenes/archived-company-list";
import RoleList from "./scenes/role-list";
import DeletedRolesList from "./scenes/archived-role-list";
import CreateRole from "./scenes/create-role";
import ModuleList from "./scenes/module-list";
import CreateModule  from "./scenes/create-module";
import Unauthorized from "./data/Helpers/UnauthorizedPage";
import CreateUser from "./scenes/create-user";
import ArchivedUsersList from "./scenes/archived-user-list";
import ActionList from "./scenes/actions-list";
import CreateAction from "./scenes/create-action";
import RolePermissionsManager from "./scenes/permissions-manager";
import AdminDashboard from "./scenes/admin-dashboard";
import { AuthProvider } from "./data/Helpers/AuthContext";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LoaderProvider, useLoader } from "./data/Helpers/LoaderContext";
import { registerLoaderFunctions } from "./data/Helpers/LoaderHelper";
import GlobalLoader from "./scenes/global/Loader";

const LoaderRegistrar = () => {
  const { showLoader, hideLoader } = useLoader();

  useEffect(() => {
    registerLoaderFunctions(showLoader, hideLoader);
  }, [showLoader, hideLoader]);

  return null;
};

function App() {
  const [theme, colorMode] = useMode();
  const [isSidebar, setIsSidebar] = useState(true);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <AuthProvider>
        <ColorModeContext.Provider value={colorMode}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <LoaderProvider>
              <LoaderRegistrar />
              <GlobalLoader />
              <Routes>
                {/* Public Route - Login Page */}
                <Route path="/login" element={<LoginForm />} />
                <Route path="/unauthorized" element={<Unauthorized />} />
                <Route path="/forget-password" element={<ForgetPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                {/* Protected Routes with Sidebar + Topbar */}
                <Route element={<PrivateRoute />}>
                  <Route
                    path="/*"
                    element={
                      <div className="app">
                        <Sidebar isSidebar={isSidebar} />
                        <main className="content">
                          <Topbar setIsSidebar={setIsSidebar} />
                          <Routes>
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/admin-dashboard" element={<AdminDashboard />} />
                            <Route path="/user-list" element={<UserList />} />
                            <Route
                              path="/create-company"
                              element={<CreateCompany />}
                            />
                            <Route
                              path="/create-company/:companyId"
                              element={<CreateCompany />}
                            />
                            <Route
                              path="/company-list"
                              element={<CompanyList />}
                            />
                            <Route
                              path="/archived-companies"
                              element={<DeletedCompaniesList />}
                            />
                            <Route
                              path="/create-role"
                              element={<CreateRole />}
                            />
                            <Route
                              path="/create-role/:roleId"
                              element={<CreateRole />}
                            />
                            <Route path="/role-list" element={<RoleList />} />
                            <Route
                              path="/archived-roles"
                              element={<DeletedRolesList />}
                            />
                            <Route path="/role-permissions"
                              element={<RolePermissionsManager />}
                            />  
                            <Route path="create-module" element={<CreateModule  />} />
                            <Route path="/create-module/:moduleId" element={<CreateModule  />}/>
                            <Route path="/module-list" element={<ModuleList />} />
                            <Route path="/create-action" element={<CreateAction />} />
                            <Route path="/create-action/:actionId" element={<CreateAction />} />
                            <Route path="/action-list" element={<ActionList />} />
                            <Route path="/create-user" element={<CreateUser />}/>
                            <Route path="/create-user/:userId" element={<CreateUser />}/>
                            <Route path="/archived-users" element={<ArchivedUsersList />}/>
                            <Route path="/bar" element={<Bar />} />
                            <Route path="/pie" element={<Pie />} />
                            <Route path="/line" element={<Line />} />
                            <Route path="/faq" element={<FAQ />} />
                            <Route path="/calendar" element={<Calendar />} />
                            <Route path="/geography" element={<Geography />} />
                          </Routes>
                        </main>
                      </div>
                    }
                  />
                </Route>
              </Routes>
            </LoaderProvider>
          </ThemeProvider>
        </ColorModeContext.Provider>
      </AuthProvider>
    </LocalizationProvider>
  );
}

export default App;
