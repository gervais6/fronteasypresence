import React, { useState, useContext } from "react";
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
import {
  Person,
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  Delete,
} from "@mui/icons-material";
import axios from "axios";

import CustomizationSidebar from "./CustomizationSidebar";
import { CustomizationContext } from "./CustomizationContext";

const defaultLogoUrl =
  "https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg";

const InscrireAdminWithSidebar = () => {
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
    setPageBgImage,
    globalFont,
    boxShadow,
    borderRadiusGlobal,
  } = useContext(CustomizationContext);

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleRemoveLogo = () => setCustomLogo(null);
  const handleRemoveBackground = () => setPageBgImage(null);

  const validateForm = () => {
    const newErrors = {};
    if (!form.name) newErrors.name = "Le nom est requis.";
    if (!form.email) newErrors.email = "L'email est requis.";
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
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });

      await axios.post(
        "https://backendeasypresence.onrender.com/api/auth/register-admin",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setForm({ name: "", email: "", password: "" });
      navigate("/login");
    } catch (error) {
      const msg = error.response?.data?.message || "Erreur lors de l'inscription.";
      setErrors({ global: msg });
    } finally {
      setLoading(false);
    }
  };

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
        position: "relative",
      }}
    >
      <CustomizationSidebar />

      {/* Bouton pour supprimer le fond */}
      {pageBgImage && (
        <IconButton
          onClick={handleRemoveBackground}
          sx={{
            position: "absolute",
            top: 15,
            right: 15,
            bgcolor: "rgba(0,0,0,0.6)",
            color: "white",
            "&:hover": { bgcolor: "rgba(0,0,0,0.8)" },
          }}
        >
          <Delete />
        </IconButton>
      )}

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
            position: "relative",
          }}
        >
          {/* Logo + bouton suppression */}
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
            position="relative"
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

            {customLogo && (
              <IconButton
                onClick={handleRemoveLogo}
                sx={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  bgcolor: "rgba(0,0,0,0.6)",
                  color: "white",
                  "&:hover": { bgcolor: "rgba(0,0,0,0.8)" },
                  p: 0.5,
                }}
              >
                <Delete fontSize="small" />
              </IconButton>
            )}
          </Box>

          {errors.global && (
            <Typography color="error" sx={{ mb: 2, fontSize: "0.9rem" }}>
              {errors.global}
            </Typography>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Nom complet"
              variant="outlined"
              name="name"
              value={form.name}
              onChange={handleChange}
              error={!!errors.name}
              helperText={errors.name}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3, borderRadius: 3 }}
            />

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
              {loading ? <CircularProgress size={24} sx={{ color: "white" }} /> : "S'inscrire"}
            </Button>
          </form>

          <Typography variant="body2" sx={{ mt: 3 }}>
            Vous avez déjà un compte ?{" "}
            <Link
              to="/login"
              style={{ textDecoration: "none", color: buttonColor, fontWeight: 600 }}
            >
              Connectez-vous ici
            </Link>
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default InscrireAdminWithSidebar;
