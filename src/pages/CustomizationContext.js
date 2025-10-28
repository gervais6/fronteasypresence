import React, { createContext, useState } from "react";

export const CustomizationContext = createContext();

export const CustomizationProvider = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activePanel, setActivePanel] = useState(null);

  const [customTitle, setCustomTitle] = useState("Mon titre");
  const [titleColor, setTitleColor] = useState("#9A616D");
  const [titleFont, setTitleFont] = useState("Arial");
  const [titleSize, setTitleSize] = useState(24);

  const [customLogo, setCustomLogo] = useState(null);
  const [logoPosition, setLogoPosition] = useState("left");
  const [logoSize, setLogoSize] = useState(80);

  const [formBgColor, setFormBgColor] = useState("#fff");
  const [buttonColor, setButtonColor] = useState("#9A616D");

  // Fonction toggle pour ouvrir/fermer un panel
  const togglePanel = (panel) => {
    setActivePanel((prev) => (prev === panel ? null : panel));
  };

  // Fonction pour changer le logo
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCustomLogo(URL.createObjectURL(file));
    }
  };

  return (
    <CustomizationContext.Provider
      value={{
        sidebarOpen,
        setSidebarOpen,
        activePanel,
        togglePanel,
        customTitle,
        setCustomTitle,
        titleColor,
        setTitleColor,
        titleFont,
        setTitleFont,
        titleSize,
        setTitleSize,
        customLogo,
        setCustomLogo,
        logoPosition,
        setLogoPosition,
        logoSize,
        setLogoSize,
        formBgColor,
        setFormBgColor,
        buttonColor,
        setButtonColor,
        handleLogoChange,
      }}
    >
      {children}
    </CustomizationContext.Provider>
  );
};
