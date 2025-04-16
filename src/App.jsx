import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthContextProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import RoleSelect from './pages/RoleSelect';
import HomePage from './components/HomePage';
import MarketplacePage from './components/MarketplacePage';
import UserProfilePage from './components/UserProfilePage';
import SeekerPage from './components/SeekerPage';
import SwipePage from './components/SwipePage';
import MatchesPage from './components/MatchesPage';
import ChatPage from './components/ChatPage';
import Layout from './components/layout';
import './App.css';

function App() {
  return (
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
                    <UserProfilePage />
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
  );
}

export default App;
