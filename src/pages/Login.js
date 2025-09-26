import React, { useEffect, useState } from "react";
import { Link, useNavigate } from 'react-router-dom'; // Importer Link et useNavigate
import { TextField, Button, InputAdornment, IconButton } from '@mui/material'; // Importer les composants MUI
import { Email } from '@mui/icons-material'; // Importer les icônes MUI
import { Visibility, VisibilityOff } from '@mui/icons-material';
import axios from 'axios'; // Importer Axios
import { ToastContainer, toast } from 'react-toastify'; // Importer ToastContainer et toast
import 'react-toastify/dist/ReactToastify.css'; // Importer le CSS de react-toastify
import './login.css'; // Importer le fichier CSS

const Login = () => {
    const [email, setEmail] = useState(''); // État pour l'adresse e-mail
    const [password, setPassword] = useState(''); // État pour le mot de passe
    const [error, setError] = useState(''); // État pour les erreurs
    const [showPassword, setShowPassword] = useState(false); // État pour gérer la visibilité du mot de passe
    const navigate = useNavigate(); // Utilisez useNavigate pour la navigation

    const handleSubmit = async (event) => {
        event.preventDefault();
    
        if (!email || !password) {
            toast.error("Tous les champs sont requis.", {
                autoClose: 1000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: false,
            });
            return;
        }
    
        try {
            const response = await axios.post('https://backendeasypresence.onrender.com/api/auth/login', {
                email,
                password
            });
    
            console.log(response.data);
            localStorage.setItem('token', response.data.token); // Stocker le token
            localStorage.setItem('email', email); // Stocker l'email
            navigate('/dashboard'); // Rediriger vers le tableau de bord après la connexion
        } catch (error) {
            // Gérer les erreurs de connexion
            const errorMessage = error.response?.data?.message || 'Erreur lors de la connexion.';
            toast.error(errorMessage, {
                autoClose: 2000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: false,
            });
        }
    };

    useEffect(() => {
        // Empêche le retour en arrière
        window.history.pushState(null, '', window.location.href);
        const handlePopState = (event) => {
            window.history.pushState(null, '', window.location.href);
        };
        window.addEventListener('popstate', handlePopState);
        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, []);

    return ( 
        
        <section className="gradient-form" style={{ height: '100vh', background: 'linear-gradient(180deg, #4A2C2A, #9A616D)' }}>

            <div className="container h-100">
                <div className="row d-flex justify-content-center align-items-center h-100">
                    <div className="col-xl-10">
                        <div className="card rounded-3 shadow-lg">
                            <div className="row g-0">
                                <div className="col-lg-6">
                                    <div className="card-body p-md-5 mx-md-4">
                                        <div className="text-center mb-4">
                                            <h4 className="mt-3" style={{ color: "#4A2C2A", whiteSpace: 'nowrap' }}>
                                                Connectez-Vous 
                                            </h4>
                                        </div>

                                        <form onSubmit={handleSubmit}>
                                            <div className="form-outline mb-4 mt-5">
                                                <TextField 
                                                    fullWidth
                                                    variant="outlined"
                                                    placeholder="Adresse e-mail"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)} // Met à jour l'état
                                                    required
                                                    InputProps={{
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <Email />
                                                            </InputAdornment>
                                                        ),
                                                    }}
                                                    style={{ borderRadius: '20px' }}
                                                />
                                            </div>

                                            <div className="form-outline mb-4">
                                                <TextField 
                                                    fullWidth
                                                    variant="outlined"
                                                    placeholder="Mot de passe"
                                                    type={showPassword ? 'text' : 'password'} // Toggle password visibility
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)} // Met à jour l'état
                                                    required
                                                    InputProps={{
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <IconButton onClick={() => setShowPassword(!showPassword)} 
                                                                    style={{ padding: 0 }} // No padding for better alignment
                                                                >
                                                                    {showPassword ? <VisibilityOff style={{ color: 'black' }} /> : <Visibility style={{ color: 'black' }} />}
                                                                </IconButton>
                                                            </InputAdornment>
                                                        ),
                                                    }}
                                                    style={{ borderRadius: '20px' }}
                                                />
                                            </div>

                                            <div className="text-center pt-1 mb-5 pb-1">
                                                <Button 
                                                    variant="contained" 
                                                    type="submit" // Changez le type en submit
                                                    style={{ backgroundColor: '#9A616D', color: 'white', marginBottom: 20, padding: '10px', borderRadius: '20px' }}
                                                    fullWidth
                                                >
                                                    Se connecter
                                                </Button>

                                                <Link className="text-muted" to="/dashboard" style={{ textDecoration: "none" }}>Mot de passe oublié ?</Link>
                                            </div>

                                            <div className="text-center">
                                                <p className="mb-0 me-2 mb-2">Vous n'avez pas de compte ?</p>
                                                <Link to="/inscription" style={{ textDecoration: 'none' }}>
                                                    <Button 
                                                        variant="contained" 
                                                        style={{ 
                                                            backgroundColor: "#9A616D", 
                                                            color: "#fff", 
                                                            borderRadius: '20px' 
                                                        }}
                                                    >
                                                        Créer un nouveau
                                                    </Button>
                                                </Link>
                                            </div>
                                        </form>
                                        <ToastContainer /> {/* Ajoutez le conteneur de toast ici */}
                                    </div>
                                </div>

                                {/* Section masquée sur mobile */}
                                <div className="col-lg-6 d-none d-lg-flex align-items-center gradient-custom-2">
                                    <div className="text-white px-3 py-4 p-md-5 mx-md-4">
                                        {/* Vous pouvez ajouter du contenu ici si nécessaire */}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Login;
