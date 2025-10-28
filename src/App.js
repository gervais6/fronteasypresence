import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Formulaire from './pages/Formulaire';
import Inscrire from './pages/Inscription';
import QrEntreprise from './pages/Qrentreprise';
import ScanEntreprise from "./pages/ScanEntreprise";
import PrivateRoute from './pages/PrivateRoute';
import './index.css'; // Importer le fichier CSS global

// Import du contexte de personnalisation
import { CustomizationProvider } from './pages/CustomizationContext'; // ✅ Correct

function App() {
  return (
    <CustomizationProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route 
              path="/dashboard" 
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } 
            />
            <Route path="/formulaire" element={<Formulaire />} />
            <Route path="/inscription" element={<Inscrire />} />
            <Route path="/qrentreprise" element={<QrEntreprise />} />
            <Route path="/scan-entreprise" element={<ScanEntreprise />} />
            <Route path="/" element={<Login />} /> {/* Redirige par défaut vers Login */}
          </Routes>
        </div>
      </Router>
    </CustomizationProvider>
  );
}

export default App;
