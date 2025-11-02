import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  IconButton,
  Typography,
  TextField,
  Button,
  InputAdornment,
  CircularProgress,
  Paper,
} from "@mui/material";
import { Email, Lock, Visibility, VisibilityOff } from "@mui/icons-material";
import axios from "axios";

import CustomizationSidebar from "./CustomizationSidebar";
import { CustomizationContext } from "./CustomizationContext";

const defaultLogoUrl =
  "https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg";

const Login = () => {
  const navigate = useNavigate();
  const {
    customLogo,
    setCustomLogo,
    logoPosition,
    logoSize,
    formBgColor,
    buttonColor,
    pageBg,
    pageBgImage,
    globalFont,
    boxShadow,
    borderRadiusGlobal,
  } = useContext(CustomizationContext);

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleLogoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setCustomLogo(URL.createObjectURL(e.target.files[0]));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.email) newErrors.email = "L'adresse e-mail est requise.";
    if (!form.password) newErrors.password = "Le mot de passe est requis.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      const response = await axios.post(
        "https://backendeasypresence.onrender.com/api/auth/login",
        form
      );

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("userRole", response.data.role);
      localStorage.setItem("userId", response.data.userId);
      localStorage.setItem("memberId", response.data.userId);

      if (response.data.role === "admin") navigate("/dashboard");
      else navigate("/scan-entreprise");
    } catch (error) {
      const msg =
        error.response?.data?.message || "Erreur lors de la connexion.";
      setErrors({ global: msg });
    } finally {
      setLoading(false);
    }
  };

  // Empêche le retour arrière après login
  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
    const handlePopState = () =>
      window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: pageBg,
        backgroundImage: pageBgImage ? `url(${pageBgImage})` : "none",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        fontFamily: globalFont,
      }}
    >
      <CustomizationSidebar handleLogoChange={handleLogoChange} />

      <Box
        sx={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          p: 5,
        }}
      >
        <Paper
          elevation={boxShadow}
          sx={{
            borderRadius: borderRadiusGlobal,
            padding: 5,
            width: "100%",
            maxWidth: 500,
            textAlign: "center",
            bgcolor: formBgColor,
            boxShadow: `0px ${boxShadow}px ${boxShadow * 2}px rgba(0,0,0,0.2)`,
          }}
        >
          {/* Logo */}
          <Box
            display="flex"
            flexDirection={
              logoPosition === "top" || logoPosition === "bottom"
                ? "column"
                : "row"
            }
            alignItems="center"
            justifyContent="center"
            mb={3}
          >
            <Box
              component="img"
              src={customLogo || defaultLogoUrl}
              alt="Logo"
              sx={{
                width: logoSize,
                height: logoSize,
                mb: logoPosition === "top" ? 2 : 0,
                mr: logoPosition === "left" ? 2 : 0,
                mt: logoPosition === "bottom" ? 2 : 0,
                ml: logoPosition === "right" ? 2 : 0,
              }}
            />
          </Box>

          {/* Erreur globale */}
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
              name="email"
              value={form.email}
              onChange={handleChange}
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
              name="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
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
                color: "white",
                borderRadius: 3,
                py: 1.6,
                fontWeight: 600,
                fontSize: "1rem",
                "&:hover": { backgroundColor: buttonColor },
              }}
            >
              {loading ? (
                <CircularProgress size={24} sx={{ color: "white" }} />
              ) : (
                "Se connecter"
              )}
            </Button>
          </form>

          <Typography variant="body2" sx={{ mt: 3 }}>
            Vous n’avez pas de compte ?{" "}
            <Link
              to="/inscription"
              style={{
                textDecoration: "none",
                color: buttonColor,
                fontWeight: 600,
              }}
            >
              Créez-en un
            </Link>
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default Login;
