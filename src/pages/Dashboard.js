import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import SearchIcon from '@mui/icons-material/Search';
import { Chip } from "@mui/material";

import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  TablePagination,  Tooltip
} from '@mui/material';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner'; // ✅ à ajouter

import {
  IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  Stack, TextField, Fab
} from '@mui/material';
import { FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa";
import { HiOutlineUserCircle } from "react-icons/hi";
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import HistoryIcon from '@mui/icons-material/History';
import { ToastContainer, toast } from 'react-toastify';
import { jsPDF } from "jspdf";
import { Html5Qrcode } from "html5-qrcode";
import 'react-toastify/dist/ReactToastify.css';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { FiLogOut } from 'react-icons/fi';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
const API_URL = 'https://backendeasypresence.onrender.com/api/membres';
const savePendingAction = (action) => {
  const pending = JSON.parse(localStorage.getItem("pendingActions") || "[]");
  pending.push(action);
  localStorage.setItem("pendingActions", JSON.stringify(pending));
};

const handleLogout = () => {
  localStorage.removeItem('token');
  window.location.href = '/login';
};

// Export PDF
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
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    pdf.setFontSize(18);
    pdf.text(`QR Code de ${contact.name}`, pageWidth / 2, 20, { align: 'center' });

    const pdfWidth = 100;
    const pdfHeight = (img.height * pdfWidth) / img.width;
    const x = (pageWidth - pdfWidth) / 2;
    const y = 30;
    pdf.addImage(imgData, 'PNG', x, y, pdfWidth, pdfHeight);
    pdf.save(`QRCode_${contact.name}.pdf`);
  };

  img.onerror = () => toast.error("Erreur lors de la génération du PDF !");
};

// Modal Ajout / Modification
const NewEntryModal = ({ open, onClose, onSave, contact }) => {
  const [name, setName] = useState(contact ? contact.name : '');
  const [position, setPosition] = useState(contact ? contact.position : '');
  const [number, setNumber] = useState(contact ? contact.number : '');
  const [qg, setQG] = useState(contact ? contact.qg : '');

  useEffect(() => {
    if (contact) {
      setName(contact.name);
      setPosition(contact.position);
      setNumber(contact.number);
      setQG(contact.qg);
    } else {
      setName(''); setPosition(''); setNumber(''); setQG('');
    }
  }, [contact]);

  const handleSave = () => {
    if (!name || !position || !number || !qg) {
      toast.error("Tous les champs sont requis");
      return;
    }
    const newEntry = { 
      _id: contact?._id || Date.now().toString(),
      name, position, number, qg,
      present: contact?.present || false,
      lastScan: contact?.lastScan || null,
      history: contact?.history || []
    };
    onSave(newEntry);
    onClose();
  };

  return (
   <Dialog
  open={open}
  onClose={onClose}
  maxWidth="sm"
  fullWidth
  PaperProps={{
    style: {
      borderRadius: 20,
      padding: 20,
      background: '#fdfdfd',
      boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
    }
  }}
>
  <DialogTitle style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 22 }}>
    {contact ? "Modifier membre" : "Ajouter membre"}
  </DialogTitle>

  <DialogContent style={{ paddingTop: 10 }}>
    <Stack spacing={2}>
      <TextField 
        label="Nom" 
        value={name} 
        onChange={(e) => setName(e.target.value)} 
        fullWidth 
        variant="outlined"
        InputProps={{ style: { borderRadius: 12, backgroundColor: '#f5f5f5' } }}
      />
      <TextField 
        label="Position" 
        value={position} 
        onChange={(e) => setPosition(e.target.value)} 
        fullWidth 
        variant="outlined"
        InputProps={{ style: { borderRadius: 12, backgroundColor: '#f5f5f5' } }}
      />
      <TextField 
        label="Numéro" 
        value={number} 
        onChange={(e) => setNumber(e.target.value)} 
        fullWidth 
        variant="outlined"
        InputProps={{ style: { borderRadius: 12, backgroundColor: '#f5f5f5' } }}
      />
      <TextField 
        label="QG" 
        value={qg} 
        onChange={(e) => setQG(e.target.value)} 
        fullWidth 
        variant="outlined"
        InputProps={{ style: { borderRadius: 12, backgroundColor: '#f5f5f5' } }}
      />
    </Stack>
  </DialogContent>

  <DialogActions style={{ justifyContent: 'center', marginTop: 10 }}>
    <Button
      onClick={onClose}
      style={{
        backgroundColor: '#9A616D',
        color: 'white',
        borderRadius: 12,
        padding: '8px 20px',
        fontWeight: 'bold',
        textTransform: 'none',
        marginRight: 10,
      }}
    >
      Annuler
    </Button>
    <Button
      onClick={handleSave}
      style={{
        background: 'linear-gradient(180deg, #4A2C2A, #9A616D)',
        color: 'white',
        borderRadius: 12,
        padding: '8px 20px',
        fontWeight: 'bold',
        textTransform: 'none',
      }}
    >
      Enregistrer
    </Button>
  </DialogActions>
