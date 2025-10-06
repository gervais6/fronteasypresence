import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from "@mui/material";
import { Html5Qrcode } from "html5-qrcode";
import { toast } from "react-toastify";
import axios from "axios";

const ScanEntreprise = () => {
  const qrCodeRegionId = "html5qr-code-full-region";
  const html5QrCodeRef = useRef(null);
  const isScanningRef = useRef(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanStatus, setScanStatus] = useState(null); // pour afficher le résultat

  const openScanner = () => setScannerOpen(true);
  const closeScanner = () => setScannerOpen(false);

  useEffect(() => {
    if (!scannerOpen) return;

    const startScanner = async () => {
      const qrElement = document.getElementById(qrCodeRegionId);
      if (!qrElement) return;

      html5QrCodeRef.current = new Html5Qrcode(qrCodeRegionId);

      const scanCallback = async (decodedText) => {
        if (!isScanningRef.current) return;
        isScanningRef.current = false;

        if (!decodedText.startsWith("company_")) {
          const msg = "QR code invalide pour l'entreprise.";
          setScanStatus({ success: false, message: msg });
          toast.error(msg);
          html5QrCodeRef.current.stop().catch(() => {});
          closeScanner();
          return;
        }

        await handleScanSuccess(decodedText);
        html5QrCodeRef.current.stop().catch(() => {});
        closeScanner();
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
          const msg = "Impossible d'accéder à la caméra.";
          toast.error(msg);
          setScanStatus({ success: false, message: msg });
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
  }, [scannerOpen]);

  // Fonction qui appelle l'API backend pour enregistrer la présence
  const handleScanSuccess = async (scannedData) => {
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      if (!token || !userId) {
        const msg = "Veuillez vous reconnecter.";
        setScanStatus({ success: false, message: msg });
        toast.error(msg);
        return;
      }

      const response = await axios.post(
        "https://backendeasypresence.onrender.com/api/scan/scan-company",
        { userId, qrCodeEntreprise: scannedData },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const msg = response.data.message || "Présence enregistrée !";
      setScanStatus({ success: true, message: msg });
      toast.success(msg);

    } catch (err) {
      const errorMsg = err.response?.data?.message || "Erreur lors de la validation du QR code";
      setScanStatus({ success: false, message: errorMsg });
      toast.error(errorMsg);
      console.error(err);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: 50 }}>
      <h2>Scanner le QR code de l'entreprise</h2>
      <Button
        variant="contained"
        style={{ backgroundColor: "#9A616D", color: "white", marginBottom: 20 }}
        onClick={openScanner}
      >
        Ouvrir le scanner
      </Button>

      {scanStatus && (
        <Typography
          variant="subtitle1"
          style={{ color: scanStatus.success ? "green" : "red", marginBottom: 20 }}
        >
          {scanStatus.message}
        </Typography>
      )}

      <Dialog open={scannerOpen} onClose={closeScanner} maxWidth="sm" fullWidth>
        <DialogTitle>Scanner QR Code</DialogTitle>
        <DialogContent>
          <div id={qrCodeRegionId} style={{ width: "100%", height: 400 }}></div>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeScanner}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ScanEntreprise;
