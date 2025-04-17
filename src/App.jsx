import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthContextProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import RoleSelect from './pages/RoleSelect';
import HomePage from './components/HomePage';
import MarketplacePage from './components/MarketplacePage';
import ProfilePage from './components/ProfilePage'; // Updated from UserProfilePage
import SeekerPage from './components/SeekerPage';
import SwipePage from './components/SwipePage';
import MatchesPage from './components/MatchesPage';
import ChatPage from './components/ChatPage';
import Layout from './components/layout';
import './App.css';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './styles/theme'; // Your custom MUI theme

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthContextProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-gray-100">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/role-select" element={<RoleSelect />} />
              <Route
                path="/marketplace"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <MarketplacePage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <ProfilePage /> {/* Updated to ProfilePage */}
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/seeker"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <SeekerPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/swipe"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <SwipePage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/matches"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <MatchesPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/chat/:matchId"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <ChatPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </BrowserRouter>
      </AuthContextProvider>
    </ThemeProvider>
  );
}

export default App;