</Dialog>

  );
};

// Modal Historique
const HistoryModal = ({ open, onClose, contact }) => {
  if (!contact) return null;
  return (
   <Dialog
  open={open}
  onClose={onClose}
  maxWidth="sm"
  fullWidth
  PaperProps={{
    style: {
      borderRadius: 20,
      padding: 20,
      background: '#fdfdfd',
      boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
    }
  }}
>
  <DialogTitle style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 22 }}>
    Historique: {contact.name}
  </DialogTitle>

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
              <td style={{
                color: entry.present ? '#16a34a' : '#dc2626',
                fontWeight: 'bold',
                padding: '8px 0'
              }}>
                {entry.present ? '✅ Présent' : '❌ Absent'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </DialogContent>

  <DialogActions style={{ justifyContent: 'center', marginTop: 10 }}>
    <Button
      onClick={onClose}
      style={{
        background: 'linear-gradient(180deg, #4A2C2A, #9A616D)',
        color: 'white',
        borderRadius: 12,
        padding: '8px 20px',
        fontWeight: 'bold',
        textTransform: 'none',
      }}
    >
      Fermer
    </Button>
  </DialogActions>
</Dialog>

  );
};

// Modal Scanner QR
const QrScannerModal = ({ open, onClose, onScanSuccess }) => {
  const qrCodeRegionId = "html5qr-code-full-region";

  useEffect(() => {
    if (!open) return;
    let html5QrCode;
    let isScanning = false;

   const startScanner = async () => {
  html5QrCode = new Html5Qrcode(qrCodeRegionId);
  const scanCallback = (decodedText) => {
    if (!isScanning) return;
    isScanning = false;
    onScanSuccess(decodedText);

    // vibration ici aussi si tu veux feedback direct
    if (navigator.vibrate) navigator.vibrate(200);

    html5QrCode.stop().catch(() => {});
    onClose();
  };

  try {
    isScanning = true;
    await html5QrCode.start(
      { facingMode: "environment" }, // 👈 corrige ici
      { fps: 10, qrbox: 250 },
      scanCallback
    );
  } catch {
    // fallback caméra selfie
    isScanning = true;
    await html5QrCode.start(
      { facingMode: "user" },
      { fps: 10, qrbox: 250 },
      scanCallback
    );
  }
};

    const timeout = setTimeout(startScanner, 300);

    return () => {
      clearTimeout(timeout);
      if (html5QrCode && isScanning) html5QrCode.stop().catch(() => {});
      isScanning = false;
    };
  }, [open, onClose, onScanSuccess]);

  return (
    <Dialog
  open={open}
  onClose={onClose}
  maxWidth="sm"
  fullWidth
  PaperProps={{
    style: {
      borderRadius: 20,
      padding: 20,
      background: '#fdfdfd',
      boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
    }
  }}
>
  <DialogTitle style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 22 }}>
    Scanner QR Code
  </DialogTitle>

  <DialogContent dividers style={{ paddingTop: 10 }}>
    <div
      id={qrCodeRegionId}
      style={{
        width: '100%',
        height: 400,
        border: '2px dashed #9A616D',
        borderRadius: 12,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fafafa'
      }}
    >
      <span style={{ color: '#9A616D', fontStyle: 'italic' }}>
        📷 Cadrez un QR code pour scanner
      </span>
    </div>
  </DialogContent>

  <DialogActions style={{ justifyContent: 'center', marginTop: 10 }}>
    <Button
      onClick={onClose}
      style={{
        background: 'linear-gradient(180deg, #4A2C2A, #9A616D)',
        color: 'white',
        borderRadius: 12,
        padding: '8px 20px',
        fontWeight: 'bold',
        textTransform: 'none',
      }}
    >
      Fermer
    </Button>
  </DialogActions>
