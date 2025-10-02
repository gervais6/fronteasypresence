import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import { Html5Qrcode } from "html5-qrcode";
import { toast } from "react-toastify";
import axios from "axios";

const ScanEntreprise = () => {
  const qrCodeRegionId = "html5qr-code-full-region";
  const html5QrCodeRef = useRef(null);
  const isScanningRef = useRef(false);
  const [scannerOpen, setScannerOpen] = useState(false);

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
      console.log("QR Code scanné :", scannedData);

      const userId = localStorage.getItem("userId"); // utilisateur qui scanne
      if (!userId) {
        toast.error("Veuillez vous connecter.");
        return;
      }

      const response = await axios.post(
        "http://localhost:8000/api/scan/scan-company",
        { userId, qrCodeEntreprise: scannedData }
      );

      toast.success(response.data.message || "Présence enregistrée !");
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.message || "Erreur lors de la validation du QR code";
      toast.error(errorMsg);
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
