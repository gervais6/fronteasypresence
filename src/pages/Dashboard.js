import React, { useState, useEffect, useContext, useRef } from 'react';
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
  Chip,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction
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
import SendIcon from '@mui/icons-material/Send';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import CallEndIcon from '@mui/icons-material/CallEnd';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
import TaskIcon from '@mui/icons-material/Task';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import EventIcon from '@mui/icons-material/Event';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
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

// Types de tâches pour la Todo List
const TASK_PRIORITIES = [
  { value: 'low', label: 'Basse', color: '#4CAF50' },
  { value: 'medium', label: 'Moyenne', color: '#FF9800' },
  { value: 'high', label: 'Haute', color: '#F44336' }
];

const TASK_CATEGORIES = [
  { value: 'work', label: 'Travail' },
  { value: 'personal', label: 'Personnel' },
  { value: 'shopping', label: 'Courses' },
  { value: 'health', label: 'Santé' },
  { value: 'other', label: 'Autre' }
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

const formatDateTimeForDisplay = (dateString) => {
  if (!dateString) return '-';
  try {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
  
  if (imagePath.startsWith('http') || imagePath.startsWith('blob:')) {
    return imagePath;
  }
  
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
      key={`${imageUrl}-${retryCount}`}
    />
  );
};

// Hook pour la gestion des tâches
const useTodoList = () => {
  const [tasks, setTasks] = useState([]);

  // Charger les tâches depuis le localStorage au démarrage
  useEffect(() => {
    const savedTasks = localStorage.getItem('todoList');
    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks));
      } catch (error) {
        console.error('Erreur lors du chargement des tâches:', error);
      }
    }
  }, []);

  // Sauvegarder les tâches dans le localStorage à chaque modification
  useEffect(() => {
    localStorage.setItem('todoList', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (task) => {
    const newTask = {
      id: Date.now().toString(),
      title: task.title,
      description: task.description || '',
      priority: task.priority || 'medium',
      category: task.category || 'work',
      dueDate: task.dueDate || '',
      completed: false,
      createdAt: new Date().toISOString(),
      assignedTo: task.assignedTo || null
    };
    setTasks(prev => [newTask, ...prev]);
    return newTask;
  };

  const updateTask = (taskId, updates) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    ));
  };

  const deleteTask = (taskId) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const toggleTaskCompletion = (taskId) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const clearCompletedTasks = () => {
    setTasks(prev => prev.filter(task => !task.completed));
  };

  return {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    clearCompletedTasks
  };
};