</Dialog>

  );
};

// Dashboard
const Dashboard = () => 
  {
  const [contacts, setContacts] = useState([]);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isNewEntryModalOpen, setNewEntryModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [isHistoryModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedContactHistory, setSelectedContactHistory] = useState(null);
  const [filterQG, setFilterQG] = useState('Tous');
  const [searchTerm, setSearchTerm] = useState("");
  const [isScannerOpen, setScannerOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState(null);

// Dans ton composant Dashboard, au début avec les autres useState
const [page, setPage] = useState(0); // page courante
const [rowsPerPage, setRowsPerPage] = useState(10); // nombre de lignes par page

  const today = new Date().toISOString().split('T')[0];

  // Synchronisation online
  useEffect(() => {
    const syncPendingActions = async () => {
      if (!navigator.onLine) return;

      const pending = JSON.parse(localStorage.getItem("pendingActions") || "[]");
      for (const action of pending) {
        try {
          if (action.type === "save") await axios.post(API_URL, action.data);
          else if (action.type === "update") await axios.put(`${API_URL}/${action.data._id}`, action.data);
          else if (action.type === "delete") await axios.delete(`${API_URL}/${action.data}`);
        } catch (err) { console.warn("Sync échouée pour", action, err); }
      }
      localStorage.removeItem("pendingActions");
    };

    const fetchContacts = async () => {
      try {
        await syncPendingActions();
        const res = await axios.get(API_URL);
        setContacts(res.data);
      } catch {
        const stored = localStorage.getItem("contacts");
        if (stored) setContacts(JSON.parse(stored));
      }
    };

    fetchContacts();
  }, []);

  // Sauvegarde / modification
  const handleSaveNewEntry = async (newEntry) => {
    setContacts(prev => {
      const exists = prev.find(c => c._id === newEntry._id);
      const updated = exists ? prev.map(c => c._id === newEntry._id ? newEntry : c) : [...prev, newEntry];
      localStorage.setItem("contacts", JSON.stringify(updated));
      return updated;
    });

    if (navigator.onLine) {
      try {
        if (contacts.find(c => c._id === newEntry._id)) await axios.put(`${API_URL}/${newEntry._id}`, newEntry);
        else await axios.post(API_URL, newEntry);
      } catch {
        savePendingAction({ type: contacts.find(c => c._id === newEntry._id) ? "update" : "save", data: newEntry });
      }
    } else {
      savePendingAction({ type: contacts.find(c => c._id === newEntry._id) ? "update" : "save", data: newEntry });
    }

    toast.success("Membre ajouté ");
  };

  // Supprimer membre
  const handleDeleteMember = (id) => {
    const updated = contacts.filter(c => c._id !== id);
    setContacts(updated);
    localStorage.setItem("contacts", JSON.stringify(updated));
    if (navigator.onLine) axios.delete(`${API_URL}/${id}`).catch(() => savePendingAction({ type: "delete", data: id }));
    else savePendingAction({ type: "delete", data: id });
    toast.success("Membre supprimé !");
  };

  // Toggle présence du jour
 // Toggle présence du jour (mais pas si déjà présent)
const handleTogglePresence = (id) => {
  const updated = contacts.map(c => {
    if (c._id === id) {
      const todayEntryIndex = c.history?.findIndex(h => h.date === today);
      if (todayEntryIndex >= 0 && c.history[todayEntryIndex].present) {
        // Déjà présent aujourd'hui, on bloque
        toast.info(`${c.name} est déjà marqué présent aujourd'hui.`);
        return c;
      }

      // Sinon on ajoute comme présent
      const updatedHistory = todayEntryIndex >= 0
        ? [...c.history]
        : c.history ? [...c.history, { date: today, present: true }] : [{ date: today, present: true }];

      if (todayEntryIndex >= 0) updatedHistory[todayEntryIndex].present = true;

      return { ...c, history: updatedHistory };
    }
    return c;
  });

  setContacts(updated);
  localStorage.setItem("contacts", JSON.stringify(updated));

  const updatedMember = updated.find(c => c._id === id);
  if (navigator.onLine) 
    axios.put(`${API_URL}/${id}`, updatedMember).catch(() => savePendingAction({ type: "update", data: updatedMember }));
  else 
    savePendingAction({ type: "update", data: updatedMember });
};





  // Scan QR
  // Scan QR

const handleScanSuccess = (decodedText) => {
  const memberId = decodedText;

  const updated = contacts.map(c => {
    if (c._id === memberId) {
      const todayEntryIndex = c.history?.findIndex(h => h.date === today);
      let updatedHistory;

      if (todayEntryIndex >= 0) {
        // ✅ Toggle présence
        updatedHistory = [...c.history];
        updatedHistory[todayEntryIndex].present = !updatedHistory[todayEntryIndex].present;
      } else {
        // ✅ Si pas encore scanné aujourd'hui → on marque Présent
        updatedHistory = c.history
          ? [...c.history, { date: today, present: true }]
          : [{ date: today, present: true }];
      }

      return { ...c, history: updatedHistory };
    }
    return c;
  });

  setContacts(updated);
  localStorage.setItem("contacts", JSON.stringify(updated));

  const updatedMember = updated.find(c => c._id === memberId);

  if (navigator.onLine) {
    axios.put(`${API_URL}/${memberId}`, updatedMember)
      .catch(() => savePendingAction({ type: "update", data: updatedMember }));
  } else {
    savePendingAction({ type: "update", data: updatedMember });
  }

  // ✅ Feedback sonore + vibration
  const beepSound = new Audio("/beep.mp3");
  beepSound.currentTime = 0;
  beepSound.play().catch(() => {});
  if (navigator.vibrate) navigator.vibrate(200);

  // ✅ Message différent selon l’état
  const todayEntry = updatedMember.history.find(h => h.date === today);
  if (todayEntry?.present) {
    toast.success(`${updatedMember.name} marqué Présent`);
  } else {
    toast.error(`${updatedMember.name} marqué Absent`);
  }
};




  const qgList = ['Tous', ...Array.from(new Set(contacts.map(c => c.qg)))];

  // Filtrer + calcul presentToday
// Filtrer + calcul presentToday
let displayContacts = (filterQG === 'Tous' ? contacts : contacts.filter(c => c.qg === filterQG))
  .filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.position.toLowerCase().includes(searchTerm.toLowerCase())
  )
  .map(c => {
    const todayEntry = c.history?.find(h => h.date === today);
    return { ...c, presentToday: todayEntry ? todayEntry.present : false };
  });

// Filtrer selon chip actif
if (activeFilter) {
  displayContacts = displayContacts.filter(c => {
    if (activeFilter === 'Présents') return c.presentToday === true;
    if (activeFilter === 'Absents') return c.presentToday === false;
    if (activeFilter === 'QG A') return c.qg === 'A';
    if (activeFilter === 'QG B') return c.qg === 'B';
        if (activeFilter === 'Nom') return c.qg === 'B';

    return true;
  });
}


  return (
    <>
      <ToastContainer />
      <div className={`wrapper ${isSidebarOpen ? 'sidebar-open' : ''}`}>
<header
  style={{
    position: "fixed",
    top: 0,
    left: isSidebarOpen ? 220 : 70,
    right: 0,
    zIndex: 100,
    display: "flex",
    flexDirection: "column", // <- pour empiler recherche + chips
    flexWrap: "wrap",
    alignItems: "flex-start",
    padding: "8px 20px",
    backgroundColor: "#fff",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    gap: 10,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  }}
  className="main-header"
>
  {/* Barre de recherche */}
  <div
    style={{
      display: "flex",
      alignItems: "center",
      padding: "6px 12px",
      borderRadius: 25,
      background: "linear-gradient(135deg, #4A2C2A, #9A616D)",
      gap: 8,
      width: "100%",
    }}
  >
    <SearchIcon style={{ marginRight: 8, color: "#fff", fontSize: 28 }} />
    <TextField
      placeholder="Rechercher..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      size="small"
      style={{
        backgroundColor: "rgba(255,255,255,0.9)",
        borderRadius: 20,
        padding: "0 10px",
        flex: 1, // <- s'adapte à l'espace
      }}
    />
    <Button
      variant="contained"
      onClick={() => setNewEntryModalOpen(true)}
      style={{
        background: "linear-gradient(180deg, #4A2C2A, #9A616D)",
        color: "white",
        borderRadius: 20,
        padding: "6px 16px",
        textTransform: "none",
      }}
    >
      Ajouter
    </Button>
    <Button
      variant="contained"
      onClick={() => setScannerOpen(true)}
      style={{
        background: "linear-gradient(180deg, #4A2C2A, #9A616D)",
        color: "white",
        borderRadius: 20,
        padding: "6px 16px",
        textTransform: "none",
      }}
    >
      Scanner
    </Button>
  </div>

  {/* Chips de recherche */}
  <div
    style={{
      display: "flex",
      flexWrap: "wrap",
      gap: 8,
      marginTop: 6,
    }}
  >
    { ["QG ","Présents", "Absents", "Non", "Numero", "Position",].map((filter) => (
      <Chip
        key={filter}
        label={filter}
        onClick={() => setActiveFilter(filter)} // ton state pour filtrer
        color={activeFilter === filter ? "primary" : "default"}
        variant={activeFilter === filter ? "filled" : "outlined"}
       style={{
        background: activeFilter === filter 
          ? "linear-gradient(180deg, #4A2C2A, #9A616D)" // ✅ comme "Scanner" et "Ajouter"
          : "rgba(0,0,0,0.05)", 
        color: activeFilter === filter ? "#fff" : "#333",
        borderRadius: 20,
        padding: "6px 16px",
        fontWeight: 500,
        cursor: "pointer",
      }}

      />
    ))}
  </div>

  {/* CSS */}
  <style>
    {`
      @media (max-width: 600px) {
        .main-header {
          display: none !important;
        }
      }
    `}
  </style>
</header>




   
        {/* Sidebar */}
   <aside style={{
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
}}>

  {/* Header */}
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: 10, gap: 10, marginBottom: 40 }}>
    {isSidebarOpen && <div style={{ fontSize: 22, fontWeight: 'bold', whiteSpace: 'nowrap', marginTop: -15 }}>Easy Présence</div>}
    <IconButton
      onClick={() => setSidebarOpen(!isSidebarOpen)}
      style={{
        color: 'white',
        marginTop: -20,
        transition: 'transform 0.3s',
      }}
      onMouseEnter={e => e.currentTarget.style.transform = 'rotate(180deg)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'rotate(0deg)'}
    >
      {isSidebarOpen ? <FaAngleDoubleLeft /> : <FaAngleDoubleRight />}
    </IconButton>
  </div>

  {/* QG List */}
  <ul style={{ listStyle: 'none', padding: 0, marginTop: 10, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
    {qgList.map(qg => (
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
          onMouseEnter={e => e.currentTarget.style.backgroundColor = filterQG === qg ? '#A47580' : 'rgba(255,255,255,0.1)'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = filterQG === qg ? '#9A616D' : 'transparent'}
        >
          <HiOutlineUserCircle style={{ marginRight: isSidebarOpen ? 10 : 0, fontSize: 20 }} />
          {isSidebarOpen && <span style={{ flex: 1, textAlign: 'left' }}>{qg}</span>}
        </Button>
      </li>
    ))}

    {/* Logout */}
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
          transition: 'all 0.3s',
        }}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#A47580'}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = '#9A616D'}
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
    position: 'relative', // pour les boutons flottants
  }}
