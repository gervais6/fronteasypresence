import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import { 
  IconButton, Button, Dialog, DialogTitle, DialogContent, 
  DialogActions, Stack, TextField, Fab 
} from '@mui/material';
import { FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa";
import { HiOutlineUserCircle } from "react-icons/hi";
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { ToastContainer, toast } from 'react-toastify';
import { jsPDF } from "jspdf";
import { Html5Qrcode } from "html5-qrcode";
import 'react-toastify/dist/ReactToastify.css';

// ------------------ Export PDF ------------------
const exportQrToPdf = async (contact) => {
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

// ------------------ Modal ajout / modification ------------------
const NewEntryModal = ({ open, onClose, onSave, contact }) => {
  const today = new Date().toISOString().split('T')[0];
  const [name, setName] = useState(contact ? contact.name : '');
  const [position, setPosition] = useState(contact ? contact.position : '');
  const [number, setNumber] = useState(contact ? contact.number : '');
  const [qg, setQG] = useState(contact ? contact.qg : '');
  const [day, setDay] = useState(contact ? contact.day : today);

  useEffect(() => {
    if (contact) {
      setName(contact.name);
      setPosition(contact.position);
      setNumber(contact.number);
      setQG(contact.qg);
      setDay(contact.day || today);
    } else {
      setName('');
      setPosition('');
      setNumber('');
      setQG('');
      setDay(today);
    }
  }, [contact, today]);

  const handleSave = () => {
    if (!name || !position || !number || !qg) {
      toast.error("Tous les champs sont requis");
      return;
    }
    const newEntry = { 
      name, position, number, qg, day, 
      present: contact?.present || false, 
      lastScan: contact?.lastScan || null, 
      _id: contact?._id 
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

// ------------------ Modal Scanner QR ------------------
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
        html5QrCode.stop().catch(() => { });
        onClose();
      };
      try {
        isScanning = true;
        await html5QrCode.start({ facingMode: { exact: "environment" } }, { fps: 10, qrbox: 250 }, scanCallback);
      } catch {
        isScanning = true;
        await html5QrCode.start({ facingMode: "user" }, { fps: 10, qrbox: 250 }, scanCallback);
      }
    };
    const timeout = setTimeout(startScanner, 300);

    return () => {
      clearTimeout(timeout);
      if (html5QrCode && isScanning) html5QrCode.stop().catch(() => { });
      isScanning = false;
    };
  }, [open, onScanSuccess, onClose]);

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

// ------------------ Dashboard ------------------
const Dashboard = () => {
  const [contacts, setContacts] = useState([]);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isNewEntryModalOpen, setNewEntryModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [isScannerOpen, setScannerOpen] = useState(false);
  const [filterQG, setFilterQG] = useState('Tous');
  const [searchTerm, setSearchTerm] = useState("");
  
  // Historique
  const [isHistoryModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedContactHistory, setSelectedContactHistory] = useState(null);
  const [selectedHistory, setSelectedHistory] = useState([]);

  // --- Récupération de l'historique d'un membre ---
  const fetchHistorique = async (id, contact) => {
    try {
      const res = await axios.get(`https://vlr-21c2.onrender.com/api/membres/historique/${id}`);
      setSelectedHistory(res.data.history || []);
      setSelectedContactHistory(contact);
      setHistoryModalOpen(true);
    } catch (err) {
      toast.error("Erreu lors du chargement de l'historique !");
    }
  };

  // --- Reset présence quotidienne ---
  const resetDailyPresence = () => {
    const today = new Date().toISOString().split('T')[0];
    setContacts(prev =>
      prev.map(c => (c.lastScan !== today ? { ...c, present: false } : c))
    );
  };

  // --- Chargement des membres depuis backend ---
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await axios.get('https://vlr-21c2.onrender.com/api/membres');
        setContacts(res.data);
        resetDailyPresence();
      } catch (err) {
        toast.error("Erreur lors du chargement des membres");
      }
    };
    fetchContacts();
  }, []);

  // --- Sauvegarde ou modification ---
  const handleSaveNewEntry = async (newEntry) => {
    try {
      if (newEntry._id) {
        await axios.put(`https://vlr-21c2.onrender.com/api/membres/${newEntry._id}`, newEntry);
        setContacts(prev => prev.map(c => c._id === newEntry._id ? newEntry : c));
      } else {
        const res = await axios.post('https://vlr-21c2.onrender.com/api/membres', newEntry);
        setContacts(prev => [...prev, res.data]);
      }
      toast.success("Membre ajouté / modifié !");
    } catch { toast.error("Erreur serveur !"); }
  };

  const handleDeleteMember = async (id) => {
    try {
      await axios.delete(`https://vlr-21c2.onrender.com/api/membres/${id}`);
      setContacts(prev => prev.filter(c => c._id !== id));
      toast.success("Membre supprimé !");
    } catch { toast.error("Erreur serveur !"); }
  };

  // --- Scan QR ---
  const handleQrScanSuccess = async (decodedText) => {
    try {
      const data = JSON.parse(decodedText);
      const contactId = data.id;

      const res = await axios.post('https://vlr-21c2.onrender.com/api/scan', { id: contactId });
      setContacts(prev => prev.map(c => c._id === contactId ? res.data : c));

      toast.success("Présence mise à jour !");
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur QR Code !");
    }
  };

  const qgList = ['Tous', ...Array.from(new Set(contacts.map(c => c.qg)))];
  const filteredContacts = (filterQG === 'Tous' ? contacts : contacts.filter(c => c.qg === filterQG))
    .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.position.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <>
      <ToastContainer />
      <div className={`wrapper ${isSidebarOpen ? 'sidebar-open' : ''}`} style={{ borderRadius: 0 }}>
        {/* Header */}
        <header style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px', backgroundColor: '#4A2C2A', color: 'white', gap: 10 }}>
          <h1 style={{ marginRight: 250 }}></h1>
          <div style={{ flex: '1 1 300px', minWidth: 200 }}>
            <TextField placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} variant="outlined" size="small" fullWidth style={{ backgroundColor: 'white', borderRadius: 5 }} />
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button variant="contained" style={{ backgroundColor: '#9A616D', color: 'white' }} onClick={() => { setSelectedContact(null); setNewEntryModalOpen(true); }} startIcon={<AddIcon />}>Nouveau</Button>
            <Button variant="contained" style={{ backgroundColor: '#9A616D', color: 'white' }} onClick={() => setScannerOpen(true)}>Scanner QR</Button>
          </div>
        </header>

        {/* Sidebar */}
        <aside style={{
          position: 'fixed', left: 0, top: 0, height: '100vh',
          width: isSidebarOpen ? 200 : 60,
          transition: 'width 0.3s',
          background: 'linear-gradient(180deg, #4A2C2A, #9A616D)',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          overflowX: 'hidden',
          overflowY: 'auto',
        }}>
          <div style={{ display: 'flex', justifyContent: isSidebarOpen ? 'flex-end' : 'center', padding: 10 }}>
            <IconButton onClick={() => setSidebarOpen(!isSidebarOpen)} style={{ color: 'white' }}>
              {isSidebarOpen ? <FaAngleDoubleLeft /> : <FaAngleDoubleRight />}
            </IconButton>
          </div>
          {isSidebarOpen && <div style={{ padding: '10px 15px', fontSize: 20, fontWeight: 'bold', whiteSpace: 'nowrap' }}>Easy Présence</div>}
          <ul style={{ listStyle: 'none', padding: 0, marginTop: 10, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
            {qgList.map(qg => (
              <li key={qg} style={{ marginBottom: 5 }}>
                <Button onClick={() => setFilterQG(qg)} variant={filterQG === qg ? 'contained' : 'text'} style={{
                  display: 'flex', alignItems: 'center', width: '100%', justifyContent: isSidebarOpen ? 'flex-start' : 'center',
                  padding: '10px 8px', color: 'white', backgroundColor: filterQG === qg ? '#9A616D' : 'transparent',
                  textTransform: 'none', borderRadius: 20, whiteSpace: 'nowrap', overflow: 'hidden'
                }}>
                  <HiOutlineUserCircle style={{ marginRight: isSidebarOpen ? 10 : 0, fontSize: 20 }} />
                  {isSidebarOpen && <span style={{ flex: 1, textAlign: 'left' }}>{qg}</span>}
                </Button>
              </li>
            ))}
            <li style={{ marginTop: 'auto', padding: 10 }}>
              <button style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: isSidebarOpen ? 'flex-start' : 'center', padding: '10px 8px', border: 'none', borderRadius: 20, backgroundColor: '#9A616D', color: 'white', cursor: 'pointer', textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden' }}
                onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('email'); window.location.href = '/login'; }}>
                <HiOutlineUserCircle style={{ marginRight: isSidebarOpen ? 10 : 0, fontSize: 20 }} />
                {isSidebarOpen && <span>Déconnexion</span>}
              </button>
            </li>
          </ul>
        </aside>

        {/* Main Content */}
        <main style={{ marginLeft: isSidebarOpen ? 200 : 60, padding: 20, transition: 'margin-left 0.3s', overflowX: 'auto' }}>
          <Fab onClick={() => { setSelectedContact(null); setNewEntryModalOpen(true); }} style={{ position: 'fixed', bottom: 20, right: 20 }} color="primary">
            <AddIcon />
          </Fab>

          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
            <thead>
              <tr>
                <th>Nom</th><th>Position</th><th>Numéro</th><th>QG</th><th>Date</th><th>Statut</th><th>QR Code</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredContacts.map(contact => (
                <tr key={contact._id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td>{contact.name}</td>
                  <td>{contact.position}</td>
                  <td>{contact.number}</td>
                  <td>{contact.qg}</td>
                  <td>{contact.day || "-"}</td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '4px 10px', borderRadius: 12, color: 'white', fontWeight: 'bold', fontSize: 12, backgroundColor: contact.present ? '#16a34a' : '#dc2626', minWidth: 70, gap: 5 }}>
                      {contact.present ? '✅ Présent' : '❌ Absent'}
                    </span>
                  </td>
                  <td><div id={`qr-${contact._id}`}><QRCodeSVG value={JSON.stringify({ id: contact._id, name: contact.name })} size={70} /></div></td>
                  <td>
                    <IconButton onClick={() => { setSelectedContact(contact); setNewEntryModalOpen(true); }}><EditIcon /></IconButton>
                    <IconButton onClick={() => handleDeleteMember(contact._id)}><DeleteIcon /></IconButton>
                    <IconButton onClick={() => exportQrToPdf(contact)}><PictureAsPdfIcon /></IconButton>
                    <IconButton onClick={() => fetchHistorique(contact._id, contact)} title="Historique">📜</IconButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </main>

        {/* Modal Historique */}
        <Dialog
          open={isHistoryModalOpen}
          onClose={() => setHistoryModalOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Historique: {selectedContactHistory?.name}</DialogTitle>
          <DialogContent dividers>
            {selectedHistory.length === 0 ? (
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
                  {selectedHistory.map((entry, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
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
            <Button onClick={() => setHistoryModalOpen(false)}>Fermer</Button>
          </DialogActions>
        </Dialog>
      </div>

      {/* Modals */}
      <NewEntryModal open={isNewEntryModalOpen} onClose={() => setNewEntryModalOpen(false)} onSave={handleSaveNewEntry} contact={selectedContact} />
      <QrScannerModal open={isScannerOpen} onClose={() => setScannerOpen(false)} onScanSuccess={handleQrScanSuccess} />
    </>
  );
};

export default Dashboard;
