import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext'; // Changed from default to named import

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useContext(AuthContext);

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;