import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { TextField, Button, InputAdornment, IconButton, CircularProgress, Box, Typography, Paper } from '@mui/material';
import { Email, Lock, Visibility, VisibilityOff } from '@mui/icons-material';
import axios from 'axios';

import CustomizationSidebar from "./CustomizationSidebar";
import { CustomizationContext } from "./CustomizationContext";

const Login = () => {
  const navigate = useNavigate();
  const { 
    customTitle,
    customLogo,
    setCustomLogo,
    logoPosition,
    logoSize,
    titleColor,
    titleFont,
    titleSize,
    formBgColor,
    buttonColor,
  } = useContext(CustomizationContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({}); // ✅ erreurs locales

  const validateForm = () => {
    const newErrors = {};
    if (!email) newErrors.email = "L'adresse e-mail est requise.";
    if (!password) newErrors.password = "Le mot de passe est requis.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      const response = await axios.post('https://backendeasypresence.onrender.com/api/auth/login', { email, password });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userRole', response.data.role);
      localStorage.setItem('userId', response.data.userId);
      localStorage.setItem('memberId', response.data.userId);

      if (response.data.role === 'admin') navigate('/dashboard');
      else navigate('/scan-entreprise');
    } catch (error) {
      const msg = error.response?.data?.message || "Erreur lors de la connexion.";
      setErrors({ global: msg });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.history.pushState(null, '', window.location.href);
    const handlePopState = () => window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f5f5f5" }}>
      <CustomizationSidebar 
        handleLogoChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            setCustomLogo(URL.createObjectURL(e.target.files[0]));
          }
        }}
      />

      <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', p: 5 }}>
        <Paper
          elevation={8}
          sx={{
            borderRadius: 4,
            padding: 5,
            width: '100%',
            maxWidth: 500,
            textAlign: 'center',
            boxShadow: '0px 6px 20px rgba(0,0,0,0.1)',
            bgcolor: formBgColor,
          }}
        >
          {/* Logo & Titre dynamique */}
          <Box
            display="flex"
            flexDirection={logoPosition === "top" || logoPosition === "bottom" ? "column" : "row"}
            alignItems="center"
            justifyContent="center"
            mb={3}
          >
            {(logoPosition === "top" || logoPosition === "left") && customLogo && (
              <Box
                component="img"
                src={customLogo}
                alt="Logo"
                sx={{
                  width: logoSize,
                  height: logoSize,
                  mb: logoPosition === "top" ? 2 : 0,
                  mr: logoPosition === "left" ? 2 : 0,
                }}
              />
            )}

            <Typography
              variant="h4"
              sx={{
                fontWeight: 'bold',
                color: titleColor,
                fontFamily: titleFont,
                fontSize: titleSize,
              }}
            >
              {customTitle}
            </Typography>

            {(logoPosition === "bottom" || logoPosition === "right") && customLogo && (
              <Box
                component="img"
                src={customLogo}
                alt="Logo"
                sx={{
                  width: logoSize,
                  height: logoSize,
                  mt: logoPosition === "bottom" ? 2 : 0,
                  ml: logoPosition === "right" ? 2 : 0,
                }}
              />
            )}
          </Box>

          {/* Affichage d'une erreur globale */}
          {errors.global && (
            <Typography color="error" sx={{ mb: 2, fontSize: "0.9rem" }}>
              {errors.global}
            </Typography>
          )}

          {/* Formulaire */}
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Adresse e-mail"
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={!!errors.email}
              helperText={errors.email}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3, borderRadius: 3 }}
            />

            <TextField
              fullWidth
              label="Mot de passe"
              variant="outlined"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!errors.password}
              helperText={errors.password}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 4, borderRadius: 3 }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{
                backgroundColor: buttonColor,
                color: 'white',
                borderRadius: 3,
                py: 1.6,
                fontWeight: 600,
                fontSize: '1rem',
                '&:hover': { backgroundColor: buttonColor },
              }}
            >
              {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Se connecter'}
            </Button>
          </form>

          <Typography variant="body2" sx={{ mt: 3 }}>
            Vous n’avez pas de compte ?{' '}
            <Link to="/inscription" style={{ textDecoration: 'none', color: buttonColor, fontWeight: 600 }}>
              Créez-en un
            </Link>
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default Login;
