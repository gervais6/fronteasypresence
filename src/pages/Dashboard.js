import React, { useState, useEffect, useContext } from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';

import { 
  Checkbox, 
  FormControlLabel, 
  CircularProgress, 
  Badge, 
  Snackbar,
  Alert,
  Menu,
  MenuItem,
  Typography,
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  TablePagination, 
  Tooltip, 
  IconButton, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Stack, 
  TextField, 
  Fab, 
  Box, 
  Popover,
  FormControl, 
  InputLabel,
  Select,
  Collapse,
  Avatar,
  Chip
} from '@mui/material';
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import HistoryIcon from '@mui/icons-material/History';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ChatIcon from '@mui/icons-material/Chat';
import PhoneIcon from '@mui/icons-material/Phone';
import { FaAngleDoubleLeft, FaAngleDoubleRight } from 'react-icons/fa';
import { HiOutlineUserCircle } from 'react-icons/hi';
import { QRCodeSVG } from 'qrcode.react';
import { jsPDF } from 'jspdf';
import { Html5Qrcode } from 'html5-qrcode';

// Import du contexte de personnalisation
import { CustomizationContext } from './CustomizationContext';

// Configuration API
const API_BASE = "https://backendeasypresence.onrender.com/api";
const API_AUTH = `${API_BASE}/auth`;
const API_PRESENCES = `${API_BASE}/presences`;
const API_USERS = `${API_BASE}/auth/users`;
const API_REGISTER = `${API_BASE}/auth/register-user`;
const API_UPDATE_USER = `${API_BASE}/auth/update-user`;

// Configuration des constantes
const CONTRACT_TYPES = [
  { value: 'CDI', label: 'CDI' },
  { value: 'CDD', label: 'CDD' },
  { value: 'Stage', label: 'Stage' },
  { value: 'Alternance', label: 'Alternance' },
  { value: 'Freelance', label: 'Freelance' },
  { value: '', label: 'Non spécifié' }
];

const USER_ROLES = [
  { value: 'admin', label: 'Administrateur' },
  { value: 'employe', label: 'Employé' },
  { value: 'autre', label: 'Autre' }
];

const COMPANY_ID = localStorage.getItem('companyId') || 'company_123';

// Utilitaires améliorés
const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  try {
    return new Date(dateString).toISOString().split('T')[0];
  } catch {
    return '';
  }
};

const formatDateForDisplay = (dateString) => {
  if (!dateString) return '-';
  try {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
};

const formatSalary = (salary) => {
  if (!salary && salary !== 0) return '-';
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(salary);
};

const validateUserForm = (formData, isEdit = false) => {
  const errors = {};

  if (!formData.name?.trim()) errors.name = 'Le nom est requis';
  if (!formData.position?.trim()) errors.position = 'La position est requise';
  if (!formData.number?.trim()) errors.number = 'Le numéro est requis';
  if (!formData.qg?.trim()) errors.qg = 'Le QG est requis';
  
  if (!isEdit) {
    if (!formData.email?.trim()) errors.email = 'L\'email est requis';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email invalide';
    
    if (!formData.password) errors.password = 'Le mot de passe est requis';
    else if (formData.password.length < 6) errors.password = 'Le mot de passe doit faire au moins 6 caractères';
  }

  if (formData.contractStart && formData.contractEnd) {
    const start = new Date(formData.contractStart);
    const end = new Date(formData.contractEnd);
    if (end < start) errors.contractEnd = 'La fin du contrat ne peut pas être avant le début';
  }

  if (formData.salary && formData.salary < 0) errors.salary = 'Le salaire ne peut pas être négatif';

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Fonction utilitaire pour les URLs d'image - CORRIGÉE
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // Si c'est déjà une URL complète ou une URL blob, la retourner telle quelle
  if (imagePath.startsWith('http') || imagePath.startsWith('blob:')) {
    return imagePath;
  }
  
  // Si c'est un chemin relatif, construire l'URL complète
  if (imagePath.startsWith('/uploads/') || imagePath.includes('uploads')) {
    const baseUrl = 'https://backendeasypresence.onrender.com';
    if (imagePath.startsWith('/')) {
      return `${baseUrl}${imagePath}`;
    } else {
      return `${baseUrl}/${imagePath}`;
    }
  }
  
  return imagePath;
};

// Composant Avatar sécurisé avec gestion améliorée des erreurs
const SafeAvatar = ({ src, alt, ...props }) => {
  const [imgError, setImgError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const imageUrl = getImageUrl(src);

  useEffect(() => {
    setImgError(false);
    setRetryCount(0);
  }, [src]);

  const handleError = () => {
    if (retryCount < 2) {
      // Réessayer après un délai
      setTimeout(() => {
        setImgError(false);
        setRetryCount(prev => prev + 1);
      }, 1000 * (retryCount + 1));
    } else {
      setImgError(true);
    }
  };

  if (!imageUrl || imgError) {
    return (
      <Avatar {...props} sx={{ backgroundColor: '#e0e0e0', ...props.sx }}>
        {alt?.charAt(0)?.toUpperCase() || 'U'}
      </Avatar>
    );
  }

  return (
    <Avatar
      {...props}
      src={imageUrl}
      alt={alt}
      onError={handleError}
      key={`${imageUrl}-${retryCount}`} // Force le re-render quand l'URL change
    />
  );
};

// Hook personnalisé pour la gestion des formulaires avec gestion améliorée des URLs
const useUserForm = (initialUser = null) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employe',
    position: '',
    number: '',
    qg: '',
    workLocation: '',
    contractStart: '',
    contractEnd: '',
    salary: '',
    contractType: 'CDI',
    activity: '',
    activityBy: '',
    activityDeadline: '',
    birthday: '',
    mentor: '',
    manager: '',
    nationality: ''
  });

  const [errors, setErrors] = useState({});
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Nettoyer les URLs temporaires
  useEffect(() => {
    return () => {
      // Nettoyage des URLs temporaires quand le composant est démonté
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, []);

  // Initialiser le formulaire avec les données de l'utilisateur
  useEffect(() => {
    if (initialUser) {
      setFormData({
        name: initialUser.name || '',
        email: initialUser.email || '',
        password: '', // Mot de passe vide pour l'édition
        role: initialUser.role || 'employe',
        position: initialUser.position || '',
        number: initialUser.number || '',
        qg: initialUser.qg || '',
        workLocation: initialUser.workLocation || '',
        contractStart: formatDateForInput(initialUser.contractStart),
        contractEnd: formatDateForInput(initialUser.contractEnd),
        salary: initialUser.salary || '',
        contractType: initialUser.contractType || 'CDI',
        activity: initialUser.activity || '',
        activityBy: initialUser.activityBy || '',
        activityDeadline: formatDateForInput(initialUser.activityDeadline),
        birthday: formatDateForInput(initialUser.birthday),
        mentor: initialUser.mentor || '',
        manager: initialUser.manager || '',
        nationality: initialUser.nationality || ''
      });
      // Utiliser l'URL permanente de l'image existante
      setImagePreview(initialUser.image || initialUser.imageUrl || null);
    }
  }, [initialUser]);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Effacer l'erreur du champ lorsqu'il est modifié
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleImageChange = (file) => {
    // Nettoyer l'ancienne URL temporaire
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    
    setImage(file);
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setImagePreview(objectUrl);
    } else {
      setImagePreview(null);
    }
  };

  const validateForm = () => {
    const validation = validateUserForm(formData, !!initialUser);
    setErrors(validation.errors);
    return validation.isValid;
  };

  const resetForm = () => {
    // Nettoyer l'URL temporaire
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'employe',
      position: '',
      number: '',
      qg: '',
      workLocation: '',
      contractStart: '',
      contractEnd: '',
      salary: '',
      contractType: 'CDI',
      activity: '',
      activityBy: '',
      activityDeadline: '',
      birthday: '',
      mentor: '',
      manager: '',
      nationality: ''
    });
    setImage(null);
    setImagePreview(null);
    setErrors({});
  };

  return {
    formData,
    errors,
    image,
    imagePreview,
    handleChange,
    handleImageChange,
    validateForm,
    resetForm,
    setFormData
  };
};

