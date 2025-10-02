import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import SearchIcon from '@mui/icons-material/Search';
import { Chip, Select, MenuItem } from '@mui/material';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  TablePagination, Tooltip, IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  Stack, TextField, Fab
} from '@mui/material';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import HistoryIcon from '@mui/icons-material/History';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { FaAngleDoubleLeft, FaAngleDoubleRight } from 'react-icons/fa';
import { HiOutlineUserCircle } from 'react-icons/hi';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { jsPDF } from 'jspdf';
import { Html5Qrcode } from 'html5-qrcode';

const API_DELETE = 'http://localhost:8000/api/auth/users';
const API_USERS = 'http://localhost:8000/api/auth/users';
const API_MEMBRES = 'http://localhost:8000/api/auth/register-user';
const AUTH_BASE = 'http://localhost:8000/api/auth';
const COMPANY_ID = localStorage.getItem('companyId') || 'company_123'; // ID de l'entreprise, configurable via localStorage
const SCAN_START_HOUR = 7; // Heure de début pour le scan
const SCAN_END_HOUR = 19; // Heure de fin pour le scan

// Sauvegarde des actions en attente (offline)
const savePendingAction = (action) => {
  const pending = JSON.parse(localStorage.getItem('pendingActions') || '[]');
  pending.push(action);
  localStorage.setItem('pendingActions', JSON.stringify(pending));
};

// Déconnexion
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

//// Utilitaire pour nettoyer le container temporaire
const cleanupTempContainer = (root, container) => {
  try {
    if (root) root.unmount();
    if (container && container.parentNode) container.parentNode.removeChild(container);
  } catch (err) {
    console.warn('Erreur lors du nettoyage du conteneur temporaire:', err);
  }
};

// Exportation du QR code de l'entreprise en PNG
const exportCompanyQrToPng = () => {
  const tempContainer = document.createElement('div');
  document.body.appendChild(tempContainer);

  const root = ReactDOM.createRoot(tempContainer);
  root.render(<QRCodeSVG value={COMPANY_ID} size={100} />);

  setTimeout(() => {
    const svgElement = tempContainer.querySelector('svg');
    if (!svgElement) {
      toast.error('Erreur : Élément SVG QR non trouvé !');
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
      toast.success('QR code exporté en PNG avec succès !');
    };

    img.onerror = () => {
      toast.error('Erreur lors de la génération du PNG !');
      cleanupTempContainer(root, tempContainer);
    };
  }, 200);
};

// Exportation du QR code de l'entreprise en PDF
const exportCompanyQrToPdf = () => {
  const tempContainer = document.createElement('div');
  document.body.appendChild(tempContainer);

  const root = ReactDOM.createRoot(tempContainer);
  root.render(<QRCodeSVG value={COMPANY_ID} size={100} />);

  setTimeout(() => {
    const svgElement = tempContainer.querySelector('svg');
    if (!svgElement) {
      toast.error('Erreur : Élément SVG QR non trouvé !');
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
      toast.success('PDF exporté avec succès !');
    };

    img.onerror = () => {
      toast.error('Erreur lors de la génération du PDF !');
      cleanupTempContainer(root, tempContainer);
    };
  }, 200);
};

// Exportation du QR code d'un membre en PDF
const exportQrToPdf = (contact) => {
  const qrContainer = document.getElementById(`qr-${contact._id}`);
  if (!qrContainer) return;
  const svgElement = qrContainer.querySelector('svg');
  if (!svgElement) return;

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
    pdf.text(`QR Code de ${contact.name}`, pageWidth / 2, 20, { align: 'center' });

    const pdfWidth = 100;
    const pdfHeight = (img.height * pdfWidth) / img.width;
    const x = (pageWidth - pdfWidth) / 2;
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', x, 30, pdfWidth, pdfHeight);
    pdf.save(`QRCode_${contact.name}.pdf`);
  };

  img.onerror = () => toast.error('Erreur lors de la génération du PDF !');
};


