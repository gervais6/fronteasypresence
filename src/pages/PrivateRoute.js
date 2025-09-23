// PrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
    const isAuthenticated = !!localStorage.getItem('token'); // Vérifiez si le token est présent

    return isAuthenticated ? children : <Navigate to="/login" />; // Redirige vers la page de connexion si non authentifié
};

export default PrivateRoute;