// Intercepteur axios pour ajouter le token automatiquement
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Gestionnaire d'erreurs global amélioré
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || 'Erreur serveur';

    switch (status) {
      case 401:
        handleLogout();
        break;
      case 403:
        break;
      case 404:
        break;
      case 500:
        break;
      default:
        break;
    }

    return Promise.reject(error);
  }
);

// Fonctions utilitaires
const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  localStorage.removeItem('memberId');
  localStorage.removeItem('userRole');
  localStorage.removeItem('email');
  localStorage.removeItem('companyId');
  localStorage.removeItem('contacts');
  localStorage.removeItem('pendingActions');
  window.location.href = '/login';
};

const cleanupTempContainer = (root, container) => {
  try {
    if (root) root.unmount();
    if (container && container.parentNode) container.parentNode.removeChild(container);
  } catch (err) {
    console.warn('Erreur lors du nettoyage du conteneur temporaire:', err);
  }
};

const exportCompanyQrToPng = () => {
  const tempContainer = document.createElement('div');
  document.body.appendChild(tempContainer);

  const root = ReactDOM.createRoot(tempContainer);
  root.render(<QRCodeSVG value={COMPANY_ID} size={100} />);

  setTimeout(() => {
    const svgElement = tempContainer.querySelector('svg');
    if (!svgElement) {
      cleanupTempContainer(root, tempContainer);
      return;
    }

    const svgStr = new XMLSerializer().serializeToString(svgElement);
    const img = new Image();
    img.src = 'data:image/svg+xml;base64,' + window.btoa(svgStr);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      canvas.getContext('2d').drawImage(img, 0, 0);

      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = 'QRCode_Entreprise.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      cleanupTempContainer(root, tempContainer);
    };

    img.onerror = () => {
      cleanupTempContainer(root, tempContainer);
    };
  }, 200);
};

const exportCompanyQrToPdf = () => {
  const tempContainer = document.createElement('div');
  document.body.appendChild(tempContainer);

  const root = ReactDOM.createRoot(tempContainer);
  root.render(<QRCodeSVG value={COMPANY_ID} size={100} />);

  setTimeout(() => {
    const svgElement = tempContainer.querySelector('svg');
    if (!svgElement) {
      cleanupTempContainer(root, tempContainer);
      return;
    }

    const svgStr = new XMLSerializer().serializeToString(svgElement);
    const img = new Image();
    img.src = 'data:image/svg+xml;base64,' + window.btoa(svgStr);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      canvas.getContext('2d').drawImage(img, 0, 0);

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      pdf.setFontSize(18);
      pdf.text("QR Code de l'Entreprise", pageWidth / 2, 20, { align: 'center' });

      const pdfWidth = 100;
      const pdfHeight = (img.height * pdfWidth) / img.width;
      const x = (pageWidth - pdfWidth) / 2;
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', x, 30, pdfWidth, pdfHeight);
      pdf.save('QRCode_Entreprise.pdf');

      cleanupTempContainer(root, tempContainer);
    };

    img.onerror = () => {
      cleanupTempContainer(root, tempContainer);
    };
  }, 200);
};

const exportQrToPdf = (contact) => {
  if (!contact || !contact._id) {
    return;
  }

  const tempContainer = document.createElement('div');
  document.body.appendChild(tempContainer);

  const root = ReactDOM.createRoot(tempContainer);
  root.render(<QRCodeSVG value={contact._id} size={100} />);

  setTimeout(() => {
    const svgElement = tempContainer.querySelector('svg');
    if (!svgElement) {
      cleanupTempContainer(root, tempContainer);
      return;
    }

    const svgStr = new XMLSerializer().serializeToString(svgElement);
    const img = new Image();
    img.src = 'data:image/svg+xml;base64,' + window.btoa(svgStr);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      canvas.getContext('2d').drawImage(img, 0, 0);

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      pdf.setFontSize(18);
      pdf.text(`QR Code de ${contact.name || 'Utilisateur'}`, pageWidth / 2, 20, { align: 'center' });

      const pdfWidth = 100;
      const pdfHeight = (img.height * pdfWidth) / img.width;
      const x = (pageWidth - pdfWidth) / 2;
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', x, 30, pdfWidth, pdfHeight);
      pdf.save(`QRCode_${contact.name || 'Utilisateur'}.pdf`);

      cleanupTempContainer(root, tempContainer);
    };

    img.onerror = () => {
      cleanupTempContainer(root, tempContainer);
    };
  }, 200);
};

// Composant de chargement
const LoadingSpinner = ({ size = 40, color = '#4A2C2A' }) => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 2
    }}
  >
    <CircularProgress size={size} sx={{ color }} />
  </Box>
);