// Modal pour ajouter/modifier un utilisateur
const NewEntryModal = ({ open, onClose, onSave, contact }) => {
  const [name, setName] = useState(contact ? contact.name : '');
  const [position, setPosition] = useState(contact ? contact.position : '');
  const [number, setNumber] = useState(contact ? contact.number : '');
  const [qg, setQG] = useState(contact ? contact.qg : '');
  const [email, setEmail] = useState(contact ? contact.email : '');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(contact ? (contact.role || 'employe') : 'employe');

  useEffect(() => {
    if (contact) {
      setName(contact.name || '');
      setPosition(contact.position || '');
      setNumber(contact.number || '');
      setQG(contact.qg || '');
      setEmail(contact.email || '');
      setRole(contact.role || 'employe');
      setPassword('');
    } else {
      setName('');
      setPosition('');
      setNumber('');
      setQG('');
      setEmail('');
      setPassword('');
      setRole('employe');
    }
  }, [contact, open]);

const handleSave = async () => {
  // Vérification des champs obligatoires pour tous les utilisateurs
  if (!name || !position || !number || !qg) {
    toast.error('Nom, Position, Numéro et QG sont requis');
    return;
  }

  const isNew = !(contact && contact._id);

  // Pour les nouveaux utilisateurs, email, mot de passe et rôle sont obligatoires
  if (isNew && (!email || !password || !role)) {
    toast.error('Email, mot de passe et rôle requis pour créer un utilisateur');
    return;
  }

  // Préparer l'objet utilisateur pour l'API
  const userPayload = {
    name,
    position,
    number,
    qg,
    role: role || 'employe'
  };

  // Ajouter email et password seulement si c'est un nouvel utilisateur
  if (isNew) {
    userPayload.email = email;
    userPayload.password = password;
  }

  try {
    if (isNew) {
      // Création d'un nouvel utilisateur
      const response = await axios.post('http://localhost:8000/api/auth/register-user', userPayload);
      toast.success(response.data.message);
      userPayload._id = response.data.userId; // récupérer l'id du backend
    } else {
      // Modification d'un utilisateur existant
      const response = await axios.put(`http://localhost:8000/api/auth/update-user/${contact._id}`, userPayload);
      toast.success(response.data.message);
      userPayload._id = contact._id;
    }

    // Mettre à jour l'état local
    onSave(userPayload);
    onClose();
  } catch (error) {
    console.error('Erreur dans handleSaveNewEntry:', error);
    toast.error(error.response?.data?.message || 'Erreur inconnue');
  }
};



  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ style: { borderRadius: 20, padding: 20 } }}>
      <DialogTitle style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 22 }}>
        {contact ? 'Modifier utilisateur' : 'Ajouter utilisateur'}
      </DialogTitle>
      <DialogContent style={{ paddingTop: 10 }}>
        <Stack spacing={2}>
          <TextField label="Nom complet" value={name} onChange={(e) => setName(e.target.value)} fullWidth variant="outlined" />
          <TextField label="Position" value={position} onChange={(e) => setPosition(e.target.value)} fullWidth variant="outlined" />
          <TextField label="Numéro" value={number} onChange={(e) => setNumber(e.target.value)} fullWidth variant="outlined" />
          <TextField label="QG" value={qg} onChange={(e) => setQG(e.target.value)} fullWidth variant="outlined" />
          <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth variant="outlined" />
          {!contact && (
            <TextField label="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} fullWidth variant="outlined" type="password" />
          )}
          <div>
            <label style={{ fontSize: 13, color: '#444', marginRight: 8 }}>Rôle</label>
            <Select value={role} onChange={(e) => setRole(e.target.value)} size="small"  fullWidth variant ='outlined'>
              <MenuItem value="admin">admin</MenuItem>
              <MenuItem value="employe">employé</MenuItem>
            </Select>
          </div>
        </Stack>
      </DialogContent>
      <DialogActions style={{ justifyContent: 'center', marginTop: 10 }}>
        <Button onClick={onClose} style={{ backgroundColor: '#9A616D', color: 'white', borderRadius: 12, padding: '8px 20px', fontWeight: 'bold', textTransform: 'none', marginRight: 10 }}>
          Annuler
        </Button>
        <Button onClick={handleSave} style={{ background: 'linear-gradient(180deg, #4A2C2A, #9A616D)', color: 'white', borderRadius: 12, padding: '8px 20px', fontWeight: 'bold', textTransform: 'none' }}>
          Enregistrer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Modal pour afficher l'historique
