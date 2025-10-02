import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Formulaire from './pages/Formulaire';
import './index.css'; // Importer le fichier CSS global
import Inscrire from './pages/Inscription';
import QrEntreprise from './pages/Qrentreprise';
import ScanEntreprise from "./pages/ScanEntreprise";

import PrivateRoute from './pages/PrivateRoute'; // Importer le composant de route privée

function App() {
  return (
    <div>  
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

          <Route path="/" element={<Login />} /> {/* Redirigez vers la page de connexion par défaut */}
        </Routes>
      </div>
    </Router>
    </div> );
}

export default App;
