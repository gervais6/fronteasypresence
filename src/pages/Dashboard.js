import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import SearchIcon from '@mui/icons-material/Search';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  TablePagination,  Tooltip
} from '@mui/material';

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
            position: 'fixed',
            top: 0,
            left: isSidebarOpen ? 220 : 70,
            right: 0,
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 20px',
            backgroundColor: '#ffffff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            transition: 'left 0.3s',
          }}>
            {/* Recherche */}
            <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 200 }}>
              <SearchIcon style={{ marginRight: 8, color: '#9e9e9e' }} />
              <TextField
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                variant="outlined"
                size="small"
                style={{
                  flex: 1,
                  backgroundColor: '#f5f5f5',
                  borderRadius: 25,
                  padding: '0 10px',
                }}
              />
            </div>
         <div style={{ display: 'flex', gap: 10, marginLeft: 15 }}>
  <Button
    variant="contained"
    onClick={() => setNewEntryModalOpen(true)}
    style={{
     background: 'linear-gradient(180deg, #4A2C2A, #9A616D)',
      color: 'white',
      borderRadius: 20,
      padding: '6px 16px',
      textTransform: 'none'
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
      textTransform: 'none'
    }}
  >
    Scanner
  </Button>
</div>

          </header>

   
        {/* Sidebar */}
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: 10, gap: 10,marginBottom:40 }}>
            {isSidebarOpen && <div style={{ fontSize: 22, fontWeight: 'bold', whiteSpace: 'nowrap',marginTop:-15 }}>Easy Présence</div>}
            <IconButton onClick={() => setSidebarOpen(!isSidebarOpen)} style={{ color: 'white',marginTop:-15 }}>
              {isSidebarOpen ? <FaAngleDoubleLeft /> : <FaAngleDoubleRight />}
            </IconButton>
          </div>

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
                >
                  <HiOutlineUserCircle style={{ marginRight: isSidebarOpen ? 10 : 0, fontSize: 20 }} />
                  {isSidebarOpen && <span style={{ flex: 1, textAlign: 'left' }}>{qg}</span>}
                </Button>
              </li>
            ))}
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
                  boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                  transition: 'all 0.3s',
                }}
              >
                <ExitToAppIcon style={{ fontSize: 22, marginRight: 5 }} />
                {isSidebarOpen && <span>Déconnexion</span>}
              </Button>
            </li>
          </ul>
        </aside>

        {/* Main */}
{/* Main */}
<main style={{
  marginLeft: isSidebarOpen ? 220 : 70,
  padding: 20,
  transition: 'margin-left 0.3s ease',
  marginTop: 80,  // espace avec le header fixe
  minHeight: '100vh',
  display: 'flex',
  justifyContent: 'center',
}}>

  <TableContainer component={Paper} style={{
    width: '100%',
    maxWidth: '100%',
    overflowX: 'auto',
    borderRadius: 12,
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  }}>
    <Table stickyHeader size="medium">
      <TableHead>
        <TableRow style={{ backgroundColor: '#f3f4f6' }}>
          {['Nom', 'Position', 'Numéro', 'QG', 'QR', 'Statut', 'Actions'].map(title => (
            <TableCell key={title} style={{ fontWeight: 'bold', padding: '12px 16px', textAlign: 'center' }}>
              {title}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>

      <TableBody>
        {displayContacts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
          .map(contact => (
            <TableRow key={contact._id} style={{ verticalAlign: 'middle' }}>
              <TableCell style={{ padding: '10px 16px' }}>{contact.name}</TableCell>
              <TableCell style={{ padding: '10px 16px' }}>{contact.position}</TableCell>
              <TableCell style={{ padding: '10px 16px' }}>{contact.number}</TableCell>
              <TableCell style={{ padding: '10px 16px', fontStyle: 'italic' }}>{contact.qg}</TableCell>

              {/* QR Code avec div pour PDF */}
              <TableCell style={{ padding: '10px', textAlign: 'center' }}>
                <div id={`qr-${contact._id}`}>
                  <QRCodeSVG value={contact._id} size={50} />
                </div>
              </TableCell>

              <TableCell style={{
                padding: '10px 16px',
                color: contact.presentToday ? '#16a34a' : '#dc2626',
                fontWeight: 'bold',
                textAlign: 'center'
              }}>
                {contact.presentToday ? 'Présent' : 'Absent'}
              </TableCell>

              <TableCell style={{ padding: '10px 16px' }}>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  gap: 4,
                  alignItems: 'center'
                }}>
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

                  <Tooltip title={contact.presentToday ? "Marquer Absent" : "Marquer Présent"}>
                    <IconButton
                      onClick={() => handleTogglePresence(contact._id)}
                      size="small"
                      style={{
                        backgroundColor: contact.presentToday ? "#dc2626" : "#16a34a",
                        color: "white",
                      }}
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
      onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
      size="small"
    />
  </TableContainer>
</main>



      </div>

      <NewEntryModal open={isNewEntryModalOpen} onClose={() => setNewEntryModalOpen(false)} onSave={handleSaveNewEntry} contact={selectedContact} />
      <HistoryModal open={isHistoryModalOpen} onClose={() => setHistoryModalOpen(false)} contact={selectedContactHistory} />
      <QrScannerModal open={isScannerOpen} onClose={() => setScannerOpen(false)} onScanSuccess={handleScanSuccess} />
    </>
  );
};

export default Dashboard;