const HistoryModal = ({ open, onClose, contact }) => {
  if (!contact) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ style: { borderRadius: 20, padding: 20 } }}>
      <DialogTitle style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 22 }}>Historique: {contact.name}</DialogTitle>
      <DialogContent dividers style={{ paddingTop: 10 }}>
        {(!contact.history || contact.history.length === 0) ? (
          <p style={{ textAlign: 'center', color: '#6b7280' }}>Aucun historique pour ce membre.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
            <thead>
              <tr style={{ backgroundColor: '#f3f4f6' }}>
                <th style={{ padding: '10px 0', fontWeight: 'bold' }}>Date</th>
                <th style={{ padding: '10px 0', fontWeight: 'bold' }}>Statut</th>
              </tr>
            </thead>
            <tbody>
              {contact.history.map((entry, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '8px 0' }}>{entry.date}</td>
                  <td style={{ color: entry.present ? '#16a34a' : '#dc2626', fontWeight: 'bold', padding: '8px 0' }}>
                    {entry.present ? `✅ Présent à ${entry.time || '--:--'}` : '❌ Absent'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </DialogContent>
      <DialogActions style={{ justifyContent: 'center', marginTop: 10 }}>
        <Button onClick={onClose} style={{ background: 'linear-gradient(180deg, #4A2C2A, #9A616D)', color: 'white', borderRadius: 12, padding: '8px 20px', fontWeight: 'bold' }}>
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Modal pour scanner les QR codes
const QrScannerModal = ({ open, onClose, onScanSuccess }) => {
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
        // fallback caméra front
        try {
          isScanningRef.current = true;
          await html5QrCodeRef.current.start(
            { facingMode: "user" },
            { fps: 10, qrbox: 250 },
            scanCallback,
            handleError
          );
        } catch {
          toast.error("Impossible d'accéder à la caméra.");
          isScanningRef.current = false;
        }
      }
    };

    // Délai pour que le div soit monté
    const timeout = setTimeout(startScanner, 100);

    return () => {
      clearTimeout(timeout);
      if (html5QrCodeRef.current && isScanningRef.current) {
        html5QrCodeRef.current.stop().catch(() => {});
        isScanningRef.current = false;
      }
    };
  }, [open, onClose, onScanSuccess]);

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


// Composant principal Dashboard
const Dashboard = () => {
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

  const today = new Date().toISOString().split('T')[0];

  // Synchronisation des actions en attente et chargement des contacts
  useEffect(() => {
    const syncPendingActions = async () => {
      if (!navigator.onLine) return;
      const pending = JSON.parse(localStorage.getItem('pendingActions') || '[]');
      for (const action of pending) {
        try {
          if (action.type === 'save') {
            await axios.post(API_MEMBRES, action.data, {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
          } else if (action.type === 'update') {
            await axios.put(`${API_MEMBRES}/${action.data._id}`, action.data, {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
          } else if (action.type === 'delete') {
            await axios.delete(`${API_MEMBRES}/${action.data}`, {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
          } else if (action.type === 'scan') {
            await axios.post(
              action.data.isCompany ? `${API_MEMBRES}/scan-company` : `${API_MEMBRES}/scan`,
              { id: action.data.id, userId: localStorage.getItem('userId'), memberId: action.data.id },
              { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
          }
        } catch (err) {
          console.warn('Sync échouée pour', action, err);
        }
      }
      localStorage.removeItem('pendingActions');
    };

    const fetchContacts = async () => {
  try {
    await syncPendingActions();
    const res = await axios.get(API_USERS, { // 👈 utiliser API_USERS
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    setContacts(res.data);
    localStorage.setItem('contacts', JSON.stringify(res.data));
  } catch (error) {
    console.error('Erreur fetchContacts:', error);
    const stored = localStorage.getItem('contacts');
    if (stored) setContacts(JSON.parse(stored));
  }
};

    fetchContacts();
  }, []);

// Fonction utilitaire : sauvegarde côté Auth



const API_AUTH = "http://localhost:8000/api/auth";

// Fonction utilitaire pour créer un user côté Auth
// À mettre en haut de ton fichier, avant handleSaveNewEntry
const registerAuthUser = async (newEntry) => {
  const payload = {
    name: newEntry.name,
    email: newEntry.email,
    password: newEntry.password,
    role: newEntry.role || "employe",
    phone: newEntry.phone,
    qg: newEntry.qg,
  };

  const res = await axios.post("http://localhost:8000/api/auth/register-user", payload);
  return res.data.userId; // renvoie l'ID créé par MongoDB
};


// À mettre DANS le composant Dashboard
const handleSaveNewEntry = async (newEntry) => {
  try {
    let userId = newEntry._id;

    // --- 1️⃣ Création utilisateur côté Auth si nécessaire ---
    if (!userId && newEntry.email && newEntry.password) {
      if (navigator.onLine) {
        try {
          const authResp = await axios.post(`${AUTH_BASE}/register-user`, {
            name: newEntry.name,
            email: newEntry.email,
            password: newEntry.password,
            role: newEntry.role || 'employe',
            phone: newEntry.phone,
            qg: newEntry.qg,
          });

          userId = authResp.data.userId; // récupérer l'ID côté serveur
          toast.success('Utilisateur créé côté Auth !');
        } catch (err) {
          console.error("Erreur création Auth:", err.response?.data || err.message);
          savePendingAction({ type: 'save', data: newEntry });
          toast.error('Échec création côté Auth, sauvegarde locale.');
          return;
        }
      } else {
        savePendingAction({ type: 'save', data: newEntry });
        toast.info('Hors ligne : sauvegarde locale.');
        return;
      }
    }

    // --- 2️⃣ Préparer le payload pour Membres ---
    const membrePayload = {
      ...newEntry,
      _id: userId,
      role: newEntry.role || 'employe',
      phone: newEntry.phone,
      qg: newEntry.qg,
    };

    // --- 3️⃣ Mettre à jour localStorage ET state React ---
    setContacts((prev) => {
      const updated = [...prev.filter(c => c._id !== userId), membrePayload];
      localStorage.setItem('contacts', JSON.stringify(updated));
      return updated;
    });

    // --- 4️⃣ Sauvegarde côté API Membres ---
    if (navigator.onLine) {
      const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };

      if (!newEntry._id) {
        // Création
        await axios.post(`${API_MEMBRES}`, membrePayload, config);
        toast.success('Membre ajouté !');
      } else {
        // Mise à jour
        await axios.put(`${API_MEMBRES}/${userId}`, membrePayload, config);
        toast.success('Membre mis à jour !');
      }
    } else {
      savePendingAction({ type: newEntry._id ? 'update' : 'save', data: membrePayload });
      toast.info('Hors ligne : action sauvegardée localement.');
    }
  } catch (err) {
    console.error("Erreur dans handleSaveNewEntry:", err);

    if (err.response) {
      toast.error(`Erreur API: ${err.response.data.message || "inconnue"}`);
    } else if (err.request) {
      toast.error("Pas de réponse du serveur.");
    } else {
      toast.error(`Erreur inattendue: ${err.message}`);
    }
  }
};






  // Suppression d'un membre
const handleDeleteMember = async (id) => {
  try {
    await axios.delete(`${API_DELETE}/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    const updated = contacts.filter(c => c._id !== id);
    setContacts(updated);
    localStorage.setItem('contacts', JSON.stringify(updated));
    toast.success('Membre supprimé !');
  } catch (error) {
    toast.error('Erreur suppression membre : ' + (error.response?.data?.message || error.message));
  }
};

  // Bascule de la présence (pour les admins)
  const handleTogglePresence = (id) => {
    const updated = contacts.map((c) => {
      if (c._id === id) {
        const todayEntryIndex = c.history?.findIndex((h) => h.date === today);
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        if (todayEntryIndex >= 0 && c.history[todayEntryIndex].present) {
          toast.info(`${c.name} est déjà marqué présent aujourd'hui.`);
          return c;
        }

        const updatedHistory = todayEntryIndex >= 0
          ? [...c.history]
          : c.history
            ? [...c.history, { date: today, present: true, time: timeStr }]
            : [{ date: today, present: true, time: timeStr }];

        if (todayEntryIndex >= 0) {
          updatedHistory[todayEntryIndex] = { ...updatedHistory[todayEntryIndex], present: true, time: timeStr };
        }

        return { ...c, history: updatedHistory };
      }
      return c;
    });

    setContacts(updated);
    localStorage.setItem('contacts', JSON.stringify(updated));

    const updatedMember = updated.find((c) => c._id === id);
    if (navigator.onLine) {
      axios.put(`${API_MEMBRES}/${id}`, updatedMember, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      }).catch(() => savePendingAction({ type: 'update', data: updatedMember }));
    } else {
      savePendingAction({ type: 'update', data: updatedMember });
    }
    toast.success(`${updatedMember.name} marqué présent !`);
  };

  // Gestion du scan QR
  const handleScanSuccess = async (decodedText) => {
    try {
      if (decodedText === COMPANY_ID) {
        const userId = localStorage.getItem('userId');
        const memberId = localStorage.getItem('memberId');
        const userRole = localStorage.getItem('userRole');

        if (!userId || !memberId) {
          toast.error('Veuillez vous connecter en tant qu\'employé.');
          return;
        }

        if (userRole !== 'employe') {
          toast.error('Seuls les employés peuvent scanner le QR code de l\'entreprise.');
          return;
        }

        const now = new Date();
        const hour = now.getHours();
        if (hour < SCAN_START_HOUR || hour > SCAN_END_HOUR) {
          toast.error(`Scan autorisé seulement entre ${SCAN_START_HOUR}h et ${SCAN_END_HOUR}h !`);
          return;
        }

        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        const updated = contacts.map((c) => {
          if (c._id === memberId) {
            const todayEntryIndex = c.history?.findIndex((h) => h.date === today);
            if (todayEntryIndex >= 0 && c.history[todayEntryIndex].present) {
              toast.info(`${c.name} est déjà marqué présent aujourd'hui.`);
              return c;
            }

            const updatedHistory = todayEntryIndex >= 0
              ? [...c.history]
              : c.history
                ? [...c.history, { date: today, present: true, time: timeStr }]
                : [{ date: today, present: true, time: timeStr }];

            if (todayEntryIndex >= 0) {
              updatedHistory[todayEntryIndex] = { ...updatedHistory[todayEntryIndex], present: true, time: timeStr };
            }

            return { ...c, history: updatedHistory };
          }
          return c;
        });

        setContacts(updated);
        localStorage.setItem('contacts', JSON.stringify(updated));

        if (navigator.onLine) {
          const response = await axios.post(
            `${API_MEMBRES}/scan-company`,
            { userId, memberId },
            { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
          );

          if (response.status === 200) {
            setContacts((prev) =>
              prev.map((c) => (c._id === memberId ? { ...c, history: response.data.membre.history } : c))
            );
            localStorage.setItem('contacts', JSON.stringify(updated));
            toast.success(response.data.message || 'Présence enregistrée avec succès !');
          }
        } else {
          savePendingAction({
            type: 'scan',
            data: { id: memberId, timestamp: new Date().toISOString(), isCompany: true },
          });
          toast.info('Scan enregistré pour synchronisation ultérieure.');
        }
      } else if (decodedText.match(/^[a-fA-F0-9]{24}$/)) {
        const memberId = decodedText;
        const userRole = localStorage.getItem('userRole');

        if (userRole !== 'admin') {
          toast.error('Seuls les administrateurs peuvent scanner les QR codes des membres.');
          return;
        }

        const updated = contacts.map((c) => {
          if (c._id === memberId) {
            const todayEntryIndex = c.history?.findIndex((h) => h.date === today);
            const now = new Date();
            const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

            if (todayEntryIndex >= 0 && c.history[todayEntryIndex].present) {
              toast.info(`${c.name} est déjà marqué présent aujourd'hui.`);
              return c;
            }

            const updatedHistory = todayEntryIndex >= 0
              ? [...c.history]
              : c.history
                ? [...c.history, { date: today, present: true, time: timeStr }]
                : [{ date: today, present: true, time: timeStr }];

            if (todayEntryIndex >= 0) {
              updatedHistory[todayEntryIndex] = { ...updatedHistory[todayEntryIndex], present: true, time: timeStr };
            }

            return { ...c, history: updatedHistory };
          }
          return c;
        });

        setContacts(updated);
        localStorage.setItem('contacts', JSON.stringify(updated));

        const updatedMember = updated.find((c) => c._id === memberId);
        if (navigator.onLine) {
          await axios.put(`${API_MEMBRES}/${memberId}`, updatedMember, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          });
          toast.success(`${updatedMember.name} marqué présent !`);
        } else {
          savePendingAction({ type: 'update', data: updatedMember });
          toast.info('Scan enregistré pour synchronisation ultérieure.');
        }
      } else {
        toast.error('QR code non reconnu !');
      }

      const beepSound = new Audio('/beep.mp3');
      beepSound.play().catch(() => {});
      if (navigator.vibrate) navigator.vibrate(200);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erreur lors du scan';
      toast.error(errorMessage);
      if (!navigator.onLine) {
        savePendingAction({
          type: 'scan',
          data: {
            id: decodedText === COMPANY_ID ? localStorage.getItem('memberId') : decodedText,
            timestamp: new Date().toISOString(),
            isCompany: decodedText === COMPANY_ID,
          },
        });
      }
    }
  };

  // Liste des QG
  const qgList = ['Tous', ...Array.from(new Set(contacts.map((c) => c.qg).filter(Boolean)))];

  // Filtrage des contacts affichés
  let displayContacts = (filterQG === 'Tous' ? contacts : contacts.filter((c) => c.qg === filterQG))
    .filter(
      (c) =>
        c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.position?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .map((c) => {
      const todayEntry = c.history?.find((h) => h.date === today);
      return { ...c, presentToday: todayEntry ? todayEntry.present : false };
    });

  if (activeFilter) {
    displayContacts = displayContacts.filter((c) => {
      if (activeFilter === 'Présents') return c.presentToday === true;
      if (activeFilter === 'Absents') return c.presentToday === false;
      if (activeFilter === 'QG A') return c.qg === 'A';
      if (activeFilter === 'QG B') return c.qg === 'B';
      return true;
    });
  }

  return (
    <>
      <ToastContainer />
      <div className={`wrapper ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <header
          style={{
            position: 'fixed',
            top: 0,
            left: isSidebarOpen ? 220 : 70,
            right: 0,
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            flexWrap: 'wrap',
            alignItems: 'flex-start',
            padding: '8px 20px',
            backgroundColor: '#fff',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            gap: 10,
            borderBottomLeftRadius: 12,
            borderBottomRightRadius: 12,
          }}
          className="main-header"
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '6px 12px',
              borderRadius: 25,
              background: 'linear-gradient(135deg, #4A2C2A, #9A616D)',
              gap: 8,
              width: '100%',
            }}
          >
            <SearchIcon style={{ marginRight: 8, color: '#fff', fontSize: 28 }} />
            <TextField
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              style={{ backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 20, padding: '0 10px', flex: 1 }}
            />
            <Button
              variant="contained"
              onClick={() => {
                setSelectedContact(null);
                setNewEntryModalOpen(true);
              }}
              style={{
                background: 'linear-gradient(180deg, #4A2C2A, #9A616D)',
                color: 'white',
                borderRadius: 20,
                padding: '6px 16px',
                textTransform: 'none',
              }}
            >
              Ajouter
            </Button>
            <Button
              variant="contained"
              onClick={() => setScannerOpen(true)}
              style={{
                background: 'linear-gradient(180deg, #4A2C2A, #9A616D)',
                color: 'white',
                borderRadius: 20,
                padding: '6px 16px',
                textTransform: 'none',
              }}
            >
              Scanner
            </Button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
            {['Présents', 'Absents', 'QG A', 'QG B'].map((filter) => (
              <Chip
                key={filter}
                label={filter}
                onClick={() => setActiveFilter(filter)}
                color={activeFilter === filter ? 'primary' : 'default'}
                variant={activeFilter === filter ? 'filled' : 'outlined'}
                style={{
                  background: activeFilter === filter ? 'linear-gradient(180deg, #4A2C2A, #9A616D)' : 'rgba(0,0,0,0.05)',
                  color: activeFilter === filter ? '#fff' : '#333',
                  borderRadius: 20,
                  padding: '6px 16px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              />
            ))}
          </div>
        </header>

        <aside
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            height: '100vh',
            width: isSidebarOpen ? 220 : 60,
            transition: 'width 0.3s ease-in-out',
            background: 'linear-gradient(180deg, #4A2C2A, #7B3F51)',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            overflowX: 'hidden',
            overflowY: 'auto',
            paddingTop: 10,
            boxShadow: '2px 0 12px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: 10, gap: 10, marginBottom: 40 }}>
            {isSidebarOpen && <div style={{ fontSize: 22, fontWeight: 'bold', whiteSpace: 'nowrap', marginTop: -15 }}>Easy Présence</div>}
            <IconButton
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              style={{ color: 'white', marginTop: -20, transition: 'transform 0.3s' }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'rotate(180deg)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'rotate(0deg)')}
            >
              {isSidebarOpen ? <FaAngleDoubleLeft /> : <FaAngleDoubleRight />}
            </IconButton>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, marginTop: 10, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
            {qgList.map((qg) => (
              <li key={qg} style={{ marginBottom: 8 }}>
                <Button
                  onClick={() => setFilterQG(qg)}
                  variant={filterQG === qg ? 'contained' : 'text'}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    justifyContent: isSidebarOpen ? 'flex-start' : 'center',
                    padding: '10px 14px',
                    color: 'white',
                    backgroundColor: filterQG === qg ? '#9A616D' : 'transparent',
                    textTransform: 'none',
                    borderRadius: 20,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    boxShadow: filterQG === qg ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
                    transition: 'all 0.3s',
                    fontWeight: 500,
                  }}
                >
                  <HiOutlineUserCircle style={{ marginRight: isSidebarOpen ? 10 : 0, fontSize: 20 }} />
                  {isSidebarOpen && <span style={{ flex: 1, textAlign: 'left' }}>{qg}</span>}
                </Button>
              </li>
            ))}
            {localStorage.getItem('userRole') === 'admin' && (
              <>
                <li style={{ marginBottom: 8 }}>
                  <Button
                    onClick={exportCompanyQrToPdf}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      width: '100%',
                      justifyContent: isSidebarOpen ? 'flex-start' : 'center',
                      padding: '10px 14px',
                      color: 'white',
                      backgroundColor: 'transparent',
                      textTransform: 'none',
                      borderRadius: 20,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      transition: 'all 0.3s',
                      fontWeight: 500,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <PictureAsPdfIcon style={{ marginRight: isSidebarOpen ? 10 : 0, fontSize: 20 }} />
                    {isSidebarOpen && <span style={{ flex: 1, textAlign: 'left' }}>QR Entreprise (PDF)</span>}
                  </Button>
                </li>
                <li style={{ marginBottom: 8 }}>
                  <Button
                    onClick={exportCompanyQrToPng}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      width: '100%',
                      justifyContent: isSidebarOpen ? 'flex-start' : 'center',
                      padding: '10px 14px',
                      color: 'white',
                      backgroundColor: 'transparent',
                      textTransform: 'none',
                      borderRadius: 20,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      transition: 'all 0.3s',
                      fontWeight: 500,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <PictureAsPdfIcon style={{ marginRight: isSidebarOpen ? 10 : 0, fontSize: 20 }} />
                    {isSidebarOpen && <span style={{ flex: 1, textAlign: 'left' }}>QR Entreprise (PNG)</span>}
                  </Button>
                </li>
              </>
            )}
            <li style={{ marginTop: 'auto', padding: 12, display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
              <Button
                onClick={handleLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: isSidebarOpen ? '90%' : '50px',
                  backgroundColor: '#9A616D',
                  color: 'white',
                  fontWeight: 'bold',
                  textTransform: 'none',
                  borderRadius: 25,
                  padding: '12px 15px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#A47580')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#9A616D')}
              >
                <ExitToAppIcon style={{ fontSize: 22, marginRight: 5 }} />
                {isSidebarOpen && <span>Déconnexion</span>}
              </Button>
            </li>
          </ul>
        </aside>

        <main
          style={{
            marginLeft: isSidebarOpen ? 220 : 70,
            marginTop: 150,
            padding: 20,
            transition: 'margin-left 0.3s ease',
            minHeight: '100vh',
            display: 'flex',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <TableContainer
            component={Paper}
            style={{
              width: '100%',
              maxWidth: '100%',
              overflowX: 'auto',
              borderRadius: 12,
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              backgroundColor: '#fff',
            }}
          >
            <Table stickyHeader size="medium">
              <TableHead>
                <TableRow style={{ backgroundColor: '#f3f4f6' }}>
                  {['Nom', 'Position', 'Numéro', 'QG', 'Email', 'Rôle', 'QR', 'Statut', 'Actions'].map((title) => (
                    <TableCell key={title} style={{ fontWeight: 'bold', padding: '12px 16px', textAlign: 'center' }}>
                      {title}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {displayContacts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((contact) => (
                  <TableRow key={contact._id} style={{ verticalAlign: 'middle' }}>
                    <TableCell>
                      <div style={{ borderRadius: 12, fontStyle: 'italic', fontWeight: 500, textAlign: 'center' }}>{contact.name}</div>
                    </TableCell>
                    <TableCell>
                      <div style={{ borderRadius: 12, minWidth: 60, textAlign: 'center', fontWeight: 500, transition: 'transform 0.2s', cursor: 'default', fontStyle: 'italic' }}>{contact.position}</div>
                    </TableCell>
                    <TableCell>
                      <div style={{ borderRadius: 12, fontWeight: 500, minWidth: 60, textAlign: 'center', cursor: 'default', fontStyle: 'italic' }}>{contact.number}</div>
                    </TableCell>
                    <TableCell>
                      <div style={{ padding: '6px 12px', borderRadius: 12, fontWeight: 500, fontStyle: 'italic', minWidth: 60, textAlign: 'center', cursor: 'default' }}>{contact.qg}</div>
                    </TableCell>
                    <TableCell style={{ textAlign: 'center' }}>{contact.email || '-'}</TableCell>
                    <TableCell style={{ textAlign: 'center' }}>{contact.role || 'employe'}</TableCell>
                    <TableCell style={{ textAlign: 'center' }}>
                      <div
                        id={`qr-${contact._id}`}
                        style={{
                          display: 'inline-block',
                          padding: 8,
                          borderRadius: 12,
                          backgroundColor: '#fff7ed',
                          color: '#78350f',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                          transition: 'transform 0.2s, box-shadow 0.2s',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                      >
                        <QRCodeSVG value={contact._id} size={50} />
                      </div>
                    </TableCell>
                    <TableCell style={{ textAlign: 'center' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '6px 14px',
                          borderRadius: 20,
                          color: 'white',
                          fontWeight: 'bold',
                          background: contact.presentToday ? 'linear-gradient(135deg, #34d399, #16a34a)' : 'linear-gradient(135deg, #f87171, #dc2626)',
                          boxShadow: contact.presentToday ? '0 2px 6px rgba(22, 163, 74, 0.3)' : '0 2px 6px rgba(220, 38, 38, 0.3)',
                          minWidth: 80,
                          textAlign: 'center',
                          transition: 'transform 0.2s, box-shadow 0.2s',
                          cursor: 'default',
                        }}
                      >
                        {contact.presentToday ? 'Présent' : 'Absent'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div style={{ display: 'flex', flexWrap: 'nowrap', justifyContent: 'center', gap: 6, overflowX: 'auto' }}>
                        <Tooltip title="Modifier">
                          <IconButton onClick={() => { setSelectedContact(contact); setNewEntryModalOpen(true); }} size="small">
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Supprimer">
                          <IconButton onClick={() => handleDeleteMember(contact._id)} size="small">
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Exporter PDF">
                          <IconButton onClick={() => exportQrToPdf(contact)} size="small">
                            <PictureAsPdfIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Historique">
                          <IconButton onClick={() => { setSelectedContactHistory(contact); setHistoryModalOpen(true); }} size="small">
                            <HistoryIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={contact.presentToday ? 'Marquer Absent' : 'Marquer Présent'}>
                          <IconButton
                            onClick={() => handleTogglePresence(contact._id)}
                            size="small"
                            style={{ backgroundColor: contact.presentToday ? '#dc2626' : '#16a34a', color: 'white' }}
                          >
                            {contact.presentToday ? <CloseIcon fontSize="small" /> : <CheckIcon fontSize="small" />}
                          </IconButton>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={displayContacts.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              size="small"
            />
          </TableContainer>
          {window.innerWidth <= 600 && (
            <div style={{ position: 'fixed', bottom: 20, right: 20, display: 'flex', flexDirection: 'column', gap: 12, zIndex: 2000 }}>
              <Tooltip title="Ajouter">
                <IconButton
                  onClick={() => {
                    setSelectedContact(null);
                    setNewEntryModalOpen(true);
                  }}
                  style={{ backgroundColor: '#4A2C2A', color: 'white', width: 56, height: 56, boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
                >
                  <AddIcon />
                </IconButton>
              </Tooltip>
              {localStorage.getItem('userRole') === 'admin' && (
                <>
                  <Tooltip title="Exporter QR (PNG)">
                    <IconButton
                      onClick={exportCompanyQrToPng}
                      style={{ backgroundColor: '#7B3F51', color: 'white', width: 56, height: 56, boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
                    >
                      <PictureAsPdfIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Exporter QR (PDF)">
                    <IconButton
                      onClick={exportCompanyQrToPdf}
                      style={{ backgroundColor: '#7B3F51', color: 'white', width: 56, height: 56, boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
                    >
                      <PictureAsPdfIcon />
                    </IconButton>
                  </Tooltip>
                </>
              )}
              <Tooltip title="Scanner">
                <IconButton
                  onClick={() => setScannerOpen(true)}
                  style={{ backgroundColor: '#9A616D', color: 'white', width: 56, height: 56, boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
                >
                  <QrCodeScannerIcon />
                </IconButton>
              </Tooltip>
            </div>
          )}
        </main>
      </div>
      <NewEntryModal open={isNewEntryModalOpen} onClose={() => setNewEntryModalOpen(false)} onSave={handleSaveNewEntry} contact={selectedContact} />
      <HistoryModal open={isHistoryModalOpen} onClose={() => setHistoryModalOpen(false)} contact={selectedContactHistory} />
      <QrScannerModal open={isScannerOpen} onClose={() => setScannerOpen(false)} onScanSuccess={handleScanSuccess} />
    </>
  );
};

export default Dashboard;
