import React, { useEffect, useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { TextField, Button, InputAdornment, IconButton } from '@mui/material';
import { Email } from '@mui/icons-material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!email || !password) {
            toast.error("Tous les champs sont requis.", { autoClose: 1000 });
            return;
        }

        try {
            const response = await axios.post('http://localhost:8000/api/auth/login', {
                email,
                password
            });

            // Stockage correct dans localStorage
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('userRole', response.data.role); // important pour Dashboard
            localStorage.setItem('userId', response.data.userId);
            localStorage.setItem('memberId', response.data.userId); // nécessaire pour scan

            // Redirection selon rôle
            if (response.data.role === 'admin') {
                navigate('/dashboard'); // Dashboard admin
            } else {
                navigate('/scan-entreprise'); // Page employé
            }

        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Erreur lors de la connexion.';
            toast.error(errorMessage, { autoClose: 2000 });
        }
    };

    useEffect(() => {
        // Empêcher le bouton retour du navigateur
        window.history.pushState(null, '', window.location.href);
        const handlePopState = () => window.history.pushState(null, '', window.location.href);
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
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
                                            <h4 className="mt-3" style={{ color: "#4A2C2A" }}>Connectez-vous</h4>
                                        </div>

                                        <form onSubmit={handleSubmit}>
                                            <TextField
                                                fullWidth
                                                variant="outlined"
                                                placeholder="Adresse e-mail"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start"><Email /></InputAdornment>
                                                    ),
                                                }}
                                                style={{ borderRadius: '20px', marginBottom: 20 }}
                                            />
                                            <TextField
                                                fullWidth
                                                variant="outlined"
                                                placeholder="Mot de passe"
                                                type={showPassword ? 'text' : 'password'}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                                InputProps={{
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            <IconButton onClick={() => setShowPassword(!showPassword)} style={{ padding: 0 }}>
                                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                                            </IconButton>
                                                        </InputAdornment>
                                                    ),
                                                }}
                                                style={{ borderRadius: '20px', marginBottom: 20 }}
                                            />

                                            <div className="text-center pt-1 mb-5 pb-1">
                                                <Button
                                                    variant="contained"
                                                    type="submit"
                                                    style={{ backgroundColor: '#9A616D', color: 'white', padding: '10px', borderRadius: '20px' }}
                                                    fullWidth
                                                >
                                                    Se connecter
                                                </Button>
                                            </div>

                                            <div className="text-center">
                                                <p className="mb-0 me-2 mb-2">Vous n'avez pas de compte ?</p>
                                                <Link to="/inscription" style={{ textDecoration: 'none' }}>
                                                    <Button variant="contained" style={{ backgroundColor: "#9A616D", color: "#fff", borderRadius: '20px' }}>
                                                        Créer un nouveau
                                                    </Button>
                                                </Link>
                                            </div>
                                        </form>
                                        <ToastContainer />
                                    </div>
                                </div>

                                <div className="col-lg-6 d-none d-lg-flex align-items-center gradient-custom-2">
                                    <div className="text-white px-3 py-4 p-md-5 mx-md-4">
                                        {/* Image ou décor */}
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