// Modal pour ajouter/modifier un utilisateur
const NewEntryModal = ({ open, onClose, onSave, contact, showSnackbar }) => {
  const {
    formData,
    errors,
    image,
    imagePreview,
    handleChange,
    handleImageChange,
    validateForm,
    resetForm
  } = useUserForm(contact);

  const [loading, setLoading] = useState(false);
  const { buttonColor } = useContext(CustomizationContext);

  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open, resetForm]);

  const handleSave = async () => {
    if (!validateForm()) {
      showSnackbar('Veuillez corriger les erreurs dans le formulaire', 'error');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      showSnackbar('Token manquant, veuillez vous reconnecter !', 'error');
      handleLogout();
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      // Ajouter tous les champs au FormData
      Object.keys(formData).forEach(key => {
        if (formData[key] !== '' && formData[key] !== null && formData[key] !== undefined) {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      // Si pas de nouvelle image mais on a une imagePreview existante (édition)
      if (!image && imagePreview && !imagePreview.startsWith('blob:')) {
        // Conserver l'URL existante de l'image
        formDataToSend.append('existingImage', imagePreview);
      }
      
      if (image) formDataToSend.append('image', image);

      let response;
      if (!contact?._id) {
        response = await axios.post(API_REGISTER, formDataToSend, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        showSnackbar('Utilisateur créé avec succès !', 'success');
      } else {
        response = await axios.put(`${API_UPDATE_USER}/${contact._id}`, formDataToSend, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        showSnackbar('Utilisateur modifié avec succès !', 'success');
      }

      onSave(response.data.user || response.data);
      onClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors?.join(', ') || 
                          'Erreur lors de la sauvegarde';
      showSnackbar(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderField = (field, label, type = 'text', options = null) => (
    <TextField
      label={label}
      value={formData[field]}
      onChange={(e) => handleChange(field, e.target.value)}
      fullWidth
      type={type}
      error={!!errors[field]}
      helperText={errors[field]}
      InputLabelProps={type === 'date' ? { shrink: true } : {}}
      select={!!options}
    >
      {options && options.map(option => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold', fontSize: 20 }}>
        {contact ? 'Modifier utilisateur' : 'Ajouter utilisateur'}
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3} alignItems="stretch">
          {/* Avatar amélioré */}
          <Box sx={{ position: 'relative', width: 120, height: 120, mx: 'auto' }}>
            {imagePreview ? (
              <>
                <SafeAvatar 
                  src={imagePreview} 
                  alt="Aperçu" 
                  sx={{ width: 120, height: 120 }} 
                />
                <IconButton
                  size="small"
                  onClick={() => handleImageChange(null)}
                  sx={{ position: 'absolute', top: -5, right: -5, backgroundColor: 'rgba(255,255,255,0.8)' }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </>
            ) : (
              <IconButton
                component="label"
                sx={{
                  borderRadius: '50%',
                  border: '2px dashed #ccc',
                  width: 120,
                  height: 120,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <PhotoCamera fontSize="large" />
                <input 
                  hidden 
                  accept="image/*" 
                  type="file" 
                  onChange={(e) => handleImageChange(e.target.files[0])} 
                />
              </IconButton>
            )}
          </Box>

          {/* Informations de base */}
          <Typography variant="h6" sx={{ mt: 2, color: '#4A2C2A' }}>
            Informations de base
          </Typography>

          <Stack direction="row" spacing={2}>
            {renderField('name', 'Nom complet *')}
            {renderField('position', 'Position *')}
          </Stack>

          <Stack direction="row" spacing={2}>
            {renderField('number', 'Numéro *')}
            {renderField('qg', 'QG *')}
          </Stack>

          <Stack direction="row" spacing={2}>
            {renderField('email', 'Email *', 'email')}
            {!contact && renderField('password', 'Mot de passe *', 'password')}
          </Stack>

          <Stack direction="row" spacing={2}>
            {renderField('role', 'Rôle', 'select', USER_ROLES)}
            {renderField('nationality', 'Nationalité')}
          </Stack>

          {/* Informations professionnelles */}
          <Typography variant="h6" sx={{ mt: 2, color: '#4A2C2A' }}>
            Informations professionnelles
          </Typography>

          <Stack direction="row" spacing={2}>
            {renderField('workLocation', 'Lieu de travail')}
            {renderField('contractType', 'Type de contrat', 'select', CONTRACT_TYPES)}
          </Stack>

          <Stack direction="row" spacing={2}>
            {renderField('contractStart', 'Début du contrat', 'date')}
            {renderField('contractEnd', 'Fin du contrat', 'date')}
          </Stack>

          <Stack direction="row" spacing={2}>
            {renderField('salary', 'Salaire', 'number')}
            {renderField('manager', 'Manager')}
          </Stack>

          {/* Relations et activités */}
          <Typography variant="h6" sx={{ mt: 2, color: '#4A2C2A' }}>
            Relations et activités
          </Typography>

          <Stack direction="row" spacing={2}>
            {renderField('mentor', 'Mentor')}
            {renderField('activityBy', 'Activité assignée par')}
          </Stack>

          <Stack direction="row" spacing={2}>
            {renderField('activity', 'Activité en cours', 'text')}
            {renderField('activityDeadline', 'Date limite activité', 'date')}
          </Stack>

          <Stack direction="row" spacing={2}>
            {renderField('birthday', 'Anniversaire', 'date')}
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'center', mt: 2 }}>
        <Button 
          onClick={onClose} 
          variant="outlined" 
          sx={{ px: 3, py: 1 }}
          disabled={loading}
        >
          Annuler
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={loading}
          sx={{
            px: 3,
            py: 1,
            backgroundColor: buttonColor,
            '&:hover': { backgroundColor: buttonColor, opacity: 0.9 },
            '&:disabled': { opacity: 0.6 }
          }}
        >
          {loading ? 'Enregistrement...' : 'Enregistrer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Modal pour afficher l'historique amélioré
const HistoryModal = ({ open, onClose, contact }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const { buttonColor } = useContext(CustomizationContext);

  useEffect(() => {
    if (open && contact) {
      fetchHistory();
    }
  }, [open, contact]);

  const fetchHistory = async () => {
    if (!contact?._id) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_PRESENCES}?userId=${contact._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(response.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique:', error);
      setHistory(contact.history || []);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour contacter l'utilisateur
  const handleContact = (type) => {
    if (!contact) return;
    
    if (type === 'call' && contact.number) {
      window.open(`tel:${contact.number}`, '_self');
    } else if (type === 'chat' && contact.number) {
      // Ouvrir WhatsApp avec le numéro
      window.open(`https://wa.me/${contact.number.replace(/\s/g, '')}`, '_blank');
    } else {
      alert(`Fonction ${type} non disponible pour cet utilisateur`);
    }
  };

  if (!contact) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ style: { borderRadius: 15, padding: 20 } }}
    >
      {/* En-tête amélioré avec photo et informations de contact */}
      <Box sx={{ textAlign: 'center', mb: 3, position: 'relative' }}>
        {/* Photo de profil et informations */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
          <SafeAvatar
            src={contact.image || contact.imageUrl}
            alt={contact.name}
            sx={{ 
              width: 80, 
              height: 80, 
              border: `3px solid ${buttonColor}`,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
          />
        </Box>

        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2c2c2c', mb: 1 }}>
          {contact.name}
        </Typography>
        
        <Typography variant="body1" sx={{ color: '#6b7280', mb: 2 }}>
          {contact.position}
        </Typography>

        {/* Boutons de contact */}
        <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 2 }}>
          <Tooltip title={`Appeler ${contact.number || ''}`}>
            <IconButton 
              onClick={() => handleContact('call')}
              sx={{ 
                backgroundColor: '#4CAF50',
                color: 'white',
                '&:hover': { backgroundColor: '#45a049' },
                borderRadius: '50%',
                width: 50,
                height: 50
              }}
            >
              <PhoneIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title={`Envoyer un message à ${contact.name}`}>
            <IconButton 
              onClick={() => handleContact('chat')}
              sx={{ 
                backgroundColor: '#25D366',
                color: 'white',
                '&:hover': { backgroundColor: '#20bd5a' },
                borderRadius: '50%',
                width: 50,
                height: 50
              }}
            >
              <ChatIcon />
            </IconButton>
          </Tooltip>
        </Stack>

        <Chip 
          label="Historique de présence" 
          sx={{ 
            backgroundColor: buttonColor, 
            color: 'white',
            fontWeight: 'bold'
          }} 
        />
      </Box>

      <DialogContent>
        {loading ? (
          <LoadingSpinner />
        ) : history.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <HistoryIcon sx={{ fontSize: 60, color: '#ccc', mb: 2 }} />
            <Typography variant="body1" color="textSecondary">
              Aucun historique de présence pour ce membre.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
            <Stack spacing={1}>
              {history.map((entry, idx) => (
                <Box
                  key={idx}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 16px',
                    borderRadius: 3,
                    backgroundColor: idx % 2 === 0 ? '#f8f9fa' : '#fff',
                    border: '1px solid #e9ecef',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: '#e3f2fd',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: entry.present ? '#4CAF50' : '#f44336'
                      }}
                    />
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {new Date(entry.date).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {entry.present ? (
                      <>
                        <CheckIcon sx={{ color: '#4CAF50', fontSize: 20 }} />
                        <Typography variant="body1" sx={{ color: '#4CAF50', fontWeight: 'bold' }}>
                          Présent à {entry.time || '--:--'}
                        </Typography>
                      </>
                    ) : (
                      <>
                        <CloseIcon sx={{ color: '#f44336', fontSize: 20 }} />
                        <Typography variant="body1" sx={{ color: '#f44336', fontWeight: 'bold' }}>
                          Absent
                        </Typography>
                      </>
                    )}
                  </Box>
                </Box>
              ))}
            </Stack>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'center', mt: 2, pb: 3 }}>
        <Button
          onClick={onClose}
          sx={{
            backgroundColor: buttonColor,
            color: 'white',
            borderRadius: 3,
            px: 4,
            py: 1.2,
            fontWeight: 'bold',
            fontSize: 14,
            '&:hover': { backgroundColor: buttonColor, opacity: 0.9 },
          }}
        >
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Modal pour scanner les QR codes
const QrScannerModal = ({ open, onClose, onScanSuccess, showSnackbar }) => {
  const qrCodeRegionId = "html5qr-code-full-region";
  const html5QrCodeRef = React.useRef(null);
  const isScanningRef = React.useRef(false);

  useEffect(() => {
    if (!open) return;

    const startScanner = async () => {
      const qrElement = document.getElementById(qrCodeRegionId);
      if (!qrElement) return;

      html5QrCodeRef.current = new Html5Qrcode(qrCodeRegionId);

      const scanCallback = (decodedText) => {
        if (!isScanningRef.current) return;
        isScanningRef.current = false;
        onScanSuccess(decodedText);
        html5QrCodeRef.current.stop().catch(() => {});
      };

      const handleError = (err) => {
        console.warn("QR Scan error:", err);
      };

      try {
        isScanningRef.current = true;
        await html5QrCodeRef.current.start(
          { facingMode: { exact: "environment" } },
          { fps: 10, qrbox: 250 },
          scanCallback,
          handleError
        );
      } catch {
        try {
          isScanningRef.current = true;
          await html5QrCodeRef.current.start(
            { facingMode: "user" },
            { fps: 10, qrbox: 250 },
            scanCallback,
            handleError
          );
        } catch {
          showSnackbar("Impossible d'accéder à la caméra.", 'error');
          isScanningRef.current = false;
        }
      }
    };

    const timeout = setTimeout(startScanner, 100);

    return () => {
      clearTimeout(timeout);
      if (html5QrCodeRef.current && isScanningRef.current) {
        html5QrCodeRef.current.stop().catch(() => {});
        isScanningRef.current = false;
      }
    };
  }, [open, onClose, onScanSuccess, showSnackbar]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Scanner QR Code</DialogTitle>
      <DialogContent>
        <div id={qrCodeRegionId} style={{ width: "100%", height: 400 }}></div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fermer</Button>
      </DialogActions>
    </Dialog>
  );
};

// Fonction de recherche améliorée
const searchInContacts = (contacts, searchTerm) => {
  if (!searchTerm.trim()) return contacts;

  const searchLower = searchTerm.toLowerCase().trim();
  
  return contacts.filter(contact => {
    // Recherche dans tous les champs de base
    const basicFields = [
      contact.name,
      contact.position,
      contact.number,
      contact.qg,
      contact.email,
      contact.workLocation,
      contact.contractType,
      contact.activity,
      contact.activityBy,
      contact.mentor,
      contact.manager,
      contact.nationality
    ];

    // Vérification des champs de base
    if (basicFields.some(field => field && field.toString().toLowerCase().includes(searchLower))) {
      return true;
    }

    // Recherche dans les dates formatées
    const dateFields = [
      formatDateForDisplay(contact.contractStart),
      formatDateForDisplay(contact.contractEnd),
      formatDateForDisplay(contact.activityDeadline),
      formatDateForDisplay(contact.birthday)
    ];

    if (dateFields.some(date => date && date.toLowerCase().includes(searchLower))) {
      return true;
    }

    // Recherche dans le salaire formaté
    const salaryFormatted = formatSalary(contact.salary);
    if (salaryFormatted && salaryFormatted.toLowerCase().includes(searchLower)) {
      return true;
    }

    // Recherche dans le statut de présence
    const status = contact.presentToday ? "présent" : "absent";
    if (status.includes(searchLower)) {
      return true;
    }

    return false;
  });
};

// Composant principal Dashboard
const Dashboard = () => {
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
    pageBg,
    pageBgImage,
    globalFont,
    boxShadow,
    borderRadiusGlobal,
  } = useContext(CustomizationContext);

  const [contacts, setContacts] = useState([]);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isNewEntryModalOpen, setNewEntryModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [isHistoryModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedContactHistory, setSelectedContactHistory] = useState(null);
  const [filterQG, setFilterQG] = useState('Tous');
  const [searchTerm, setSearchTerm] = useState('');
  const [isScannerOpen, setScannerOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [adminProfile, setAdminProfile] = useState(null);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [notificationsAnchor, setNotificationsAnchor] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const today = new Date().toISOString().split('T')[0];

  // Fonction pour afficher les snackbars
  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  // Récupérer le profil admin
  useEffect(() => {
    const userEmail = localStorage.getItem('email');
    const userName = localStorage.getItem('userName') || 'Administrateur';
    setAdminProfile({
      name: userName,
      email: userEmail,
      role: 'admin',
      status: 'En ligne'
    });
  }, []);

  // Simuler des notifications
  useEffect(() => {
    const sampleNotifications = [
      {
        id: 1,
        message: "Nouvel utilisateur ajouté: Jean Dupont",
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        read: false
      },
      {
        id: 2,
        message: "Présence marquée pour Marie Curie",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        read: false
      },
      {
        id: 3,
        message: "Rapport de présence généré",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
        read: true
      }
    ];
    setNotifications(sampleNotifications);
  }, []);

  const unreadNotificationsCount = notifications.filter(notification => !notification.read).length;

  const findUserById = (id) => {
    if (!contacts || contacts.length === 0) return null;
    return contacts.find(c => c._id === id) || null;
  };

  // Chargement initial des contacts avec rechargement périodique
  useEffect(() => {
    fetchContactsAndPresences();
    
    // Recharger les données toutes les 5 minutes pour rafraîchir les images
    const interval = setInterval(() => {
      fetchContactsAndPresences();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchContactsAndPresences = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        showSnackbar('Token manquant. Redirection vers la connexion...', 'error');
        handleLogout();
        return;
      }

      const contactsRes = await axios.get(API_USERS, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      let contactsData = contactsRes.data || [];

      // FILTRE : Exclure l'utilisateur admin courant du tableau
      const currentUserEmail = localStorage.getItem('email');
      contactsData = contactsData.filter(user => user.email !== currentUserEmail);

      const today = new Date().toISOString().split('T')[0];
      const presencesRes = await axios.get(`${API_PRESENCES}?date=${today}`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      const presencesData = presencesRes.data || [];

      const merged = contactsData.map(user => {
        const presence = presencesData.find(p => 
          p.userId?._id === user._id || 
          p.userId === user._id ||
          p.user?._id === user._id
        );
        
        // S'assurer que l'URL de l'image est permanente
        const imageUrl = getImageUrl(user.image);
        const permanentImageUrl = imageUrl && imageUrl.startsWith('blob:') 
          ? null // Éviter les URLs blob temporaires
          : imageUrl;
        
        return {
          ...user,
          presentToday: presence ? presence.present : false,
          history: presence ? [{ 
            date: today, 
            present: presence.present, 
            time: presence.time || '--:--' 
          }] : [],
          image: permanentImageUrl,
          imageUrl: permanentImageUrl, // Utiliser la même URL permanente
          workLocation: user.workLocation || '',
          contractStart: user.contractStart || '',
          contractEnd: user.contractEnd || '',
          salary: user.salary || '',
          contractType: user.contractType || '',
          activity: user.activity || '',
          activityBy: user.activityBy || '',
          activityDeadline: user.activityDeadline || '',
          birthday: user.birthday || '',
          mentor: user.mentor || '',
          manager: user.manager || '',
          nationality: user.nationality || ''
        };
      });

      setContacts(merged);
      localStorage.setItem('contacts', JSON.stringify(merged));
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
      const errorMessage = error.response?.data?.message || 'Erreur de connexion au serveur';
      showSnackbar(errorMessage, 'error');
      
      const stored = localStorage.getItem('contacts');
      if (stored) {
        let storedContacts = JSON.parse(stored);
        // Appliquer le même filtre admin sur les données stockées
        const currentUserEmail = localStorage.getItem('email');
        storedContacts = storedContacts.filter(user => user.email !== currentUserEmail);
        setContacts(storedContacts);
        showSnackbar('Données locales chargées (mode hors ligne)', 'info');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNewEntry = async (newEntry) => {
    try {
      await fetchContactsAndPresences();
    } catch (error) {
      console.error('Erreur après sauvegarde:', error);
    }
  };

  const handleDeleteMember = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_USERS}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setContacts(prev => prev.filter(contact => contact._id !== id));
      showSnackbar('Utilisateur supprimé avec succès !', 'success');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      const errorMessage = error.response?.data?.message || 'Erreur lors de la suppression';
      showSnackbar(errorMessage, 'error');
    }
  };

  const handleTogglePresence = async (memberId) => {
    try {
      const token = localStorage.getItem('token');
      const currentTime = new Date().toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });

      const user = findUserById(memberId);
      const isCurrentlyPresent = user?.presentToday;

      const response = await axios.post(API_PRESENCES, {
        userId: memberId,
        date: today,
        present: !isCurrentlyPresent,
        time: currentTime
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setContacts(prev => prev.map(contact => {
        if (contact._id === memberId) {
          const updatedHistory = contact.history || [];
          const todayIndex = updatedHistory.findIndex(h => h.date === today);
          
          if (todayIndex >= 0) {
            updatedHistory[todayIndex] = { 
              date: today, 
              present: !isCurrentlyPresent,
              time: !isCurrentlyPresent ? currentTime : '--:--'
            };
          } else {
            updatedHistory.push({ 
              date: today, 
              present: !isCurrentlyPresent,
              time: !isCurrentlyPresent ? currentTime : '--:--'
            });
          }

          return {
            ...contact,
            presentToday: !isCurrentlyPresent,
            history: updatedHistory
          };
        }
        return contact;
      }));

      showSnackbar(isCurrentlyPresent ? 'Marqué comme absent' : 'Marqué comme présent', 'success');
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
      const errorMessage = error.response?.data?.message || 'Erreur lors du changement de statut';
      showSnackbar(errorMessage, 'error');
    }
  };

  const handleScanSuccess = async (decodedText) => {
    try {
      const token = localStorage.getItem('token');
      const currentTime = new Date().toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });

      const cleanedText = decodedText.trim();
      
      const user = findUserById(cleanedText);
      if (!user) {
        showSnackbar('Utilisateur non trouvé pour ce QR code', 'error');
        return;
      }

      const isCurrentlyPresent = user.presentToday;

      const response = await axios.post(API_PRESENCES, {
        userId: cleanedText,
        date: today,
        present: !isCurrentlyPresent,
        time: currentTime
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setContacts(prev => prev.map(contact => {
        if (contact._id === cleanedText) {
          const updatedHistory = contact.history || [];
          const todayIndex = updatedHistory.findIndex(h => h.date === today);
          
          if (todayIndex >= 0) {
            updatedHistory[todayIndex] = { 
              date: today, 
              present: !isCurrentlyPresent,
              time: !isCurrentlyPresent ? currentTime : '--:--'
            };
          } else {
            updatedHistory.push({ 
              date: today, 
              present: !isCurrentlyPresent,
              time: !isCurrentlyPresent ? currentTime : '--:--'
            });
          }

          return {
            ...contact,
            presentToday: !isCurrentlyPresent,
            history: updatedHistory
          };
        }
        return contact;
      }));

      showSnackbar(`Scan réussi: ${user.name} marqué comme ${!isCurrentlyPresent ? 'présent' : 'absent'}`, 'success');
      setScannerOpen(false);
    } catch (error) {
      console.error('Erreur lors du scan:', error);
      const errorMessage = error.response?.data?.message || 'Erreur lors du traitement du scan';
      showSnackbar(errorMessage, 'error');
    }
  };

  // Colonnes sans le rôle admin
  const [allColumns, setAllColumns] = useState([
    { key: 'imageUrl', label: 'Photo', visible: true },
    { key: 'name', label: 'Nom', visible: true },
    { key: 'position', label: 'Position', visible: true },
    { key: 'number', label: 'Numéro', visible: true },
    { key: 'qg', label: 'QG', visible: false },
    { key: 'email', label: 'Email', visible: false },
    { key: 'workLocation', label: 'Lieu de travail', visible: false },
    { key: 'contractStart', label: 'Début contrat', visible: false },
    { key: 'contractEnd', label: 'Fin contrat', visible: false },
    { key: 'salary', label: 'Salaire', visible: false },
    { key: 'contractType', label: 'Type contrat', visible: false },
    { key: 'activity', label: 'Activité', visible: false },
    { key: 'activityBy', label: 'Activité par', visible: false },
    { key: 'activityDeadline', label: 'Date limite activité', visible: false },
    { key: 'birthday', label: 'Anniversaire', visible: false },
    { key: 'mentor', label: 'Mentor', visible: false },
    { key: 'manager', label: 'Manager', visible: false },
    { key: 'nationality', label: 'Nationalité', visible: false },
    { key: 'qr', label: 'QR', visible: true },
    { key: 'presentToday', label: 'Statut', visible: true },
    { key: 'actions', label: 'Actions', visible: true },
  ]);

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  // Filtrage des données avec recherche améliorée
  const qgList = ["Tous", ...Array.from(new Set(contacts.map((c) => c.qg).filter(Boolean)))];

  let displayContacts = (filterQG === "Tous" ? contacts : contacts.filter((c) => c.qg === filterQG));

  // Appliquer la recherche améliorée
  if (searchTerm.trim()) {
    displayContacts = searchInContacts(displayContacts, searchTerm);
  }

  // Appliquer les filtres actifs
  if (activeFilter && activeFilter !== "Tous") {
    displayContacts = displayContacts.filter((c) => {
      if (activeFilter === "Présents") return c.presentToday === true;
      if (activeFilter === "Absents") return c.presentToday === false;
      if (activeFilter === "QG A") return c.qg === "A";
      if (activeFilter === "QG B") return c.qg === "B";
      return true;
    });
  }

  // Mettre à jour le statut présent/absent pour l'affichage
  displayContacts = displayContacts.map((c) => {
    const todayEntry = c.history?.find((h) => h.date === today);
    return { ...c, presentToday: todayEntry ? todayEntry.present : false };
  });

  return (
    <>
      <div 
        style={{
          fontFamily: globalFont,
          background: pageBg,
          backgroundImage: pageBgImage ? `url(${pageBgImage})` : 'none',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          minHeight: '100vh',
        }}
      >
        {/* Header avec personnalisations */}
        <header
          style={{
            position: "fixed",
            top: 0,
            left: isSidebarOpen ? 220 : 70,
            right: 0,
            zIndex: 100,
            display: "flex",
            flexDirection: "column",
            gap: 10,
            padding: "10px 20px",
            backgroundColor: formBgColor,
            boxShadow: `0px ${boxShadow}px ${boxShadow * 2}px rgba(0,0,0,0.1)`,
            borderBottomLeftRadius: borderRadiusGlobal,
            borderBottomRightRadius: borderRadiusGlobal,
            transition: "left 0.3s ease",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
            {/* Barre de recherche améliorée */}
            <div style={{ display: "flex", alignItems: "center", flex: 1, backgroundColor: "#f5f5f5", borderRadius: borderRadiusGlobal, padding: "4px 10px", margin: '0 20px', minWidth: 0 }}>
              <SearchIcon style={{ color: "#555", marginRight: 6 }} />
              <TextField
                placeholder=""
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                variant="standard"
                InputProps={{ disableUnderline: true }}
                sx={{ flex: 1, minWidth: 0, "& input": { fontSize: 14, color: "#333" } }}
              />
            </div>

            {/* Boutons d'action - AVEC PREVENTION DU COMPORTEMENT PAR DEFAUT */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {/* Bouton de notifications avec Menu déroulant */}
              <Tooltip title="Notifications">
                <IconButton 
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setNotificationsAnchor(event.currentTarget);
                  }}
                  sx={{ 
                    border: `2px solid ${buttonColor}`, 
                    color: buttonColor, 
                    "&:hover": { backgroundColor: `${buttonColor}15` }
                  }}
                >
                  <Badge 
                    badgeContent={unreadNotificationsCount} 
                    color="error"
                    sx={{
                      '& .MuiBadge-badge': {
                        fontSize: '0.7rem',
                        height: '18px',
                        minWidth: '18px',
                      }
                    }}
                  >
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
              </Tooltip>

              {/* Bouton Ajouter - AVEC PREVENTION */}
              <Tooltip title="Ajouter un utilisateur">
                <IconButton
                  onClick={(event) => { 
                    event.preventDefault();
                    event.stopPropagation();
                    setSelectedContact(null); 
                    setNewEntryModalOpen(true); 
                  }}
                  sx={{ 
                    border: `2px solid ${buttonColor}`, 
                    color: buttonColor, 
                    "&:hover": { backgroundColor: `${buttonColor}15` }
                  }}
                >
                  <AddIcon />
                </IconButton>
              </Tooltip>

              {/* Bouton Scanner - AVEC PREVENTION */}
              <Tooltip title="Scanner QR Code">
                <IconButton
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setScannerOpen(true);
                  }}
                  sx={{ 
                    border: `2px solid ${buttonColor}`, 
                    color: buttonColor, 
                    "&:hover": { backgroundColor: `${buttonColor}15` }
                  }}
                >
                  <QrCodeScannerIcon />
                </IconButton>
              </Tooltip>

              {/* Bouton PDF - AVEC PREVENTION */}
              <Tooltip title="Exporter QR Entreprise (PDF)">
                <IconButton 
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    exportCompanyQrToPdf();
                  }}
                  sx={{ 
                    border: `2px solid ${buttonColor}`, 
                    color: buttonColor, 
                    fontSize:12,
                    "&:hover": { backgroundColor: `${buttonColor}15` }
                  }}
                >
                  <PictureAsPdfIcon />
                </IconButton>
              </Tooltip>
            </div>
          </div>

          {/* Filtres rapides - AVEC PREVENTION */}
          <div style={{ display: "flex", gap: 8, marginTop: 5, marginLeft: '20px' }}>
            {["Tous", "Présents", "Absents"].map((filter) => (
              <Chip
                key={filter}
                label={filter}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setActiveFilter(activeFilter === filter ? null : filter);
                }}
                variant={activeFilter === filter ? "filled" : "outlined"}
                sx={{
                  backgroundColor: activeFilter === filter ? buttonColor : "transparent",
                  color: activeFilter === filter ? "#fff" : "#333",
                  borderColor: buttonColor,
                  fontSize: 13,
                  cursor: "pointer",
                  "&:hover": { backgroundColor: activeFilter === filter ? buttonColor : `${buttonColor}33` },
                }}
              />
            ))}
          </div>
        </header>

        {/* Menu déroulant des notifications */}
        <Menu
          anchorEl={notificationsAnchor}
          open={Boolean(notificationsAnchor)}
          onClose={() => setNotificationsAnchor(null)}
          PaperProps={{
            sx: {
              borderRadius: borderRadiusGlobal,
              minWidth: 320,
              maxWidth: 400,
              maxHeight: 400,
              overflow: 'auto',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            }
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: buttonColor }}>
              Notifications
              {unreadNotificationsCount > 0 && (
                <Chip 
                  label={unreadNotificationsCount} 
                  size="small" 
                  color="error"
                  sx={{ ml: 1, fontSize: '0.7rem', height: 20 }}
                />
              )}
            </Typography>
          </Box>

          {notifications.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <NotificationsIcon sx={{ fontSize: 40, color: '#ccc', mb: 1 }} />
              <Typography variant="body2" color="textSecondary">
                Aucune notification
              </Typography>
            </Box>
          ) : (
            <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
              {notifications.map((notification, index) => (
                <MenuItem 
                  key={notification.id}
                  sx={{ 
                    borderBottom: index < notifications.length - 1 ? '1px solid #f0f0f0' : 'none',
                    py: 1.5,
                    backgroundColor: notification.read ? 'transparent' : '#f8f9fa',
                    '&:hover': {
                      backgroundColor: notification.read ? '#f5f5f5' : '#e3f2fd',
                    }
                  }}
                  onClick={() => {
                    // Marquer comme lu
                    const updatedNotifications = notifications.map(n => 
                      n.id === notification.id ? { ...n, read: true } : n
                    );
                    setNotifications(updatedNotifications);
                  }}
                >
                  <Box sx={{ width: '100%' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: notification.read ? 'normal' : 'bold',
                          flex: 1
                        }}
                      >
                        {notification.message}
                      </Typography>
                      {!notification.read && (
                        <Box sx={{ width: 8, height: 8, backgroundColor: buttonColor, borderRadius: '50%', ml: 1 }} />
                      )}
                    </Box>
                    <Typography variant="caption" color="textSecondary">
                      {new Date(notification.timestamp).toLocaleString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Box>
          )}

          {notifications.length > 0 && (
            <Box sx={{ p: 1, borderTop: '1px solid #e0e0e0' }}>
              <Button
                fullWidth
                size="small"
                onClick={() => {
                  // Marquer toutes les notifications comme lues
                  const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
                  setNotifications(updatedNotifications);
                  setNotificationsAnchor(null);
                  showSnackbar('Toutes les notifications ont été marquées comme lues', 'info');
                }}
                sx={{
                  color: buttonColor,
                  fontSize: '0.8rem',
                  '&:hover': {
                    backgroundColor: `${buttonColor}15`
                  }
                }}
              >
                Tout marquer comme lu
              </Button>
            </Box>
          )}
        </Menu>

        {/* Sidebar avec profil admin */}
        <aside
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            height: '100vh',
            width: isSidebarOpen ? 220 : 60,
            transition: 'width 0.3s ease-in-out',
            background: buttonColor,
            display: 'flex',
            flexDirection: 'column',
            overflowX: 'hidden',
            overflowY: 'auto',
            paddingTop: 10,
            boxShadow: `2px 0 ${boxShadow}px rgba(0,0,0,0.1)`,
          }}
        >
          {/* Logo - AVEC PREVENTION */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, marginBottom: 20 }}>
            {customLogo && (
              <img
                src={customLogo}
                alt="Logo"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setSidebarOpen(!isSidebarOpen);
                }}
                style={{ 
                  width: isSidebarOpen ? 50 : 40, 
                  height: isSidebarOpen ? 50 : 40, 
                  objectFit: 'contain', 
                  borderRadius: '50%', 
                  cursor: 'pointer',
                  border: '2px solid white'
                }}
              />
            )}
          </div>

          {/* Liste des QG - AVEC PREVENTION */}
          <ul style={{ listStyle: 'none', padding: 0, marginTop: 10, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
            {qgList.map((qg) => {
              const count = qg === "Tous" ? contacts.length : contacts.filter((c) => String(c.qg).trim() === String(qg).trim()).length;
              return (
                <li key={qg} style={{ marginBottom: 8 }}>
                  <Button
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      setFilterQG(qg);
                    }}
                    variant={filterQG === qg ? 'contained' : 'text'}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      width: '100%',
                      justifyContent: isSidebarOpen ? 'flex-start' : 'center',
                      padding: '10px 14px',
                      color: 'white',
                      backgroundColor: filterQG === qg ? `${buttonColor}dd` : 'transparent',
                      textTransform: 'none',
                      borderRadius: borderRadiusGlobal,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      boxShadow: filterQG === qg ? `0 4px ${boxShadow}px rgba(0,0,0,0.15)` : 'none',
                      transition: 'all 0.3s',
                      fontWeight: 500,
                    }}
                  >
                    <HiOutlineUserCircle style={{ marginRight: isSidebarOpen ? 10 : 0, fontSize: 20, color: 'white' }} />
                    {isSidebarOpen && (
                      <span style={{ display: 'flex', justifyContent: 'space-between', flex: 1 }}>
                        {qg}
                        <span style={{ backgroundColor: 'white', color: buttonColor, borderRadius: '50%', padding: '2px 7px', fontSize: 12, fontWeight: 'bold', minWidth: 24, textAlign: 'center' }}>
                          {count}
                        </span>
                      </span>
                    )}
                  </Button>
                </li>
              );
            })}

            {/* Profil Admin avec Déconnexion */}
            <li style={{ marginTop: 'auto', padding: '8px', marginBottom: 0 }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: isSidebarOpen ? 'row' : 'column',
                  alignItems: 'center',
                  gap: isSidebarOpen ? 2 : 0,
                  p: isSidebarOpen ? 2 : 1,
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    borderRadius: borderRadiusGlobal,
                  },
                  transition: 'all 0.3s ease',
                }}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  if (isSidebarOpen) {
                    setIsLogoutDialogOpen(true);
                  }
                }}
              >
                {/* Avatar Admin */}
                <Box sx={{ position: 'relative' }}>
                  <SafeAvatar
                    src={adminProfile?.image}
                    alt={adminProfile?.name}
                    sx={{
                      width: isSidebarOpen ? 50 : 40,
                      height: isSidebarOpen ? 50 : 40,
                      backgroundColor: 'rgba(255,255,255,0.2)'
                    }}
                  />
                  {/* Indicateur de statut en ligne */}
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 2,
                      right: 2,
                      width: 12,
                      height: 12,
                      backgroundColor: '#4CAF50',
                      border: '2px solid white',
                      borderRadius: '50%'
                    }}
                  />
                </Box>

                {isSidebarOpen && (
                  <Box sx={{ textAlign: 'left', flex: 1, minWidth: 0 }}>
                    <Typography 
                      variant="subtitle2" 
                      sx={{ 
                        color: 'white', 
                        fontWeight: 'bold',
                        fontSize: '0.9rem',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {adminProfile?.name}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: 'rgba(255,255,255,0.8)',
                        fontSize: '0.7rem',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: 'block'
                      }}
                    >
                      {adminProfile?.email}
                    </Typography>
                    <Chip
                      label="En ligne"
                      size="small"
                      sx={{
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        fontSize: '0.6rem',
                        height: 16,
                        mt: 0.5
                      }}
                    />
                  </Box>
                )}
              </Box>
            </li>
          </ul>
        </aside>

        {/* Dialog de confirmation de déconnexion - AVEC PERSONNALISATION */}
        <Dialog
          open={isLogoutDialogOpen}
          onClose={() => setIsLogoutDialogOpen(false)}
          PaperProps={{
            sx: {
              borderRadius: borderRadiusGlobal,
              padding: 2,
              backgroundColor: formBgColor,
            }
          }}
        >
          <DialogTitle sx={{ 
            textAlign: 'center', 
            fontWeight: 'bold',
            color: titleColor,
            fontFamily: titleFont,
            fontSize: titleSize
          }}>
            Confirmation de déconnexion
          </DialogTitle>
          <DialogContent>
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <ExitToAppIcon sx={{ 
                fontSize: 60, 
                color: buttonColor, 
                mb: 2 
              }} />
              <Typography variant="body1" sx={{ mb: 2, color: titleColor }}>
                Êtes-vous sûr de vouloir vous déconnecter ?
              </Typography>
              <Typography variant="body2" sx={{ color: titleColor, opacity: 0.8 }}>
                Vous serez redirigé vers la page de connexion.
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', gap: 2, pb: 3 }}>
            <Button
              onClick={() => setIsLogoutDialogOpen(false)}
              variant="outlined"
              sx={{
                borderRadius: borderRadiusGlobal,
                px: 4,
                borderColor: buttonColor,
                color: buttonColor,
                fontFamily: globalFont,
                fontWeight: 'bold',
                '&:hover': {
                  backgroundColor: `${buttonColor}15`,
                  borderColor: buttonColor,
                }
              }}
            >
              Annuler
            </Button>
            <Button
              onClick={handleLogout}
              variant="contained"
              sx={{
                borderRadius: borderRadiusGlobal,
                px: 4,
                backgroundColor: buttonColor,
                fontFamily: globalFont,
                fontWeight: 'bold',
                '&:hover': {
                  backgroundColor: buttonColor,
                  opacity: 0.9,
                  transform: 'translateY(-1px)',
                  boxShadow: `0 4px ${boxShadow}px rgba(0,0,0,0.2)`
                }
              }}
            >
              Se déconnecter
            </Button>
          </DialogActions>
        </Dialog>

        {/* Contenu principal */}
        <main style={{ 
          marginLeft: isSidebarOpen ? 220 : 70, 
          marginTop: 100, 
          padding: 20, 
          transition: "margin-left 0.3s ease", 
          minHeight: "100vh", 
          backdropFilter: pageBgImage ? "blur(2px)" : "none" 
        }}>
          <br/><br/>

          {/* Bouton filtre colonnes - AVEC PREVENTION */}
          <Stack direction="row" justifyContent="flex-end" sx={{ position: "sticky", top: 10, zIndex: 10, mb: 2 }}>
            <IconButton 
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                handleOpen(event);
              }} 
              sx={{ 
                backgroundColor: "#fff", 
                color: buttonColor, 
                border: `2px solid ${buttonColor}`, 
                "&:hover": { backgroundColor: `${buttonColor}15` }, 
                borderRadius: borderRadiusGlobal 
              }}
            >
              <FilterAltIcon />
            </IconButton>
          </Stack>

          {/* Popover filtres colonnes */}
          <Popover open={open} anchorEl={anchorEl} onClose={handleClose} anchorOrigin={{ vertical: "bottom", horizontal: "right" }} transformOrigin={{ vertical: "top", horizontal: "right" }}>
            <Box sx={{ p: 2, minWidth: 250, backgroundColor: formBgColor, borderRadius: borderRadiusGlobal }}>
              <Typography variant="subtitle1" gutterBottom sx={{ color: titleColor, fontFamily: titleFont }}>
                Colonnes visibles
              </Typography>
              <Stack direction="column" spacing={1}>
                {allColumns.map((col, idx) => (
                  <FormControlLabel
                    key={col.key}
                    control={
                      <Checkbox 
                        checked={col.visible} 
                        onChange={() => {
                          const newCols = [...allColumns];
                          newCols[idx].visible = !newCols[idx].visible;
                          setAllColumns(newCols);
                        }}
                        sx={{
                          color: buttonColor,
                          '&.Mui-checked': {
                            color: buttonColor,
                          },
                        }}
                      />
                    }
                    label={col.label}
                    sx={{ color: titleColor }}
                  />
                ))}
              </Stack>
            </Box>
          </Popover>

          {/* Tableau principal */}
          <TableContainer 
            component={Paper} 
            sx={{ 
              borderRadius: borderRadiusGlobal, 
              overflowX: "auto", 
              backgroundColor: formBgColor, 
              boxShadow: `${boxShadow}px ${boxShadow}px ${boxShadow * 2}px rgba(0,0,0,0.1)`, 
              mt: 2 
            }}
          >
            <Table stickyHeader size="medium">
              <TableHead>
                <TableRow>
                  {allColumns.filter((col) => col.visible).map((col) => (
                    <TableCell 
                      key={col.key} 
                      sx={{ 
                        fontWeight: "bold", 
                        textAlign: "center", 
                        px: 2, 
                        py: 1, 
                        backgroundColor: buttonColor, 
                        color: 'white',
                        fontFamily: titleFont,
                        fontSize: '0.95rem'
                      }}
                    >
                      {col.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={allColumns.filter(col => col.visible).length} align="center">
                      <LoadingSpinner color={buttonColor} />
                    </TableCell>
                  </TableRow>
                ) : displayContacts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={allColumns.filter(col => col.visible).length} align="center">
                      <Typography variant="body2" sx={{ color: titleColor, opacity: 0.7 }}>
                        {contacts.length === 0 ? 'Aucun utilisateur trouvé' : 'Aucun résultat pour cette recherche'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  displayContacts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((contact) => (
                    <TableRow key={contact._id} hover>
                      {allColumns.filter((col) => col.visible).map((col) => {
                        switch (col.key) {
                          case "imageUrl":
                            return (
                              <TableCell key={col.key} align="center">
                                <SafeAvatar
                                  src={contact.image || contact.imageUrl}
                                  alt={contact.name}
                                  sx={{ 
                                    width: 40, 
                                    height: 40, 
                                    margin: "auto",
                                    border: `2px solid ${buttonColor}`
                                  }}
                                />
                              </TableCell>
                            );
                          case "qr":
                            return (
                              <TableCell key={col.key} align="center">
                                <QRCodeSVG 
                                  value={contact._id} 
                                  size={40}
                                  fgColor={buttonColor}
                                />
                              </TableCell>
                            );
                          case "presentToday":
                            return (
                              <TableCell key={col.key} align="center">
                                <Chip
                                  label={contact.presentToday ? "Présent" : "Absent"}
                                  sx={{ 
                                    backgroundColor: contact.presentToday ? "#4caf50" : "#f44336", 
                                    color: "#fff",
                                    fontWeight: 500,
                                    borderRadius: borderRadiusGlobal
                                  }}
                                />
                              </TableCell>
                            );
                          case "contractStart":
                          case "contractEnd":
                          case "activityDeadline":
                          case "birthday":
                            return (
                              <TableCell key={col.key} align="center" sx={{ color: titleColor }}>
                                {formatDateForDisplay(contact[col.key])}
                              </TableCell>
                            );
                          case "salary":
                            return (
                              <TableCell key={col.key} align="center" sx={{ color: titleColor }}>
                                {formatSalary(contact[col.key])}
                              </TableCell>
                            );
                          case "actions":
                            return (
                              <TableCell key={col.key} align="center">
                                <Stack direction="row" spacing={1} justifyContent="center">
                                  <Tooltip title="Modifier">
                                    <IconButton 
                                      onClick={(event) => { 
                                        event.preventDefault();
                                        event.stopPropagation();
                                        setSelectedContact(contact); 
                                        setNewEntryModalOpen(true); 
                                      }} 
                                      size="small" 
                                      sx={{ 
                                        color: buttonColor, 
                                        '&:hover': { backgroundColor: `${buttonColor}15` } 
                                      }}
                                    >
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>

                                  <Tooltip title="Supprimer">
                                    <IconButton 
                                      onClick={(event) => {
                                        event.preventDefault();
                                        event.stopPropagation();
                                        handleDeleteMember(contact._id);
                                      }} 
                                      size="small" 
                                      sx={{ 
                                        color: '#f44336', 
                                        '&:hover': { backgroundColor: '#ffebee' } 
                                      }}
                                    >
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>

                                  <Tooltip title="Historique">
                                    <IconButton 
                                      onClick={(event) => { 
                                        event.preventDefault();
                                        event.stopPropagation();
                                        setSelectedContactHistory(contact); 
                                        setHistoryModalOpen(true); 
                                      }} 
                                      size="small" 
                                      sx={{ 
                                        color: buttonColor, 
                                        '&:hover': { backgroundColor: `${buttonColor}15` } 
                                      }}
                                    >
                                      <HistoryIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>

                                  <Tooltip title="Exporter PDF">
                                    <IconButton 
                                      onClick={(event) => {
                                        event.preventDefault();
                                        event.stopPropagation();
                                        exportQrToPdf(contact);
                                      }} 
                                      size="small" 
                                      sx={{ 
                                        color: buttonColor, 
                                        '&:hover': { backgroundColor: `${buttonColor}15` } 
                                      }}
                                    >
                                      <PictureAsPdfIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>

                                  <Tooltip title={contact.presentToday ? "Marquer Absent" : "Marquer Présent"}>
                                    <IconButton 
                                      onClick={(event) => {
                                        event.preventDefault();
                                        event.stopPropagation();
                                        handleTogglePresence(contact._id);
                                      }} 
                                      size="small" 
                                      sx={{ 
                                        backgroundColor: contact.presentToday ? "#f44336" : "#4caf50", 
                                        color: "#fff", 
                                        '&:hover': { backgroundColor: contact.presentToday ? "#d32f2f" : "#388e3c" } 
                                      }}
                                    >
                                      {contact.presentToday ? <CloseIcon fontSize="small" /> : <CheckIcon fontSize="small" />}
                                    </IconButton>
                                  </Tooltip>
                                </Stack>
                              </TableCell>
                            );
                          default:
                            return (
                              <TableCell key={col.key} align="center" sx={{ color: titleColor }}>
                                {contact[col.key] || '-'}
                              </TableCell>
                            );
                        }
                      })}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={displayContacts.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
              labelRowsPerPage="Lignes par page:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
              sx={{
                '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                  color: titleColor,
                  fontFamily: globalFont
                }
              }}
            />
          </TableContainer>
        </main>
      </div>

      {/* Snackbar pour les notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ 
            width: '100%',
            fontFamily: globalFont,
            borderRadius: borderRadiusGlobal
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Modals */}
      <NewEntryModal 
        open={isNewEntryModalOpen} 
        onClose={() => setNewEntryModalOpen(false)} 
        onSave={handleSaveNewEntry} 
        contact={selectedContact}
        showSnackbar={showSnackbar}
      />
      <HistoryModal open={isHistoryModalOpen} onClose={() => setHistoryModalOpen(false)} contact={selectedContactHistory} />
      <QrScannerModal 
        open={isScannerOpen} 
        onClose={() => setScannerOpen(false)} 
        onScanSuccess={handleScanSuccess}
        showSnackbar={showSnackbar}
      />
    </>
  );
};

export default Dashboard;
