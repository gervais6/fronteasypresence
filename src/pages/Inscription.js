import React, { useState } from "react"; 
import { useNavigate } from 'react-router-dom'; 
import { TextField, Button, InputAdornment, IconButton } from '@mui/material'; 
import { Person, Email, Phone, Visibility, VisibilityOff, Work, Apartment } from '@mui/icons-material'; 
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const InscrireAdmin = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [number, setNumber] = useState('');          // numéro
    const [position, setPosition] = useState('');      // poste/position
    const [qg, setQG] = useState('');                 // QG
    const [showPassword, setShowPassword] = useState(false); 
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !email || !password || !number || !position || !qg) {
            toast.error("Tous les champs sont requis.", { autoClose: 1000, position: toast.POSITION.BOTTOM_CENTER });
            return;
        }

        try {
            const response = await axios.post(
                'http://localhost:8000/api/auth/register-admin',
                { name, email, password, number, position, qg } // ajout du qg
            );

            toast.success('Admin créé avec succès !', { autoClose: 1000 });
            setName(''); setEmail(''); setPassword(''); setNumber(''); setPosition(''); setQG('');
            navigate('/login');

        } catch (error) {
            const msg = error.response?.data?.message || "Erreur lors de l'inscription.";
            toast.error(msg, { autoClose: 2000 });
        }
    };

    return (
        <div>
            <ToastContainer />
            <section className="gradient-form" style={{ height: '100vh', background: 'linear-gradient(180deg, #4A2C2A, #9A616D)' }}>
                <div className="container h-100">
                    <div className="row d-flex justify-content-center align-items-center h-100">
                        <div className="col-xl-10">
                            <div className="card rounded-3 shadow-lg">
                                <div className="row g-0">
                                    <div className="col-lg-6">
                                        <div className="card-body p-md-5 mx-md-4">
                                            <h4 className="mt-3 mb-4 text-center" style={{ color: "#4A2C2A", whiteSpace: 'nowrap' }}>
                                                Créer un compte Admin
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
                                                                <IconButton onClick={() => setShowPassword(!showPassword)} style={{ padding: 0 }}>
                                                                    {showPassword ? <VisibilityOff style={{ color: 'black' }} /> : <Visibility style={{ color: 'black' }} />}
                                                                </IconButton>
                                                            </InputAdornment>
                                                        ),
                                                    }}
                                                    className="mb-4"
                                                    style={{ borderRadius: '20px' }}
                                                />
                                                <TextField
                                                    fullWidth
                                                    variant="outlined"
                                                    placeholder="Numéro de téléphone"
                                                    value={number}
                                                    onChange={(e) => setNumber(e.target.value)}
                                                    required
                                                    InputProps={{
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <Phone />
                                                            </InputAdornment>
                                                        ),
                                                    }}
                                                    className="mb-4"
                                                    style={{ borderRadius: '20px' }}
                                                />
                                                <TextField
                                                    fullWidth
                                                    variant="outlined"
                                                    placeholder="Position / Poste"
                                                    value={position}
                                                    onChange={(e) => setPosition(e.target.value)}
                                                    required
                                                    InputProps={{
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <Work />
                                                            </InputAdornment>
                                                        ),
                                                    }}
                                                    className="mb-4"
                                                    style={{ borderRadius: '20px' }}
                                                />
                                                <TextField
                                                    fullWidth
                                                    variant="outlined"
                                                    placeholder="QG"
                                                    value={qg}
                                                    onChange={(e) => setQG(e.target.value)}
                                                    required
                                                    InputProps={{
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <Apartment />
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
                                            </form>
                                        </div>
                                    </div>
                                    <div className="col-lg-6 d-none d-lg-flex align-items-center gradient-custom-2">
                                        {/* Image ou décoration */}
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

export default InscrireAdmin;