// Modal pour la Todo List
const TodoListModal = ({ open, onClose, contacts }) => {
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category: 'work',
    dueDate: '',
    assignedTo: ''
  });
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate');
  const { buttonColor } = useContext(CustomizationContext);
  
  const {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    clearCompletedTasks
  } = useTodoList();

  const handleAddTask = () => {
    if (!newTask.title.trim()) return;
    
    addTask(newTask);
    setNewTask({
      title: '',
      description: '',
      priority: 'medium',
      category: 'work',
      dueDate: '',
      assignedTo: ''
    });
  };

  const handleInputChange = (field, value) => {
    setNewTask(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'completed') return task.completed;
    if (filter === 'active') return !task.completed;
    if (filter === 'overdue') {
      if (!task.dueDate) return false;
      return new Date(task.dueDate) < new Date() && !task.completed;
    }
    return true;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sortBy) {
      case 'dueDate':
        return new Date(a.dueDate || '9999-12-31') - new Date(b.dueDate || '9999-12-31');
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      case 'createdAt':
        return new Date(b.createdAt) - new Date(a.createdAt);
      default:
        return 0;
    }
  });

  const getPriorityIcon = (priority) => {
    const priorityConfig = TASK_PRIORITIES.find(p => p.value === priority);
    return (
      <PriorityHighIcon 
        sx={{ 
          color: priorityConfig?.color || '#666',
          fontSize: 16 
        }} 
      />
    );
  };

  const getCategoryIcon = (category) => {
    const categoryConfig = TASK_CATEGORIES.find(c => c.value === category);
    return (
      <EventIcon 
        sx={{ 
          color: buttonColor,
          fontSize: 16 
        }} 
      />
    );
  };

  const isTaskOverdue = (task) => {
    if (!task.dueDate || task.completed) return false;
    return new Date(task.dueDate) < new Date();
  };

  const completedCount = tasks.filter(task => task.completed).length;
  const totalCount = tasks.length;
  const overdueCount = tasks.filter(task => isTaskOverdue(task)).length;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          height: '90vh'
        }
      }}
    >
      <DialogTitle sx={{ 
        backgroundColor: buttonColor,
        color: 'white',
        textAlign: 'center',
        py: 3
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
          <TaskIcon sx={{ fontSize: 32 }} />
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            Ma Todo List
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Statistiques */}
        <Box sx={{ p: 2, backgroundColor: '#f8f9fa', borderBottom: '1px solid #e0e0e0' }}>
          <Stack direction="row" spacing={3} justifyContent="center">
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: buttonColor }}>
                {totalCount}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Total
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
                {completedCount}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Terminées
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#F44336' }}>
                {overdueCount}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                En retard
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Formulaire d'ajout */}
        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
          <Stack spacing={2}>
            <TextField
              label="Nouvelle tâche"
              value={newTask.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              fullWidth
              size="small"
              placeholder="Quelle est votre prochaine tâche ?"
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleAddTask();
              }}
            />
            
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Priorité</InputLabel>
                <Select
                  value={newTask.priority}
                  label="Priorité"
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                >
                  {TASK_PRIORITIES.map(priority => (
                    <MenuItem key={priority.value} value={priority.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PriorityHighIcon sx={{ color: priority.color, fontSize: 16 }} />
                        {priority.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Catégorie</InputLabel>
                <Select
                  value={newTask.category}
                  label="Catégorie"
                  onChange={(e) => handleInputChange('category', e.target.value)}
                >
                  {TASK_CATEGORIES.map(category => (
                    <MenuItem key={category.value} value={category.value}>
                      {category.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Échéance"
                type="date"
                value={newTask.dueDate}
                onChange={(e) => handleInputChange('dueDate', e.target.value)}
                size="small"
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 140 }}
              />

              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Assigner à</InputLabel>
                <Select
                  value={newTask.assignedTo}
                  label="Assigner à"
                  onChange={(e) => handleInputChange('assignedTo', e.target.value)}
                >
                  <MenuItem value="">Moi-même</MenuItem>
                  {contacts.map(contact => (
                    <MenuItem key={contact._id} value={contact._id}>
                      {contact.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button
                onClick={handleAddTask}
                variant="contained"
                disabled={!newTask.title.trim()}
                sx={{
                  backgroundColor: buttonColor,
                  '&:hover': { backgroundColor: buttonColor },
                  minWidth: 100
                }}
              >
                <AddIcon sx={{ mr: 1 }} />
                Ajouter
              </Button>
            </Stack>
          </Stack>
        </Box>

        {/* Filtres et tris */}
        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', backgroundColor: '#f5f5f5' }}>
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
            <Stack direction="row" spacing={1}>
              {['all', 'active', 'completed', 'overdue'].map(filterType => (
                <Chip
                  key={filterType}
                  label={
                    filterType === 'all' ? 'Toutes' :
                    filterType === 'active' ? 'Actives' :
                    filterType === 'completed' ? 'Terminées' : 'En retard'
                  }
                  variant={filter === filterType ? "filled" : "outlined"}
                  onClick={() => setFilter(filterType)}
                  sx={{
                    backgroundColor: filter === filterType ? buttonColor : 'transparent',
                    color: filter === filterType ? 'white' : buttonColor,
                    borderColor: buttonColor,
                    fontSize: '0.75rem'
                  }}
                />
              ))}
            </Stack>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Trier par</InputLabel>
              <Select
                value={sortBy}
                label="Trier par"
                onChange={(e) => setSortBy(e.target.value)}
              >
                <MenuItem value="dueDate">Échéance</MenuItem>
                <MenuItem value="priority">Priorité</MenuItem>
                <MenuItem value="createdAt">Date création</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Box>

        {/* Liste des tâches */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {sortedTasks.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <TaskIcon sx={{ fontSize: 60, color: '#ccc', mb: 2 }} />
              <Typography variant="body1" color="textSecondary">
                {filter === 'completed' ? 'Aucune tâche terminée' :
                 filter === 'active' ? 'Aucune tâche en cours' :
                 filter === 'overdue' ? 'Aucune tâche en retard' : 'Aucune tâche'}
              </Typography>
            </Box>
          ) : (
            <List>
              {sortedTasks.map(task => {
                const assignedContact = contacts.find(c => c._id === task.assignedTo);
                const isOverdue = isTaskOverdue(task);
                
                return (
                  <ListItem
                    key={task.id}
                    sx={{
                      borderBottom: '1px solid #f0f0f0',
                      backgroundColor: task.completed ? '#f8f9fa' : 'white',
                      opacity: task.completed ? 0.7 : 1,
                      '&:hover': {
                        backgroundColor: task.completed ? '#f0f0f0' : '#fafafa'
                      }
                    }}
                  >
                    <ListItemIcon>
                      <IconButton 
                        onClick={() => toggleTaskCompletion(task.id)}
                        sx={{ 
                          color: task.completed ? '#4CAF50' : '#ccc',
                          '&:hover': { 
                            color: task.completed ? '#45a049' : buttonColor 
                          }
                        }}
                      >
                        {task.completed ? <RadioButtonCheckedIcon /> : <RadioButtonUncheckedIcon />}
                      </IconButton>
                    </ListItemIcon>

                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              textDecoration: task.completed ? 'line-through' : 'none',
                              fontWeight: task.priority === 'high' ? 'bold' : 'normal',
                              color: task.completed ? 'text.secondary' : 'text.primary'
                            }}
                          >
                            {task.title}
                          </Typography>
                          {getPriorityIcon(task.priority)}
                          {getCategoryIcon(task.category)}
                          {isOverdue && !task.completed && (
                            <Chip
                              label="En retard"
                              size="small"
                              sx={{
                                backgroundColor: '#F44336',
                                color: 'white',
                                fontSize: '0.6rem',
                                height: 20
                              }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          {task.description && (
                            <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                              {task.description}
                            </Typography>
                          )}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: '0.75rem', color: 'text.secondary' }}>
                            {task.dueDate && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <EventIcon sx={{ fontSize: 14 }} />
                                {formatDateForDisplay(task.dueDate)}
                              </Box>
                            )}
                            {assignedContact && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <SafeAvatar
                                  src={assignedContact.image || assignedContact.imageUrl}
                                  alt={assignedContact.name}
                                  sx={{ width: 20, height: 20 }}
                                />
                                {assignedContact.name}
                              </Box>
                            )}
                          </Box>
                        </Box>
                      }
                    />

                    <ListItemSecondaryAction>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="Supprimer">
                          <IconButton 
                            edge="end" 
                            onClick={() => deleteTask(task.id)}
                            sx={{ 
                              color: '#f44336',
                              '&:hover': { backgroundColor: '#ffebee' }
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </ListItemSecondaryAction>
                  </ListItem>
                );
              })}
            </List>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'space-between', p: 2, borderTop: '1px solid #e0e0e0' }}>
        <Button
          onClick={clearCompletedTasks}
          disabled={completedCount === 0}
          sx={{
            color: '#f44336',
            '&:hover': { backgroundColor: '#ffebee' }
          }}
        >
          Supprimer les terminées
        </Button>
        <Button
          onClick={onClose}
          sx={{
            backgroundColor: buttonColor,
            color: 'white',
            '&:hover': { backgroundColor: buttonColor }
          }}
        >
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Hook personnalisé pour la gestion des formulaires
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

  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, []);

  useEffect(() => {
    if (initialUser) {
      setFormData({
        name: initialUser.name || '',
        email: initialUser.email || '',
        password: '',
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
      setImagePreview(initialUser.image || initialUser.imageUrl || null);
    }
  }, [initialUser]);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleImageChange = (file) => {
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

// Intercepteur axios
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

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || 'Erreur serveur';

    switch (status) {
      case 401:
        handleLogout();
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

// Modal pour la visioconférence
const VideoCallModal = ({ open, onClose, contact }) => {
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const { buttonColor } = useContext(CustomizationContext);

  useEffect(() => {
    let interval;
    if (open) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
      
      // Simulation d'un appel (dans une vraie app, vous utiliseriez WebRTC)
      simulateCall();
    }

    return () => {
      clearInterval(interval);
      setCallDuration(0);
    };
  }, [open]);

  const simulateCall = () => {
    // Simulation d'un appel vidéo
    if (localVideoRef.current) {
      // Dans une vraie application, vous configureriez les streams vidéo ici
      console.log('Simulation d\'appel vidéo avec', contact?.name);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggleVideo = () => {
    setIsVideoOn(!isVideoOn);
    // Ici, vous désactiveriez le flux vidéo
  };

  const handleToggleAudio = () => {
    setIsAudioOn(!isAudioOn);
    // Ici, vous désactiveriez l'audio
  };

  const handleToggleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
    // Ici, vous géreriez le partage d'écran
  };

  const handleEndCall = () => {
    onClose();
  };

  if (!contact) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{ 
        style: { 
          borderRadius: 15,
          height: '85vh',
          display: 'flex',
          flexDirection: 'column'
        } 
      }}
    >
      {/* En-tête de l'appel */}
      <DialogTitle sx={{ 
        borderBottom: '1px solid #e0e0e0',
        backgroundColor: buttonColor,
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        py: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <SafeAvatar
            src={contact.image || contact.imageUrl}
            alt={contact.name}
            sx={{ width: 50, height: 50 }}
          />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {contact.name}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {contact.position} • {formatTime(callDuration)}
            </Typography>
          </Box>
        </Box>
        <Chip 
          label="En appel" 
          sx={{ 
            backgroundColor: '#4CAF50', 
            color: 'white',
            fontWeight: 'bold'
          }} 
        />
      </DialogTitle>

      <DialogContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 0, backgroundColor: '#1a1a1a' }}>
        {/* Zone vidéo */}
        <Box sx={{ flex: 1, display: 'flex', position: 'relative', p: 2 }}>
          {/* Vidéo distante (grande) */}
          <Box 
            sx={{ 
              flex: 1, 
              backgroundColor: '#2d2d2d', 
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {isVideoOn ? (
              <Box
                ref={remoteVideoRef}
                sx={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: '#3d3d3d',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 2
                }}
              >
                <SafeAvatar
                  src={contact.image || contact.imageUrl}
                  alt={contact.name}
                  sx={{ width: 120, height: 120 }}
                />
                <Typography 
                  variant="h6" 
                  sx={{ 
                    position: 'absolute', 
                    bottom: 16, 
                    left: 16, 
                    color: 'white',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    px: 2,
                    py: 1,
                    borderRadius: 2
                  }}
                >
                  {contact.name}
                </Typography>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', color: 'white' }}>
                <VideocamOffIcon sx={{ fontSize: 60, mb: 2 }} />
                <Typography variant="h6">Caméra éteinte</Typography>
              </Box>
            )}
          </Box>

          {/* Vidéo locale (petite) */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 16,
              right: 16,
              width: 200,
              height: 150,
              backgroundColor: '#2d2d2d',
              borderRadius: 2,
              border: '2px solid #fff',
              overflow: 'hidden'
            }}
          >
            {isVideoOn ? (
              <Box
                ref={localVideoRef}
                sx={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: '#4d4d4d',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <SafeAvatar
                  src={null} // Votre propre avatar
                  alt="Vous"
                  sx={{ width: 60, height: 60 }}
                />
              </Box>
            ) : (
              <Box sx={{ 
                width: '100%', 
                height: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: 'white'
              }}>
                <VideocamOffIcon />
              </Box>
            )}
            <Typography 
              variant="caption" 
              sx={{ 
                position: 'absolute', 
                bottom: 4, 
                left: 8, 
                color: 'white',
                backgroundColor: 'rgba(0,0,0,0.5)',
                px: 1,
                borderRadius: 1
              }}
            >
              Vous
            </Typography>
          </Box>
        </Box>

        {/* Contrôles d'appel */}
        <Box sx={{ p: 3, backgroundColor: '#2d2d2d', borderTop: '1px solid #404040' }}>
          <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
            {/* Contrôle audio */}
            <Tooltip title={isAudioOn ? "Couper le micro" : "Activer le micro"}>
              <IconButton 
                onClick={handleToggleAudio}
                sx={{ 
                  backgroundColor: isAudioOn ? buttonColor : '#f44336',
                  color: 'white',
                  width: 56,
                  height: 56,
                  '&:hover': { 
                    backgroundColor: isAudioOn ? `${buttonColor}dd` : '#d32f2f'
                  }
                }}
              >
                {isAudioOn ? <MicIcon /> : <MicOffIcon />}
              </IconButton>
            </Tooltip>

            {/* Contrôle vidéo */}
            <Tooltip title={isVideoOn ? "Couper la caméra" : "Activer la caméra"}>
              <IconButton 
                onClick={handleToggleVideo}
                sx={{ 
                  backgroundColor: isVideoOn ? buttonColor : '#f44336',
                  color: 'white',
                  width: 56,
                  height: 56,
                  '&:hover': { 
                    backgroundColor: isVideoOn ? `${buttonColor}dd` : '#d32f2f'
                  }
                }}
              >
                {isVideoOn ? <VideocamIcon /> : <VideocamOffIcon />}
              </IconButton>
            </Tooltip>

            {/* Partage d'écran */}
            <Tooltip title={isScreenSharing ? "Arrêter le partage" : "Partager l'écran"}>
              <IconButton 
                onClick={handleToggleScreenShare}
                sx={{ 
                  backgroundColor: isScreenSharing ? '#ff9800' : buttonColor,
                  color: 'white',
                  width: 56,
                  height: 56,
                  '&:hover': { 
                    backgroundColor: isScreenSharing ? '#f57c00' : `${buttonColor}dd`
                  }
                }}
              >
                {isScreenSharing ? <StopScreenShareIcon /> : <ScreenShareIcon />}
              </IconButton>
            </Tooltip>

            {/* Raccrocher */}
            <Tooltip title="Raccrocher">
              <IconButton 
                onClick={handleEndCall}
                sx={{ 
                  backgroundColor: '#f44336',
                  color: 'white',
                  width: 56,
                  height: 56,
                  '&:hover': { 
                    backgroundColor: '#d32f2f',
                    transform: 'scale(1.1)'
                  }
                }}
              >
                <CallEndIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

// Modal pour le chat (design amélioré)
const ChatModal = ({ open, onClose, contact }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const { buttonColor } = useContext(CustomizationContext);

  useEffect(() => {
    if (open && contact) {
      setMessages([
        { id: 1, text: 'Bonjour ! Comment allez-vous ?', sender: 'them', timestamp: new Date(Date.now() - 1000 * 60 * 5) },
        { id: 2, text: 'Je vais bien, merci. Et vous ?', sender: 'me', timestamp: new Date(Date.now() - 1000 * 60 * 3) },
        { id: 3, text: 'Très bien aussi, merci ! Avez-vous terminé le rapport ?', sender: 'them', timestamp: new Date(Date.now() - 1000 * 60 * 1) },
      ]);
    }
  }, [open, contact]);

  const handleSendMessage = () => {
    if (message.trim() === '') return;

    const newMessage = {
      id: messages.length + 1,
      text: message,
      sender: 'me',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage('');

    setTimeout(() => {
      const autoReply = {
        id: messages.length + 2,
        text: 'Merci pour votre message ! Je vous répondrai dès que possible.',
        sender: 'them',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, autoReply]);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!contact) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ 
        style: { 
          borderRadius: 15, 
          height: '80vh',
          display: 'flex',
          flexDirection: 'column'
        } 
      }}
    >
      {/* En-tête du chat */}
      <DialogTitle sx={{ 
        borderBottom: '1px solid #e0e0e0',
        backgroundColor: buttonColor,
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        py: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <SafeAvatar
            src={contact.image || contact.imageUrl}
            alt={contact.name}
            sx={{ width: 45, height: 45 }}
          />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {contact.name}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              {contact.position}
            </Typography>
          </Box>
        </Box>
        <Chip 
          label="En ligne" 
          size="small"
          sx={{ 
            backgroundColor: '#4CAF50', 
            color: 'white' 
          }} 
        />
      </DialogTitle>

      <DialogContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 0 }}>
        {/* Zone des messages */}
        <Box sx={{ 
          flex: 1, 
          p: 2, 
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          backgroundColor: '#f8f9fa'
        }}>
          {messages.map((msg) => (
            <Box
              key={msg.id}
              sx={{
                display: 'flex',
                justifyContent: msg.sender === 'me' ? 'flex-end' : 'flex-start',
              }}
            >
              <Box
                sx={{
                  maxWidth: '70%',
                  p: 2,
                  borderRadius: 3,
                  backgroundColor: msg.sender === 'me' ? buttonColor : 'white',
                  color: msg.sender === 'me' ? 'white' : 'text.primary',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  position: 'relative',
                  '&::before': msg.sender === 'me' ? {} : {
                    content: '""',
                    position: 'absolute',
                    left: -8,
                    top: 12,
                    width: 0,
                    height: 0,
                    borderTop: '8px solid transparent',
                    borderBottom: '8px solid transparent',
                    borderRight: '8px solid white'
                  },
                  '&::after': msg.sender === 'me' ? {
                    content: '""',
                    position: 'absolute',
                    right: -8,
                    top: 12,
                    width: 0,
                    height: 0,
                    borderTop: '8px solid transparent',
                    borderBottom: '8px solid transparent',
                    borderLeft: `8px solid ${buttonColor}`
                  } : {}
                }}
              >
                <Typography variant="body1" sx={{ lineHeight: 1.4 }}>
                  {msg.text}
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    display: 'block',
                    textAlign: 'right',
                    mt: 0.5,
                    opacity: 0.7,
                    color: msg.sender === 'me' ? 'rgba(255,255,255,0.8)' : 'text.secondary'
                  }}
                >
                  {msg.timestamp.toLocaleTimeString('fr-FR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>

        {/* Zone de saisie */}
        <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0', backgroundColor: 'white' }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
            <TextField
              fullWidth
              multiline
              maxRows={3}
              placeholder="Tapez votre message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              variant="outlined"
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                }
              }}
            />
            <IconButton 
              onClick={handleSendMessage}
              disabled={!message.trim()}
              sx={{ 
                backgroundColor: buttonColor,
                color: 'white',
                width: 48,
                height: 48,
                '&:hover': { backgroundColor: buttonColor, opacity: 0.9 },
                '&:disabled': { backgroundColor: '#ccc' }
              }}
            >
              <SendIcon />
            </IconButton>
          </Box>
          <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1, display: 'block', textAlign: 'center' }}>
            Appuyez sur Entrée pour envoyer
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

// Modal pour ajouter/modifier un utilisateur (design amélioré)
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
      
      Object.keys(formData).forEach(key => {
        if (formData[key] !== '' && formData[key] !== null && formData[key] !== undefined) {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      if (!image && imagePreview && !imagePreview.startsWith('blob:')) {
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
      size="small"
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: 2,
        }
      }}
    >
      {options && options.map(option => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  );

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
        }
      }}
    >
      <DialogTitle sx={{ 
        textAlign: 'center', 
        fontWeight: 'bold', 
        fontSize: 24,
        backgroundColor: buttonColor,
        color: 'white',
        py: 3
      }}>
        {contact ? 'Modifier utilisateur' : 'Ajouter utilisateur'}
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        <Stack spacing={3} alignItems="stretch">
          {/* Avatar amélioré */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Box sx={{ position: 'relative', width: 120, height: 120 }}>
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
                    sx={{ 
                      position: 'absolute', 
                      top: -5, 
                      right: -5, 
                      backgroundColor: 'white',
                      boxShadow: 2,
                      '&:hover': { backgroundColor: '#f5f5f5' }
                    }}
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
                    backgroundColor: '#fafafa',
                    '&:hover': { backgroundColor: '#f0f0f0' }
                  }}
                >
                  <PhotoCamera fontSize="large" sx={{ color: '#666' }} />
                  <input 
                    hidden 
                    accept="image/*" 
                    type="file" 
                    onChange={(e) => handleImageChange(e.target.files[0])} 
                  />
                </IconButton>
              )}
            </Box>
          </Box>

          {/* Sections avec cartes */}
          <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, color: buttonColor, fontWeight: 'bold' }}>
                Informations de base
              </Typography>
              <Stack spacing={2}>
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
              </Stack>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, color: buttonColor, fontWeight: 'bold' }}>
                Informations professionnelles
              </Typography>
              <Stack spacing={2}>
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
              </Stack>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, color: buttonColor, fontWeight: 'bold' }}>
                Relations et activités
              </Typography>
              <Stack spacing={2}>
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
            </CardContent>
          </Card>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'center', mt: 2, pb: 3, gap: 2 }}>
        <Button 
          onClick={onClose} 
          variant="outlined" 
          sx={{ 
            px: 4, 
            py: 1,
            borderRadius: 2,
            borderColor: buttonColor,
            color: buttonColor,
            '&:hover': {
              borderColor: buttonColor,
              backgroundColor: `${buttonColor}08`
            }
          }}
          disabled={loading}
        >
          Annuler
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={loading}
          sx={{
            px: 4,
            py: 1,
            borderRadius: 2,
            backgroundColor: buttonColor,
            '&:hover': { 
              backgroundColor: buttonColor,
              boxShadow: `0 4px 12px ${buttonColor}40`
            },
            '&:disabled': { opacity: 0.6 }
          }}
        >
          {loading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={16} sx={{ color: 'white' }} />
              Enregistrement...
            </Box>
          ) : (
            'Enregistrer'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Modal pour afficher l'historique (design amélioré)
const HistoryModal = ({ open, onClose, contact }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [videoCallModalOpen, setVideoCallModalOpen] = useState(false);
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

  const handleContact = (type) => {
    if (!contact) return;
    
    if (type === 'call' && contact.number) {
      window.open(`tel:${contact.number}`, '_self');
    } else if (type === 'chat') {
      setChatModalOpen(true);
    } else if (type === 'video') {
      setVideoCallModalOpen(true);
    } else {
      alert(`Fonction ${type} non disponible pour cet utilisateur`);
    }
  };

  if (!contact) return null;

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{ 
          sx: {
            borderRadius: 3,
          }
        }}
      >
        {/* En-tête amélioré */}
        <DialogTitle sx={{ 
          textAlign: 'center', 
          backgroundColor: buttonColor,
          color: 'white',
          py: 3
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
            <SafeAvatar
              src={contact.image || contact.imageUrl}
              alt={contact.name}
              sx={{ 
                width: 80, 
                height: 80, 
                border: '3px solid white',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}
            />
          </Box>

          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
            {contact.name}
          </Typography>
          
          <Typography variant="body1" sx={{ opacity: 0.9, mb: 2 }}>
            {contact.position}
          </Typography>

          {/* Boutons de contact améliorés */}
          <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 1 }}>
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

            <Tooltip title="Visioconférence">
              <IconButton 
                onClick={() => handleContact('video')}
                sx={{ 
                  backgroundColor: '#2196F3',
                  color: 'white',
                  '&:hover': { backgroundColor: '#1976D2' },
                  borderRadius: '50%',
                  width: 50,
                  height: 50
                }}
              >
                <VideocamIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title={`Envoyer un message à ${contact.name}`}>
              <IconButton 
                onClick={() => handleContact('chat')}
                sx={{ 
                  backgroundColor: '#FF9800',
                  color: 'white',
                  '&:hover': { backgroundColor: '#F57C00' },
                  borderRadius: '50%',
                  width: 50,
                  height: 50
                }}
              >
                <ChatIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ mt: 2 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Chip 
              label="Historique de présence" 
              sx={{ 
                backgroundColor: buttonColor, 
                color: 'white',
                fontWeight: 'bold',
                fontSize: '1rem',
                py: 1
              }} 
            />
          </Box>

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
                  <Card
                    key={idx}
                    sx={{
                      borderRadius: 2,
                      backgroundColor: idx % 2 === 0 ? '#f8f9fa' : '#fff',
                      border: '1px solid #e9ecef',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: '#e3f2fd',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }
                    }}
                  >
                    <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                    </CardContent>
                  </Card>
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
              borderRadius: 2,
              px: 4,
              py: 1.2,
              fontWeight: 'bold',
              fontSize: 14,
              '&:hover': { 
                backgroundColor: buttonColor,
                boxShadow: `0 4px 12px ${buttonColor}40`
              },
            }}
          >
            Fermer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modals enfants */}
      <ChatModal 
        open={chatModalOpen} 
        onClose={() => setChatModalOpen(false)} 
        contact={contact} 
      />
      <VideoCallModal 
        open={videoCallModalOpen} 
        onClose={() => setVideoCallModalOpen(false)} 
        contact={contact} 
      />
    </>
  );
};

