import React, { useState } from "react"; 
import { Link, useNavigate } from 'react-router-dom'; 
import { TextField, Button, InputAdornment, IconButton } from '@mui/material'; 
import { Person, Email, Visibility, VisibilityOff } from '@mui/icons-material'; 
import axios from 'axios'; // Importer Axios
import { ToastContainer, toast } from 'react-toastify'; // Importer Toastify
import 'react-toastify/dist/ReactToastify.css'; // Importer le style de Toastify

const Inscrire = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false); 
    const navigate = useNavigate(); // Utiliser useNavigate pour la navigation

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !email || !password) {
            toast.error("Tous les champs sont requis.", {
                autoClose: 2000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: false,
                position: toast.POSITION.BOTTOM_CENTER
            });
            return;
        }

        try {
            const response = await axios.post('https://backendeasypresence.onrender.com/api/auth/register', {
                username: name,
                email,
                password
            });
            console.log(response.data);
            // Afficher un toast de succès
            toast.success('Inscription réussie !', {
                autoClose: 2000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: false,
            });
            // Réinitialiser les champs après l'inscription
            setName('');
            setEmail('');
            setPassword('');
            navigate('/login'); // Redirige vers la page de connexion après l'inscription

        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Erreur lors de l\'inscription.';
            // Afficher un toast d'erreur
            toast.error(errorMessage, {
                autoClose: 2000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: false,
            });
        }
    };

    return ( 
        <div>
            <ToastContainer /> {/* Ajouter le conteneur de toast ici */}
            <section className="gradient-form" style={{ height: '100vh', background: 'linear-gradient(180deg, #4A2C2A, #9A616D)' }}>
                <div className="container h-100">
                    <div className="row d-flex justify-content-center align-items-center h-100">
                        <div className="col-xl-10">
                            <div className="card rounded-3 shadow-lg">
                                <div className="row g-0">
                                    <div className="col-lg-6">
                                        <div className="card-body p-md-5 mx-md-4">
                                            <h4 className="mt-3 mb-4 text-center" style={{ color: "#4A2C2A", whiteSpace: 'nowrap' }}>
                                                Créer un compte 
                                            </h4>

                                            <form onSubmit={handleSubmit}>
                                                <TextField 
                                                    fullWidth
                                                    variant="outlined"
                                                    placeholder="Nom complet"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    required
                                                    InputProps={{
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <Person />
                                                            </InputAdornment>
                                                        ),
                                                    }}
                                                    className="mb-4"
                                                    style={{ borderRadius: '20px' }}
                                                />

                                                <TextField 
                                                    fullWidth
                                                    variant="outlined"
                                                    placeholder="Adresse e-mail"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    required
                                                    InputProps={{
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <Email />
                                                            </InputAdornment>
                                                        ),
                                                    }}
                                                    className="mb-4"
                                                    style={{ borderRadius: '20px' }}
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
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <IconButton 
                                                                    onClick={() => setShowPassword(!showPassword)} 
                                                                    style={{ padding: 0 }} 
                                                                >
                                                                    {showPassword ? <VisibilityOff style={{ color: 'black' }} /> : <Visibility style={{ color: 'black' }} />}
                                                                </IconButton>
                                                            </InputAdornment>
                                                        ),
                                                    }}
                                                    className="mb-4"
                                                    style={{ borderRadius: '20px' }}
                                                />

                                                <div className="text-center pt-1 mb-5 pb-1">
                                                    <Button 
                                                        variant="contained" 
                                                        type="submit" 
                                                        style={{ backgroundColor: '#9A616D', color: 'white', padding: '10px', borderRadius: '20px' }}
                                                        fullWidth
                                                    >
                                                        S'inscrire
                                                    </Button>
                                                </div>

                                                <div className="text-center">
                                                    <p className="mb-0 me-2 mb-2">Vous avez déjà un compte ?</p>
                                                    <Link to="/login" style={{ textDecoration: 'none' }}>
                                                        <Button 
                                                            variant="contained" 
                                                            style={{ 
                                                                backgroundColor: "#9A616D", 
                                                                color: "#fff", 
                                                                borderRadius: '20px' 
                                                            }}
                                                        >
                                                           <span>Connectez-vous</span> 
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </form>
                                        </div>
                                    </div>

                                    <div className="col-lg-6 d-none d-lg-flex align-items-center gradient-custom-2">
                                        {/* Vous pouvez ajouter une image ou un autre contenu ici */}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Inscrire;
