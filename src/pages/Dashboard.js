import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
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
const API_URL = 'https://backendeasypresence.onrender.com/api/membres';
const savePendingAction = (action) => {
  const pending = JSON.parse(localStorage.getItem("pendingActions") || "[]");
  pending.push(action);
  localStorage.setItem("pendingActions", JSON.stringify(pending));
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
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{contact ? "Modifier membre" : "Ajouter membre"}</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <TextField label="Nom" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
          <TextField label="Position" value={position} onChange={(e) => setPosition(e.target.value)} fullWidth />
          <TextField label="Numéro" value={number} onChange={(e) => setNumber(e.target.value)} fullWidth />
          <TextField label="QG" value={qg} onChange={(e) => setQG(e.target.value)} fullWidth />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button onClick={handleSave}>Enregistrer</Button>
      </DialogActions>
    </Dialog>
  );
};

// Modal Historique
const HistoryModal = ({ open, onClose, contact }) => {
  if (!contact) return null;
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Historique: {contact.name}</DialogTitle>
      <DialogContent dividers>
        {(!contact.history || contact.history.length === 0) ? (
          <p>Aucun historique pour ce membre.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {contact.history.map((entry, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #ddd' }}>
                  <td>{entry.date}</td>
                  <td style={{ color: entry.present ? '#16a34a' : '#dc2626', fontWeight: 'bold' }}>
                    {entry.present ? '✅ Présent' : '❌ Absent'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fermer</Button>
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
        html5QrCode.stop().catch(() => {});
        onClose();
      };

      try {
        isScanning = true;
        await html5QrCode.start(
          { facingMode: { exact: "environment" } }, 
          { fps: 10, qrbox: 250 }, 
          scanCallback
        );
      } catch {
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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Scanner QR Code</DialogTitle>
      <DialogContent>
        <div id={qrCodeRegionId} style={{ width: '100%', height: 400 }}></div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fermer</Button>
      </DialogActions>
    </Dialog>
  );
};

// Dashboard
const Dashboard = () => {
  const [contacts, setContacts] = useState([]);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isNewEntryModalOpen, setNewEntryModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [isHistoryModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedContactHistory, setSelectedContactHistory] = useState(null);
  const [filterQG, setFilterQG] = useState('Tous');
  const [searchTerm, setSearchTerm] = useState("");
  const [isScannerOpen, setScannerOpen] = useState(false);

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
  const member = contacts.find(c => c._id === memberId);

  if (!member) return;

  const todayEntry = member.history?.find(h => h.date === today);

  if (todayEntry?.present) {
    // Toast pour signaler que la personne est déjà présente
    toast.info(`${member.name} est déjà présent aujourd'hui !`);
    // Vibration courte pour retour d'information
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    return; // on ne modifie rien
  }

  // Sinon, on marque comme présent
  const updatedHistory = todayEntry
    ? member.history.map(h => h.date === today ? { ...h, present: true } : h)
    : [...(member.history || []), { date: today, present: true }];

  const updatedContacts = contacts.map(c => 
    c._id === memberId ? { ...c, history: updatedHistory } : c
  );

  setContacts(updatedContacts);
  localStorage.setItem("contacts", JSON.stringify(updatedContacts));

  // Toast succès et vibration
  toast.success(`Présence enregistrée pour ${member.name}`);
  if (navigator.vibrate) navigator.vibrate(200);

  const updatedMember = updatedContacts.find(c => c._id === memberId);
  if (navigator.onLine) {
    axios.put(`${API_URL}/${memberId}`, updatedMember)
      .catch(() => savePendingAction({ type: "update", data: updatedMember }));
  } else {
    savePendingAction({ type: "update", data: updatedMember });
  }
};




  const qgList = ['Tous', ...Array.from(new Set(contacts.map(c => c.qg)))];

  // Filtrer + calcul presentToday
  const displayContacts = (filterQG === 'Tous' ? contacts : contacts.filter(c => c.qg === filterQG))
    .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.position.toLowerCase().includes(searchTerm.toLowerCase()))
    .map(c => {
      const todayEntry = c.history?.find(h => h.date === today);
      return { ...c, presentToday: todayEntry ? todayEntry.present : false };
    });

  return (
    <>
      <ToastContainer />
      <div className={`wrapper ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        {/* Header */}
   <header style={{
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '15px 25px',
  backgroundColor: '#4A2C2A',
  color: 'white',
  gap: 10,
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  
  flexWrap: 'wrap',
}}>

  {/* Bouton Déconnexion à gauche */}


  {/* Barre de recherche centrée */}
  <div style={{
    flex: '0 1 600px',
    minWidth: 150,
    margin: '0 15px',
  }}>
    <TextField
      placeholder="Rechercher..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      variant="outlined"
      size="small"
      fullWidth
      style={{
        width: '100%',
        backgroundColor: '#ffffff',
        borderRadius: 30,
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
      }}
    />
  </div>

  {/* Bouton Scanner à droite */}
  <Button
    variant="contained"
    onClick={() => setScannerOpen(true)}
    style={{
      backgroundColor: '#9A616D',
      color: 'white',
      padding: '8px 20px',
      borderRadius: 25,
      textTransform: 'none',
      fontWeight: 500,
      flexShrink: 0,
      transition: 'all 0.3s ease',
    }}
    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#b07f8c'}
    onMouseLeave={e => e.currentTarget.style.backgroundColor = '#9A616D'}
  >
    Scanner QR
  </Button>

</header>


     <aside style={{
      position: 'fixed',
      left: 0,
      top: 0,
      height: '100vh',
      width: isSidebarOpen ? 220 : 60,
      transition: 'width 0.3s',
      background: 'linear-gradient(180deg, #4A2C2A, #9A616D)',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      overflowX: 'hidden',
      overflowY: 'auto',
      paddingTop: 10,
    }}>

      {/* Toggle Sidebar */}
      <div style={{ display: 'flex', justifyContent: isSidebarOpen ? 'flex-end' : 'center', padding: 10 }}>
        <IconButton onClick={() => setSidebarOpen(!isSidebarOpen)} style={{ color: 'white' }}>
          {isSidebarOpen ? <FaAngleDoubleLeft /> : <FaAngleDoubleRight />}
        </IconButton>
      </div>

      {/* Logo / Nom */}
      {isSidebarOpen && (
        <div style={{ padding: '10px 15px', fontSize: 22, fontWeight: 'bold', whiteSpace: 'nowrap' }}>
          Easy Présence
        </div>
      )}

      {/* Liste des QG */}
      <ul style={{ listStyle: 'none', padding: 0, marginTop: 10, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        {qgList.map(qg => (
          <li key={qg} style={{ marginBottom: 5 }}>
            <Button
              onClick={() => setFilterQG(qg)}
              variant={filterQG === qg ? 'contained' : 'text'}
              style={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                justifyContent: isSidebarOpen ? 'flex-start' : 'center',
                padding: '10px 12px',
                color: 'white',
                backgroundColor: filterQG === qg ? '#9A616D' : 'transparent',
                textTransform: 'none',
                borderRadius: 20,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                transition: 'all 0.3s',
              }}
              onMouseEnter={e => { if (!filterQG === qg) e.currentTarget.style.backgroundColor = '#7b4f59'; }}
              onMouseLeave={e => { if (!filterQG === qg) e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <HiOutlineUserCircle style={{ marginRight: isSidebarOpen ? 10 : 0, fontSize: 20 }} />
              {isSidebarOpen && <span style={{ flex: 1, textAlign: 'left' }}>{qg}</span>}
            </Button>
          </li>
        ))}

        {/* Bouton Ajouter Membre */}
        <li style={{ marginTop: 'auto', padding: 12, display: 'flex', justifyContent: 'center' }}>
          <Fab
            color="primary"
            aria-label="add"
            size={isSidebarOpen ? "medium" : "small"}
            onClick={() => setNewEntryModalOpen(true)}
          >
            <AddIcon />
          </Fab>
        </li>

       
      </ul>
    </aside>

        {/* Main */}
{/* Main */}
<main style={{
  marginLeft: isSidebarOpen ? 220 : 70, // largeur sidebar + un petit padding
  padding: 20,
  transition: 'margin-left 0.3s ease',
  minHeight: '100vh', // pour que le main occupe toute la hauteur
  backgroundColor: '#f9f9f9', // contraste avec sidebar
}}>
  <h1 style={{ marginBottom: 20 }}>Liste des Membres</h1>
  <div style={{ overflowX: 'auto' }}>
    <table style={{
      width: '100%',
      borderCollapse: 'separate',
      borderSpacing: '0 10px',
      minWidth: 900,
    }}>
      <thead>
        <tr>
          {['Nom', 'Position', 'Numéro', 'QG', 'QR Code', 'Statut', 'Actions'].map((title) => (
            <th key={title} style={{
              textAlign: 'left',
              padding: '10px 15px',
              backgroundColor: '#f3f4f6',
              borderRadius: title === 'Nom' ? '8px 0 0 8px' : title === 'Actions' ? '0 8px 8px 0' : '0',
              fontWeight: 600
            }}>{title}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {displayContacts.map(contact => (
          <tr key={contact._id} style={{
            backgroundColor: '#ffffff',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
            borderRadius: 8,
            marginBottom: 10,
          }}>
            <td style={{ padding: '10px 15px' }}>{contact.name}</td>
            <td style={{ padding: '10px 15px' }}>{contact.position}</td>
            <td style={{ padding: '10px 15px' }}>{contact.number}</td>
            <td style={{ padding: '10px 15px', fontStyle: 'italic' }}>{contact.qg}</td>
            <td style={{ padding: '10px', textAlign: 'center' }}>
              {/* ID unique ajouté pour PDF */}
              <div id={`qr-${contact._id}`}>
                <QRCodeSVG value={contact._id} size={64} />
              </div>
            </td>
            <td style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold', color: contact.presentToday ? '#16a34a' : '#dc2626' }}>
              {contact.presentToday ? 'Présent' : 'Absent'}
            </td>
            <td style={{ padding: '10px', display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
              <IconButton onClick={() => { setSelectedContact(contact); setNewEntryModalOpen(true); }} title="Modifier">
                <EditIcon />
              </IconButton>
              <IconButton onClick={() => handleDeleteMember(contact._id)} title="Supprimer">
                <DeleteIcon />
              </IconButton>
              {/* Bouton Export PDF */}
              <IconButton onClick={() => exportQrToPdf(contact)} title="Exporter PDF">
                <PictureAsPdfIcon />
              </IconButton>
              <IconButton onClick={() => { setSelectedContactHistory(contact); setHistoryModalOpen(true); }} title="Historique">
                <HistoryIcon />
              </IconButton>
              <IconButton
                onClick={() => handleTogglePresence(contact._id)}
                title={contact.presentToday ? "Marquer Absent" : "Marquer Présent"}
                style={{
                  backgroundColor: contact.presentToday ? "#dc2626" : "#16a34a",
                  color: "white"
                }}
              >
                {contact.presentToday ? <CloseIcon /> : <CheckIcon />}
              </IconButton>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</main>

      </div>

      <NewEntryModal open={isNewEntryModalOpen} onClose={() => setNewEntryModalOpen(false)} onSave={handleSaveNewEntry} contact={selectedContact} />
      <HistoryModal open={isHistoryModalOpen} onClose={() => setHistoryModalOpen(false)} contact={selectedContactHistory} />
      <QrScannerModal open={isScannerOpen} onClose={() => setScannerOpen(false)} onScanSuccess={handleScanSuccess} />
    </>
  );
};

export default Dashboard;
