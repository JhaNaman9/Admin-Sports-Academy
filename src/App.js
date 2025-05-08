import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import theme from './theme';
import './App.css';
import { authService } from './services/api';

// Layouts
import MainLayout from './layouts/MainLayout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Subscriptions from './pages/Subscriptions';
import Tournaments from './pages/Tournaments';
import Coaches from './pages/Coaches';
import Announcements from './pages/Announcements';
import Settings from './pages/Settings';
import DietPlans from './pages/DietPlans';
import DietPlanCreate from './pages/DietPlanCreate';
import DietPlanEdit from './pages/DietPlanEdit';
import Activities from './pages/Activities';
import Notifications from './pages/Notifications';
import SportCategories from './pages/SportCategories';

// Create a context for auth state
export const AuthContext = React.createContext({
  isAuthenticated: false,
  setIsAuthenticated: () => {},
  user: null,
  setUser: () => {},
});

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Check auth state on app load
  useEffect(() => {
    checkAuthState();
    
    // Set up interval to check auth state regularly but less frequently (once per minute instead of every 5 seconds)
    const interval = setInterval(checkAuthState, 60000);
    
    // Listen for storage events (in case of login/logout in another tab)
    window.addEventListener('storage', handleStorageChange);
    
    // Clean up
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  const checkAuthState = () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    try {
      // Only consider authenticated if token exists and user is admin
      if (token && userStr) {
        const userData = JSON.parse(userStr);
        if (userData && userData.role === 'admin') {
          setUser(userData);
          setIsAuthenticated(true);
          setIsLoading(false);
          return;
        }
      }
      
      // If we get here, not properly authenticated
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error parsing user data:', error);
      setUser(null);
      setIsAuthenticated(false);
    }
    
    setIsLoading(false);
  };
  
  const handleStorageChange = (e) => {
    if (e.key === 'token' || e.key === 'user' || e.key === 'refreshToken') {
      checkAuthState();
    }
  };

  // Protected route component
  const ProtectedRoute = ({ children }) => {
    if (isLoading) {
      return <div>Loading...</div>;
    }
    
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }

    return children;
  };

  if (isLoading) {
    return <div>Loading application...</div>;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
      <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, user, setUser }}>
        <Router>
          <div className="app-container">
            <Routes>
              <Route path="/login" element={
                isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
              } />
              
              <Route path="/" element={<Navigate replace to="/dashboard" />} />
              
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <MainLayout>
                    <Dashboard />
                  </MainLayout>
                </ProtectedRoute>
              } />
              
                <Route path="/students" element={
                <ProtectedRoute>
                  <MainLayout>
                      <Students />
                  </MainLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/subscriptions" element={
                <ProtectedRoute>
                  <MainLayout>
                    <Subscriptions />
                  </MainLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/tournaments" element={
                <ProtectedRoute>
                  <MainLayout>
                    <Tournaments />
                  </MainLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/coaches" element={
                <ProtectedRoute>
                  <MainLayout>
                    <Coaches />
                  </MainLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/announcements" element={
                <ProtectedRoute>
                  <MainLayout>
                    <Announcements />
                  </MainLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/settings" element={
                <ProtectedRoute>
                  <MainLayout>
                    <Settings />
                  </MainLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/diet-plans" element={
                <ProtectedRoute>
                  <MainLayout>
                    <DietPlans />
                  </MainLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/diet-plans/new" element={
                <ProtectedRoute>
                  <MainLayout>
                    <DietPlanCreate />
                  </MainLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/diet-plans/edit/:id" element={
                <ProtectedRoute>
                  <MainLayout>
                    <DietPlanEdit />
                  </MainLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/activities" element={
                <ProtectedRoute>
                  <MainLayout>
                    <Activities />
                  </MainLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/notifications" element={
                <ProtectedRoute>
                  <MainLayout>
                    <Notifications />
                  </MainLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/sport-categories" element={
                <ProtectedRoute>
                  <MainLayout>
                    <SportCategories />
                  </MainLayout>
                </ProtectedRoute>
              } />
              
              <Route path="*" element={<Navigate replace to="/login" />} />
            </Routes>
          </div>
        </Router>
      </AuthContext.Provider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
