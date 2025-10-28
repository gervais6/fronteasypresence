import React, { useState, useEffect } from "react";
import { TextField, Button, IconButton, InputAdornment, Skeleton } from '@mui/material';
import './Dashboard.css';
import { Link, useNavigate } from 'react-router-dom';
import { FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa";
import SearchIcon from '@mui/icons-material/Search';
import { IoNotificationsOutline } from "react-icons/io5";
import { HiOutlineUserCircle } from "react-icons/hi";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SaveIcon from '@mui/icons-material/Save';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { faUserEdit } from '@fortawesome/free-solid-svg-icons';
const Formulaire = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    const toggleSidebar = () => {
        setSidebarOpen(prevState => !prevState);
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            console.log("Fichier sélectionné :", file.name);
        }
    };

    const handleSidebarToggleClick = () => {
        navigate('/dashboard');
    };

    // Simulate loading data
    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <>
            <header className="navbar navbar-expand-lg navbar-dark" style={{ backgroundColor: "#4A2C2A" }}>
                <div className="container-fluid">
                    <a className="navbar-brand p-3 " href="#">Easy Manager</a>
                    <IconButton className="navbar-toggler" type="button" onClick={handleSidebarToggleClick} aria-label="Toggle sidebar">
                        {isSidebarOpen ? <FaAngleDoubleLeft style={{ color: "white" }} /> : <FaAngleDoubleRight style={{ color: "white" }} />}
                    </IconButton>
                </div>
            </header>

            <div className={`wrapper ${isSidebarOpen ? 'sidebar-open' : ''}`}>
                <main style={{ marginLeft: '0', transition: 'margin-left 0.3s ease', backgroundColor: "#eee", minHeight: "91vh" }}>
                    <div className='main'>
                        <div className="container py-5">
                            <h2 className="mb-4 text-start no-wrap" style={{ color: "#4A2C2A" }}>
                                {loading ? (
                                    // Render skeleton for the title while loading
                                    <Skeleton variant="text" width="40%" height={40} />
                                ) : (
                                    <>
                                        <FontAwesomeIcon icon={faUserEdit} style={{ marginRight: '10px' }} />
                                      Modifier les informations 
                                    </>
                                )}
                            </h2>

                            {loading ? (
                                // Render skeletons while loading
                                <div>
                                    <Skeleton variant="text" width="60%" height={40} style={{ marginBottom: '20px' }} />
                                    <Skeleton variant="rectangular" height={200} style={{ marginBottom: '20px' }} />
                                    <Skeleton variant="text" width="80%" height={40} style={{ marginBottom: '20px' }} />
                                    <Skeleton variant="text" width="80%" height={40} style={{ marginBottom: '20px' }} />
                                </div>
                            ) : (
                                // Render the form when not loading
                                <form>
                                    <div className="row mb-4 mt-5">
                                        <div className="col-md-6">
                                            <h4 className="text-start" style={{ fontSize: "20px" }}>Informations professionnelles</h4>
                                            <div className="mb-3">
                                                <TextField label="Nom complet" variant="outlined" fullWidth />
                                            </div>
                                            <div className="mb-3">
                                                <TextField label="Adresse e-mail" variant="outlined" fullWidth />
                                            </div>
                                            <div className="mb-3">
                                                <TextField label="Numéro de téléphone" variant="outlined" fullWidth />
                                            </div>

                                            <div className="mb-3">
                                                <TextField label="Eglise (QG)" variant="outlined" fullWidth />
                                            </div>

                                            <div className="mb-3">
                                                <TextField label="Statut" variant="outlined" fullWidth />
                                            </div>

                                        </div>


                                    </div>

                                    <hr />



                                    <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            style={{ backgroundColor: "#4A2C2A", color: "white", borderRadius: "5px", display: 'flex', alignItems: 'center' }}
                                        >
                                            <SaveIcon style={{ marginRight: '8px' }} />
                                            Sauvegarder
                                        </Button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                    
                </main>
            </div>
        </>
    );
}

export default Formulaire;
