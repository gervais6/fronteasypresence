import React, { useState, useContext } from 'react';
import {
  TextField,
  Button,
  Box,
  Typography,
  Avatar,
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert
} from '@mui/material';
import { CustomizationContext } from './CustomizationContext';

// Composant Avatar sécurisé
const SafeAvatar = ({ src, alt, ...props }) => {
  const [imgError, setImgError] = useState(false);
  
  const handleError = () => {
    setImgError(true);
  };

  if (!src || imgError) {
    return (
      <Avatar {...props} sx={{ backgroundColor: '#e0e0e0', ...props.sx }}>
        {alt?.charAt(0)?.toUpperCase() || 'U'}
      </Avatar>
    );
  }

  return (
    <Avatar {...props} src={src} alt={alt} onError={handleError} />
  );
};

const Formulaire = () => {
  const { buttonColor } = useContext(CustomizationContext);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    position: '',
    number: '',
    qg: '',
    presentToday: true,
    image: null
  });

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Récupérer les contacts existants
      const existingContacts = JSON.parse(localStorage.getItem('contacts') || '[]');
      
      const newContact = {
        _id: `user_${Date.now()}`,
        ...formData
      };

      // Ajouter le nouveau contact
      const updatedContacts = [...existingContacts, newContact];
      localStorage.setItem('contacts', JSON.stringify(updatedContacts));
      
      showSnackbar('Contact ajouté avec succès !', 'success');
      
      // Réinitialiser le formulaire
      setFormData({
        name: '',
        email: '',
        position: '',
        number: '',
        qg: '',
        presentToday: true,
        image: null
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout du contact:', error);
      showSnackbar('Erreur lors de l\'ajout du contact', 'error');
    }
  };

  return (
    <Box sx={{ maxWidth: 800, margin: '0 auto', padding: 3 }}>
      <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
        <CardContent sx={{ padding: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ fontWeight: 'bold', mb: 4 }}>
            Ajouter un Contact
          </Typography>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Photo de profil */}
              <Grid item xs={12} sx={{ textAlign: 'center' }}>
                <SafeAvatar
                  src={formData.image}
                  alt={formData.name}
                  sx={{ width: 100, height: 100, margin: '0 auto 20px' }}
                />
              </Grid>

              {/* Nom */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nom complet"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                  variant="outlined"
                />
              </Grid>

              {/* Email */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  variant="outlined"
                />
              </Grid>

              {/* Poste */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Poste"
                  value={formData.position}
                  onChange={(e) => handleInputChange('position', e.target.value)}
                  variant="outlined"
                />
              </Grid>

              {/* Téléphone */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Numéro de téléphone"
                  value={formData.number}
                  onChange={(e) => handleInputChange('number', e.target.value)}
                  variant="outlined"
                />
              </Grid>

              {/* QG */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="QG"
                  value={formData.qg}
                  onChange={(e) => handleInputChange('qg', e.target.value)}
                  variant="outlined"
                />
              </Grid>

              {/* Présent aujourd'hui */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Présent aujourd'hui</InputLabel>
                  <Select
                    value={formData.presentToday}
                    onChange={(e) => handleInputChange('presentToday', e.target.value)}
                    label="Présent aujourd'hui"
                  >
                    <MenuItem value={true}>Oui</MenuItem>
                    <MenuItem value={false}>Non</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Bouton de soumission */}
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  sx={{
                    backgroundColor: buttonColor,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    '&:hover': {
                      backgroundColor: buttonColor
                    }
                  }}
                >
                  Ajouter le Contact
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Formulaire;
