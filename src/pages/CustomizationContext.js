import React, { createContext, useState } from "react";

export const CustomizationContext = createContext();

export const CustomizationProvider = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePanel, setActivePanel] = useState(null);
  const [customTitle, setCustomTitle] = useState("Mon titre");
  const [titleColor, setTitleColor] = useState("#9A616D");
  const [titleFont, setTitleFont] = useState("Arial");
  const [titleSize, setTitleSize] = useState(20);
  const [customLogo, setCustomLogo] = useState(null);
  const [logoPosition, setLogoPosition] = useState("left");
  const [logoSize, setLogoSize] = useState(80);
  const [formBgColor, setFormBgColor] = useState("#ffffff");
  const [buttonColor, setButtonColor] = useState("#9A616D");
  const [pageBg, setPageBg] = useState("#f5f5f5");
  const [pageBgImage, setPageBgImage] = useState(null);
  const [bgImageSize, setBgImageSize] = useState(100);
  const [globalFont, setGlobalFont] = useState("Arial");
  const [boxShadow, setBoxShadow] = useState(4);
  const [borderRadiusGlobal, setBorderRadiusGlobal] = useState(3);

  const togglePanel = (panelName) => {
    setActivePanel(activePanel === panelName ? null : panelName);
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setCustomLogo(imageUrl);
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
        setCustomLogo,        // ✅ ajout pour pouvoir supprimer le logo
        handleLogoChange,
        logoPosition,
        setLogoPosition,
        logoSize,
        setLogoSize,
        formBgColor,
        setFormBgColor,
        buttonColor,
        setButtonColor,
        pageBg,
        setPageBg,
        pageBgImage,
        setPageBgImage,
        bgImageSize,
        setBgImageSize,
        globalFont,
        setGlobalFont,
        boxShadow,
        setBoxShadow,
        borderRadiusGlobal,
        setBorderRadiusGlobal,
      }}
    >
      {children}
    </CustomizationContext.Provider>
  );
};