// Modal pour scanner les QR codes (design amélioré)
const QrScannerModal = ({ open, onClose, onScanSuccess, showSnackbar }) => {
  const qrCodeRegionId = "html5qr-code-full-region";
  const html5QrCodeRef = React.useRef(null);
  const isScanningRef = React.useRef(false);
  const { buttonColor } = useContext(CustomizationContext);

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
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
        }
      }}
    >
      <DialogTitle sx={{ 
        textAlign: 'center', 
        backgroundColor: buttonColor,
        color: 'white',
        py: 3
      }}>
        Scanner QR Code
      </DialogTitle>
      <DialogContent sx={{ textAlign: 'center', py: 3 }}>
        <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary' }}>
          Pointez la caméra vers un QR code pour scanner
        </Typography>
        <div id={qrCodeRegionId} style={{ 
          width: "100%", 
          height: 400, 
          borderRadius: 8,
          overflow: 'hidden'
        }}></div>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
        <Button 
          onClick={onClose}
          sx={{
            backgroundColor: buttonColor,
            color: 'white',
            borderRadius: 2,
            px: 4,
            '&:hover': { 
              backgroundColor: buttonColor,
              boxShadow: `0 4px 12px ${buttonColor}40`
            }
          }}
        >
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Fonction de recherche améliorée
const searchInContacts = (contacts, searchTerm) => {
  if (!searchTerm.trim()) return contacts;

  const searchLower = searchTerm.toLowerCase().trim();
  
  return contacts.filter(contact => {
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

    if (basicFields.some(field => field && field.toString().toLowerCase().includes(searchLower))) {
      return true;
    }

    const dateFields = [
      formatDateForDisplay(contact.contractStart),
      formatDateForDisplay(contact.contractEnd),
      formatDateForDisplay(contact.activityDeadline),
      formatDateForDisplay(contact.birthday)
    ];

    if (dateFields.some(date => date && date.toLowerCase().includes(searchLower))) {
      return true;
    }

    const salaryFormatted = formatSalary(contact.salary);
    if (salaryFormatted && salaryFormatted.toLowerCase().includes(searchLower)) {
      return true;
    }

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
  
  // États pour les modals
  const [isChatModalOpen, setChatModalOpen] = useState(false);
  const [isVideoCallModalOpen, setVideoCallModalOpen] = useState(false);
  const [selectedChatContact, setSelectedChatContact] = useState(null);
  const [isTodoListModalOpen, setTodoListModalOpen] = useState(false);

  // États pour la recherche avec suggestions
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);

  const today = new Date().toISOString().split('T')[0];

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  // Fonction pour générer les suggestions basées sur les contacts
  const generateSearchSuggestions = () => {
    if (!contacts || contacts.length === 0) return [];

    const suggestionsSet = new Set();

    contacts.forEach(contact => {
      // Ajouter le nom
      if (contact.name) suggestionsSet.add(contact.name);
      
      // Ajouter la position
      if (contact.position) suggestionsSet.add(contact.position);
      
      // Ajouter le département/QG
      if (contact.qg) suggestionsSet.add(contact.qg);
      
      // Ajouter le lieu de travail
      if (contact.workLocation) suggestionsSet.add(contact.workLocation);
      
      // Ajouter le type de contrat
      if (contact.contractType) suggestionsSet.add(contact.contractType);
      
      // Ajouter l'activité
      if (contact.activity) suggestionsSet.add(contact.activity);
      
      // Ajouter le manager
      if (contact.manager) suggestionsSet.add(contact.manager);
      
      // Ajouter le mentor
      if (contact.mentor) suggestionsSet.add(contact.mentor);
      
      // Ajouter la nationalité
      if (contact.nationality) suggestionsSet.add(contact.nationality);
      
      // Ajouter l'email
      if (contact.email) suggestionsSet.add(contact.email);
    });

    return Array.from(suggestionsSet).sort();
  };

  // Filtrer les suggestions basé sur la recherche
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setSuggestions(generateSearchSuggestions().slice(0, 10)); // Limiter à 10 suggestions
    } else {
      const allSuggestions = generateSearchSuggestions();
      const filtered = allSuggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 10); // Limiter à 10 résultats
      setSuggestions(filtered);
    }
  }, [searchTerm, contacts]);

  // Fermer les suggestions quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchFocus = () => {
    setShowSuggestions(true);
    if (searchTerm === '') {
      setSuggestions(generateSearchSuggestions().slice(0, 10));
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
  };

  const handleSearchSubmit = () => {
    // La recherche est déjà gérée par le filtrage des contacts via searchTerm
    setShowSuggestions(false);
  };

  const handleOpenChat = (contact) => {
    setSelectedChatContact(contact);
    setChatModalOpen(true);
  };

  const handleOpenVideoCall = (contact) => {
    setSelectedChatContact(contact);
    setVideoCallModalOpen(true);
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

  // Chargement initial des contacts
  useEffect(() => {
    fetchContactsAndPresences();
    
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
        
        const imageUrl = getImageUrl(user.image);
        const permanentImageUrl = imageUrl && imageUrl.startsWith('blob:') 
          ? null
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
          imageUrl: permanentImageUrl,
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

  if (searchTerm.trim()) {
    displayContacts = searchInContacts(displayContacts, searchTerm);
  }

  if (activeFilter && activeFilter !== "Tous") {
    displayContacts = displayContacts.filter((c) => {
      if (activeFilter === "Présents") return c.presentToday === true;
      if (activeFilter === "Absents") return c.presentToday === false;
      if (activeFilter === "QG A") return c.qg === "A";
      if (activeFilter === "QG B") return c.qg === "B";
      return true;
    });
  }

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
        {/* Header avec barre de recherche améliorée */}
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
            {/* Barre de recherche avec suggestions style Odoo */}
            <div ref={searchRef} style={{ 
              display: "flex", 
              alignItems: "center", 
              flex: 1, 
              backgroundColor: "white", 
              borderRadius: borderRadiusGlobal, 
              padding: "2px 12px", 
              margin: '0 20px', 
              minWidth: 0,
              border: "1px solid #e0e0e0",
              position: "relative"
            }}>
              <SearchIcon style={{  marginRight: 8, fontSize: 20 }} />
              <TextField
                placeholder="Rechercher un nom, poste, département..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={handleSearchFocus}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearchSubmit();
                  }
                }}
                variant="standard"
                InputProps={{ 
                  disableUnderline: true,
                  style: { fontSize: 14, color: "#333" }
                }}
                sx={{ 
                  flex: 1, 
                  minWidth: 0,
                  "& .MuiInputBase-input": {
                    padding: "8px 0",
                    "&::placeholder": {
                      color: "#8a8a8a",
                      opacity: 1
                    }
                  }
                }}
              />
              {searchTerm && (
                <IconButton 
                  size="small" 
                  onClick={() => {
                    setSearchTerm('');
                    setShowSuggestions(false);
                  }}
                  sx={{ 
                    color: '#8a8a8a',
                    padding: '4px',
                    '&:hover': { 
                      backgroundColor: 'rgba(0,0,0,0.04)',
                      color: '#666'
                    }
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              )}

              {/* Suggestions dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  backgroundColor: "white",
                  border: "1px solid #e0e0e0",
                  borderRadius: borderRadiusGlobal,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  zIndex: 1000,
                  maxHeight: "250px",
                  overflowY: "auto",
                  marginTop: "4px"
                }}>
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      style={{
                        padding: "10px 16px",
                        cursor: "pointer",
                        borderBottom: "1px solid #f5f5f5",
                        fontSize: "14px",
                        color: "#333",
                        transition: "background-color 0.2s ease",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px"
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = "#f8f9fa";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = "white";
                      }}
                    >
                      <SearchIcon style={{ fontSize: 16, color: "#8a8a8a" }} />
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}

              {/* Message si pas de résultats */}
              {showSuggestions && suggestions.length === 0 && searchTerm && (
                <div style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  backgroundColor: "white",
                  border: "1px solid #e0e0e0",
                  borderRadius: borderRadiusGlobal,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  zIndex: 1000,
                  padding: "16px",
                  fontSize: "14px",
                  color: "#666",
                  marginTop: "4px",
                  textAlign: "center"
                }}>
                  Aucun résultat trouvé pour "{searchTerm}"
                </div>
              )}
            </div>

            {/* Boutons d'action */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Tooltip title="Ma Todo List">
                <IconButton 
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setTodoListModalOpen(true);
                  }}
                  sx={{ 
                    border: `1px solid ${buttonColor}`, 
                    color: buttonColor, 
                    backgroundColor: 'white',
                    "&:hover": { 
                      backgroundColor: `${buttonColor}08`,
                      border: `1px solid ${buttonColor}`
                    }
                  }}
                >
                  <TaskIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title="Notifications">
                <IconButton 
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setNotificationsAnchor(event.currentTarget);
                  }}
                  sx={{ 
                    border: `1px solid ${buttonColor}`, 
                    color: buttonColor, 
                    backgroundColor: 'white',
                    "&:hover": { 
                      backgroundColor: `${buttonColor}08`,
                      border: `1px solid ${buttonColor}`
                    }
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

              <Tooltip title="Ajouter un utilisateur">
                <IconButton
                  onClick={(event) => { 
                    event.preventDefault();
                    event.stopPropagation();
                    setSelectedContact(null); 
                    setNewEntryModalOpen(true); 
                  }}
                  sx={{ 
                    border: `1px solid ${buttonColor}`, 
                    color: buttonColor, 
                    backgroundColor: 'white',
                    "&:hover": { 
                      backgroundColor: `${buttonColor}08`,
                      border: `1px solid ${buttonColor}`
                    }
                  }}
                >
                  <AddIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title="Scanner QR Code">
                <IconButton
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setScannerOpen(true);
                  }}
                  sx={{ 
                    border: `1px solid ${buttonColor}`, 
                    color: buttonColor, 
                    backgroundColor: 'white',
                    "&:hover": { 
                      backgroundColor: `${buttonColor}08`,
                      border: `1px solid ${buttonColor}`
                    }
                  }}
                >
                  <QrCodeScannerIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title="Exporter QR Entreprise (PDF)">
                <IconButton 
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    exportCompanyQrToPdf();
                  }}
                  sx={{ 
                    border: `1px solid ${buttonColor}`, 
                    color: buttonColor, 
                    backgroundColor: 'white',
                    fontSize: 12,
                    "&:hover": { 
                      backgroundColor: `${buttonColor}08`,
                      border: `1px solid ${buttonColor}`
                    }
                  }}
                >
                  <PictureAsPdfIcon />
                </IconButton>
              </Tooltip>
            </div>
          </div>

          {/* Filtres rapides */}
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
          {/* Logo */}
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

          {/* Liste des QG */}
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

        {/* Dialog de confirmation de déconnexion */}
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

          {/* Bouton filtre colonnes */}
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
      <Tooltip title={contact.presentToday ? "Présent - Cliquer pour marquer absent" : "Absent - Cliquer pour marquer présent"}>
        <Box 
          sx={{ 
            fontSize: '2rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            '&:hover': {
            }
          }}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            handleTogglePresence(contact._id);
          }}
        >
          {contact.presentToday ? '🟢' : '🔴'}
        </Box>
      </Tooltip>
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

                                  <Tooltip title="Ouvrir le chat">
                                    <IconButton 
                                      onClick={(event) => { 
                                        event.preventDefault();
                                        event.stopPropagation();
                                        handleOpenChat(contact);
                                      }} 
                                      size="small" 
                                      sx={{ 
                                        color: buttonColor, 
                                        '&:hover': { backgroundColor: `${buttonColor}15` } 
                                      }}
                                    >
                                      <ChatIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>

                                  <Tooltip title="Visioconférence">
                                    <IconButton 
                                      onClick={(event) => { 
                                        event.preventDefault();
                                        event.stopPropagation();
                                        handleOpenVideoCall(contact);
                                      }} 
                                      size="small" 
                                      sx={{ 
                                        color: '#2196F3', 
                                        '&:hover': { backgroundColor: '#E3F2FD' } 
                                      }}
                                    >
                                      <VideocamIcon fontSize="small" />
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
      
      {/* Modals de communication */}
      <ChatModal 
        open={isChatModalOpen} 
        onClose={() => setChatModalOpen(false)} 
        contact={selectedChatContact} 
      />
      <VideoCallModal 
        open={isVideoCallModalOpen} 
        onClose={() => setVideoCallModalOpen(false)} 
        contact={selectedChatContact} 
      />

      {/* Modal Todo List */}
      <TodoListModal 
        open={isTodoListModalOpen} 
        onClose={() => setTodoListModalOpen(false)} 
        contacts={contacts}
      />
    </>
  );
};

export default Dashboard;
