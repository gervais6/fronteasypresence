import React, { useState, useContext } from "react";
import {
  Box,
  Stack,
  IconButton,
  Typography,
  TextField,
  Button,
  InputAdornment,
  LinearProgress,
} from "@mui/material";
import {
  Person,
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  Phone,
  Work,
  LocationCity,
  Image,
} from "@mui/icons-material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import CustomizationSidebar from "./CustomizationSidebar";
import { CustomizationContext } from "./CustomizationContext";

const InscrireAdminWithSidebar = () => {
  const navigate = useNavigate();
  const {
    customTitle,
    customLogo,
    logoPosition,
    logoSize,
    titleColor,
    titleFont,
    titleSize,
    formBgColor,
    buttonColor,
    setCustomLogo,
  } = useContext(CustomizationContext);

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    number: "",
    position: "",
    qg: "",
    image: null,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    if (e.target.type === "file") {
      setForm({ ...form, image: e.target.files[0] });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleLogoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setCustomLogo(URL.createObjectURL(e.target.files[0]));
    }
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!form.name) newErrors.name = "Le nom est requis.";
    if (!form.email) newErrors.email = "L'email est requis.";
    if (!form.password) newErrors.password = "Le mot de passe est requis.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!form.number) newErrors.number = "Le numéro de téléphone est requis.";
    if (!form.position) newErrors.position = "Le poste est requis.";
    if (!form.qg) newErrors.qg = "Le QG est requis.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep1()) setStep(2);
  };

  const prevStep = () => setStep(1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;

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

      setForm({
        name: "",
        email: "",
        password: "",
        number: "",
        position: "",
        qg: "",
        image: null,
      });
      navigate("/login");
    } catch (error) {
      const msg = error.response?.data?.message || "Erreur lors de l'inscription.";
      setErrors({ global: msg });
    }
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f5f5f5" }}>
      <CustomizationSidebar handleLogoChange={handleLogoChange} />

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          p: 5,
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: 600,
            bgcolor: formBgColor,
            borderRadius: 3,
            p: 5,
            boxShadow: 4,
          }}
        >
          {/* HEADER */}
          <Box
            display="flex"
            flexDirection={logoPosition === "top" || logoPosition === "bottom" ? "column" : "row"}
            alignItems="center"
            justifyContent="center"
            mb={2}
          >
            {(logoPosition === "left" || logoPosition === "top") && customLogo && (
              <Box
                component="img"
                src={customLogo}
                alt="Logo"
                sx={{
                  width: logoSize,
                  height: logoSize,
                  mr: logoPosition === "left" ? 2 : 0,
                  mb: logoPosition === "top" ? 1 : 0,
                }}
              />
            )}

            <Typography
              variant="h5"
              fontWeight="bold"
              sx={{ color: titleColor, fontFamily: titleFont, fontSize: titleSize }}
            >
              {customTitle}
            </Typography>

            {(logoPosition === "right" || logoPosition === "bottom") && customLogo && (
              <Box
                component="img"
                src={customLogo}
                alt="Logo"
                sx={{
                  width: logoSize,
                  height: logoSize,
                  ml: logoPosition === "right" ? 2 : 0,
                  mt: logoPosition === "bottom" ? 1 : 0,
                }}
              />
            )}
          </Box>

          {/* PROGRESSION */}
          <Box textAlign="center" mb={2}>
            <Typography variant="body2" color="#777" mb={1}>
              Étape {step} sur 2
            </Typography>
            <LinearProgress
              variant="determinate"
              value={step === 1 ? 50 : 100}
              sx={{
                height: 8,
                borderRadius: 5,
                backgroundColor: "#e5e7eb",
                "& .MuiLinearProgress-bar": { backgroundColor: buttonColor },
              }}
            />
          </Box>

          {/* FORMULAIRE */}
          <Stack spacing={2}>
            {errors.global && (
              <Typography color="error" textAlign="center">
                {errors.global}
              </Typography>
            )}

            {step === 1 && (
              <>
                <TextField
                  fullWidth
                  name="name"
                  placeholder="Nom complet"
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
                    sx: { height: 50 },
                  }}
                />
                <TextField
                  fullWidth
                  name="email"
                  placeholder="Adresse e-mail"
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
                    sx: { height: 50 },
                  }}
                />
                <TextField
                  fullWidth
                  name="password"
                  placeholder="Mot de passe"
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
                        <IconButton onClick={() => setShowPassword(!showPassword)} sx={{ p: 0 }}>
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                    sx: { height: 50 },
                  }}
                />
                <Button
                  variant="contained"
                  onClick={nextStep}
                  sx={{
                    borderRadius: 3,
                    bgcolor: buttonColor,
                    color: "#fff",
                    py: 1.5,
                    fontWeight: "bold",
                    fontSize: 16,
                  }}
                >
                  Suivant
                </Button>
              </>
            )}

            {step === 2 && (
              <>
                <TextField
                  fullWidth
                  name="number"
                  placeholder="Numéro de téléphone"
                  value={form.number}
                  onChange={handleChange}
                  error={!!errors.number}
                  helperText={errors.number}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone />
                      </InputAdornment>
                    ),
                    sx: { height: 50 },
                  }}
                />
                <TextField
                  fullWidth
                  name="position"
                  placeholder="Poste"
                  value={form.position}
                  onChange={handleChange}
                  error={!!errors.position}
                  helperText={errors.position}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Work />
                      </InputAdornment>
                    ),
                    sx: { height: 50 },
                  }}
                />
                <TextField
                  fullWidth
                  name="qg"
                  placeholder="QG"
                  value={form.qg}
                  onChange={handleChange}
                  error={!!errors.qg}
                  helperText={errors.qg}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationCity />
                      </InputAdornment>
                    ),
                    sx: { height: 50 },
                  }}
                />

                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    justifyContent: "flex-start",
                    height: 50,
                  }}
                >
                  <Image sx={{ mr: 1, color: buttonColor }} />
                  {form.image ? form.image.name : "Télécharger une image"}
                  <input type="file" hidden name="image" accept="image/*" onChange={handleChange} />
                </Button>

                <Stack direction="row" spacing={2}>
                  <Button
                    variant="outlined"
                    onClick={prevStep}
                    sx={{
                      borderRadius: 3,
                      color: buttonColor,
                      borderColor: buttonColor,
                      flex: 1,
                    }}
                  >
                    Retour
                  </Button>
                  <Button
                    variant="contained"
                    type="submit"
                    sx={{
                      borderRadius: 3,
                      bgcolor: buttonColor,
                      color: "#fff",
                      py: 1.5,
                      fontWeight: "bold",
                      fontSize: 16,
                      flex: 1,
                    }}
                  >
                    S'inscrire
                  </Button>
                </Stack>
              </>
            )}
          </Stack>

          <Typography
            variant="body2"
            align="center"
            mt={3}
            sx={{
              color: "#555",
              "& span": {
                color: buttonColor,
                cursor: "pointer",
                fontWeight: "bold",
              },
            }}
          >
            Vous avez déjà un compte ?{" "}
            <span onClick={() => navigate("/login")}>Connectez-vous ici</span>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default InscrireAdminWithSidebar;