>
  {/* Table */}
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
          {['Nom', 'Position', 'Numéro', 'QG', 'QR', 'Statut', 'Actions'].map((title) => (
            <TableCell
              key={title}
              style={{ fontWeight: 'bold', padding: '12px 16px', textAlign: 'center',  }}
            >
              {title}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>

      <TableBody>
        {displayContacts
          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
          .map((contact) => (
            <TableRow key={contact._id} style={{ verticalAlign: 'middle' }}>
<TableCell>
  <div
    style={{
      borderRadius: 12,
      fontStyle: 'italic',

      fontWeight: 500,
      textAlign: 'center',
    }}
  >
    {contact.name}
  </div>
</TableCell>
             <TableCell>
  <div
    style={{
      borderRadius: 12,
      minWidth: 60,
      textAlign: 'center',
      fontWeight:500,
      transition: 'transform 0.2s',
      cursor: 'default',
            fontStyle: 'italic',

    }}
  >
    {contact.position}
  </div>
</TableCell>

<TableCell>
  <div
    style={{
      borderRadius: 12,
      fontWeight: 500,
      minWidth: 60,
      textAlign: 'center',
      cursor: 'default',
            fontStyle: 'italic',

    }}
  >
    {contact.number}
  </div>
</TableCell>

<TableCell>
  <div
    style={{
      padding: '6px 12px',
      borderRadius: 12,
      fontWeight: 500,
      fontStyle: 'italic',
      minWidth: 60,
      textAlign: 'center',
      cursor: 'default',
    }}
  >
    {contact.qg}
  </div>
</TableCell>

            <TableCell style={{ textAlign: 'center' }}>
  <div  id={`qr-${contact._id}`}
    style={{
      display: 'inline-block',
      padding: 8,
      borderRadius: 12,
           backgroundColor: '#fff7ed', // orange très clair pour numéro
      color: '#78350f', // orange foncé pour texte
      boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
      transition: 'transform 0.2s, box-shadow 0.2s',
      cursor: 'pointer',
    }}
    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
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
      background: contact.presentToday 
        ? 'linear-gradient(135deg, #34d399, #16a34a)'  // vert dégradé
        : 'linear-gradient(135deg, #f87171, #dc2626)', // rouge dégradé
      boxShadow: contact.presentToday
        ? '0 2px 6px rgba(22, 163, 74, 0.3)'
        : '0 2px 6px rgba(220, 38, 38, 0.3)',
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
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'nowrap',
                    justifyContent: 'center',
                    gap: 6,
                    overflowX: 'auto',
                  }}
                >
                  <Tooltip title="Modifier">
                    <IconButton
                      onClick={() => {
                        setSelectedContact(contact);
                        setNewEntryModalOpen(true);
                      }}
                      size="small"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Supprimer">
                    <IconButton
                      onClick={() => handleDeleteMember(contact._id)}
                      size="small"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Exporter PDF">
                    <IconButton
                      onClick={() => exportQrToPdf(contact)}
                      size="small"
                    >
                      <PictureAsPdfIcon fontSize="small" />
                    </IconButton>

                    
                  </Tooltip>

                  <Tooltip title="Historique">
                    <IconButton
                      onClick={() => {
                        setSelectedContactHistory(contact);
                        setHistoryModalOpen(true);
                      }}
                      size="small"
                    >
                      <HistoryIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip
                    title={contact.presentToday ? 'Marquer Absent' : 'Marquer Présent'}
                  >
                    <IconButton
                      onClick={() => handleTogglePresence(contact._id)}
                      size="small"
                      style={{
                        backgroundColor: contact.presentToday ? '#dc2626' : '#16a34a',
                        color: 'white',
                      }}
                    >
                      {contact.presentToday ? (
                        <CloseIcon fontSize="small" />
                      ) : (
                        <CheckIcon fontSize="small" />
                      )}
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

  {/* Boutons flottants pour mobile uniquement */}
  {window.innerWidth <= 600 && (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        zIndex: 2000,
      }}
    >
      <Tooltip title="Ajouter">
        <IconButton
          onClick={() => setNewEntryModalOpen(true)}
          style={{
            backgroundColor: '#4A2C2A',
            color: 'white',
            width: 56,
            height: 56,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          }}
        >
          <AddIcon />
        </IconButton>
      </Tooltip>

      <Tooltip title="Scanner">
        <IconButton
          onClick={() => setScannerOpen(true)}
          style={{
            backgroundColor: '#9A616D',
            color: 'white',
            width: 56,
            height: 56,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          }}
        >
          <QrCodeScannerIcon />
        </IconButton>
      </Tooltip>
    </div>
  )}

  <style>{`
    @media (max-width: 600px) {
      main {
        margin-top: 5px !important; /* supprime la marge du header sur mobile */
      }
    }
  `}</style>
</main>






      </div>

      <NewEntryModal open={isNewEntryModalOpen} onClose={() => setNewEntryModalOpen(false)} onSave={handleSaveNewEntry} contact={selectedContact} />
      <HistoryModal open={isHistoryModalOpen} onClose={() => setHistoryModalOpen(false)} contact={selectedContactHistory} />
      <QrScannerModal open={isScannerOpen} onClose={() => setScannerOpen(false)} onScanSuccess={handleScanSuccess} />
    </>
  );
};

export default Dashboard;
