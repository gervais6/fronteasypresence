import { QRCodeSVG } from "qrcode.react";

const CompanyQr = () => {
  const companyQrValue = "COMPANY_12345"; // ID unique de l’entreprise
  return (
    <div style={{ textAlign: 'center', margin: '20px 0' }}>
      <h3>QR Code de l’entreprise</h3>
      <QRCodeSVG value={companyQrValue} size={150} />
    </div>
  );
};

export default CompanyQr;
