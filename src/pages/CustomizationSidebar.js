import React, { useContext } from "react";
import { Box, Stack, IconButton, Typography, TextField } from "@mui/material";
import { Menu, ChevronLeft, Title, Image, ColorLens, Wallpaper, Brush } from "@mui/icons-material";
import { CustomizationContext } from "./CustomizationContext";

const CustomizationSidebar = () => {
  const {
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
  } = useContext(CustomizationContext);

  return (
    <>
      {/* Sidebar principal */}
      <Box
        sx={{
          width: sidebarOpen ? 80 : 60,
          bgcolor: "#fff",
          boxShadow: 3,
          display: "flex",
          flexDirection: "column",
          transition: "width 0.3s",
          alignItems: "center",
          py: 2,
        }}
      >
        <IconButton onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <ChevronLeft /> : <Menu />}
        </IconButton>

        <Stack spacing={2} mt={4}>
          {[
            { name: "title", icon: <Title /> },
            { name: "logo", icon: <Image /> },
            { name: "colors", icon: <ColorLens /> },
            { name: "background", icon: <Wallpaper /> },
            { name: "buttons", icon: <Brush /> },
            { name: "global", icon: <Brush /> },
          ].map((item) => (
            <IconButton
              key={item.name}
              color={activePanel === item.name ? "primary" : "default"}
              onClick={() => togglePanel(item.name)}
              sx={{
                width: "100%",
                bgcolor: activePanel === item.name ? `${buttonColor}33` : "transparent",
                "&:hover": { bgcolor: `${buttonColor}22` },
              }}
            >
              {item.icon}
            </IconButton>
          ))}
        </Stack>
      </Box>

      {/* Sous-sidebar */}
      {activePanel && (
        <Box
          sx={{
            width: 280,
            bgcolor: "#fff",
            color: "#000",
            boxShadow: 4,
            p: 3,
            borderRadius: 1,
            transition: "0.3s",
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          {/* Titre du panel */}
          <Typography
            variant="h6"
            mb={2}
            sx={{
              fontWeight: "bold",
              borderBottom: `2px solid #9A616D`,
              pb: 1,
              textTransform: "uppercase",
              color: "#9A616D",
            }}
          >
            {activePanel === "title"
              ? "Titre"
              : activePanel === "logo"
              ? "Logo"
              : activePanel === "colors"
              ? "Couleurs"
              : activePanel === "background"
              ? "Fond"
              : activePanel === "buttons"
              ? "Boutons"
              : "Styles globaux"}
          </Typography>

          {/* Panel "Title" */}
          {activePanel === "title" && (
            <Stack spacing={2}>
              <Typography fontWeight="bold" sx={{ color: "#9A616D" }}>Titre :</Typography>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": { color: "#9A616D", borderRadius: 2 },
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#ccc" },
                  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#9A616D" },
                }}
              />

              <Typography fontWeight="bold" sx={{ color: "#9A616D" }}>Couleur :</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {["#9A616D","#3f51b5","#4caf50","#ff9800","#f44336","#9c27b0","#00bcd4","#795548"].map((color) => (
                  <Box
                    key={color}
                    onClick={() => setTitleColor(color)}
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      bgcolor: color,
                      cursor: "pointer",
                      border: titleColor === color ? "3px solid black" : "2px solid #ccc",
                      transition: "transform 0.2s",
                      "&:hover": { transform: "scale(1.2)" },
                    }}
                  />
                ))}
              </Stack>

              <Typography fontWeight="bold" sx={{ color: "#9A616D" }}>Couleur personnalisée :</Typography>
              <Box sx={{ width: 40, height: 40, borderRadius: "50%", overflow: "hidden", border: "2px solid #ccc" }}>
                <input
                  type="color"
                  value={titleColor}
                  onChange={(e) => setTitleColor(e.target.value)}
                  style={{ width: "100%", height: "100%", border: "none", padding: 0, cursor: "pointer" }}
                />
              </Box>

              <Typography fontWeight="bold" sx={{ color: "#9A616D" }}>Taille :</Typography>
              <input
                type="range"
                min={12}
                max={48}
                value={titleSize}
                onChange={(e) => setTitleSize(Number(e.target.value))}
                style={{ width: "100%", accentColor: "#9A616D", cursor: "pointer" }}
              />

              <Typography fontWeight="bold" sx={{ color: "#9A616D" }}>Police :</Typography>
              <Stack direction="row" spacing={2} flexWrap="wrap">
                {["Arial","Verdana","Tahoma","Georgia"].map((font) => (
                  <Typography
                    key={font}
                    sx={{
                      fontFamily: font,
                      color: titleFont === font ? "#9A616D" : "#000",
                      fontWeight: titleFont === font ? "bold" : "normal",
                      cursor: "pointer",
                    }}
                    onClick={() => setTitleFont(font)}
                  >
                    Aa
                  </Typography>
                ))}
              </Stack>
            </Stack>
          )}

          {/* Panel "Logo" */}
          {activePanel === "logo" && (
            <Stack spacing={2}>
              <Typography fontWeight="bold" sx={{ color: "#9A616D" }}>Logo :</Typography>
              <Box
                sx={{
                  width: "100%",
                  height: 80,
                  border: "1px dashed #ccc",
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  overflow: "hidden",
                }}
                onClick={() => document.getElementById("logoInput").click()}
              >
                {customLogo ? (
                  <Box component="img" src={customLogo} sx={{ width: "100%", height: "100%", objectFit: "contain" }} />
                ) : (
                  "Cliquer pour choisir un logo"
                )}
              </Box>
              <input type="file" id="logoInput" hidden accept="image/*" onChange={handleLogoChange} />

              <Typography fontWeight="bold" sx={{ color: "#9A616D" }}>Position :</Typography>
              <Stack direction="row" spacing={1} justifyContent="center">
                {["left","right","top","bottom"].map((pos) => (
                  <IconButton
                    key={pos}
                    color={logoPosition === pos ? "primary" : "default"}
                    onClick={() => setLogoPosition(pos)}
                    sx={{ width: 50, height: 50, border: "1px solid #ccc" }}
                  >
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        display: "flex",
                        alignItems: pos.includes("top") ? "flex-start" : pos.includes("bottom") ? "flex-end" : "center",
                        justifyContent: pos.includes("left") ? "flex-start" : pos.includes("right") ? "flex-end" : "center",
                      }}
                    >
                      <Box sx={{ width: 12, height: 12, bgcolor: "#9A616D", borderRadius: "50%" }} />
                    </Box>
                  </IconButton>
                ))}
              </Stack>

              <Typography fontWeight="bold" sx={{ color: "#9A616D" }}>Taille :</Typography>
              <input
                type="range"
                min={20}
                max={150}
                value={logoSize}
                onChange={(e) => setLogoSize(Number(e.target.value))}
                style={{ width: "100%", accentColor: "#9A616D", cursor: "pointer" }}
              />
            </Stack>
          )}

          {/* Panel "Colors" */}
          {activePanel === "colors" && (
            <Stack spacing={2}>
              <Typography fontWeight="bold" sx={{ color: "#9A616D" }}>Couleur des boutons :</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {["#7e4a53","#3f51b5","#4caf50","#ff9800","#f44336","#9c27b0","#00bcd4","#795548"].map((color) => (
                  <Box
                    key={color}
                    onClick={() => setButtonColor(color)}
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      bgcolor: color,
                      cursor: "pointer",
                      border: buttonColor === color ? "3px solid black" : "2px solid #ccc",
                      transition: "transform 0.2s",
                      "&:hover": { transform: "scale(1.2)" },
                    }}
                  />
                ))}
              </Stack>

              <Typography fontWeight="bold" sx={{ color: "#9A616D" }}>Couleur personnalisée :</Typography>
              <Box sx={{ width: 40, height: 40, borderRadius: "50%", overflow: "hidden", border: "2px solid #ccc" }}>
                <input
                  type="color"
                  value={buttonColor}
                  onChange={(e) => setButtonColor(e.target.value)}
                  style={{ width: "100%", height: "100%", border: "none", padding: 0, cursor: "pointer" }}
                />
              </Box>
            </Stack>
          )}

          {/* Panel "Background" */}
          {activePanel === "background" && (
            <Stack spacing={2}>
              <Typography fontWeight="bold" sx={{ color: "#9A616D" }}>Fond du formulaire :</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {["#ffffff","#f5f5f5","#fce4ec","#e3f2fd","#e8f5e9","#fff3e0","#ffebee","#f3e5f5"].map((color) => (
                  <Box
                    key={color}
                    onClick={() => setFormBgColor(color)}
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      bgcolor: color,
                      cursor: "pointer",
                      border: formBgColor === color ? "3px solid #9A616D" : "2px solid #ccc",
                      transition: "transform 0.2s",
                      "&:hover": { transform: "scale(1.2)" },
                    }}
                  />
                ))}
              </Stack>
              <Box sx={{ width: 40, height: 40, borderRadius: "50%", overflow: "hidden", border: "2px solid #ccc", mt: 1 }}>
                <input
                  type="color"
                  value={formBgColor}
                  onChange={(e) => setFormBgColor(e.target.value)}
                  style={{ width: "100%", height: "100%", border: "none", padding: 0, cursor: "pointer" }}
                />
              </Box>

              <Typography fontWeight="bold" sx={{ color: "#9A616D" }}>Image de fond :</Typography>
              <Box
                sx={{
                  width: "100%",
                  height: 150,
                  border: "1px dashed #ccc",
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  overflow: "hidden",
                  backgroundColor: pageBg,
                }}
                onClick={() => document.getElementById("bgImageInput").click()}
              >
                {pageBgImage ? (
                  <Box
                    component="img"
                    src={pageBgImage}
                    sx={{
                      width: bgImageSize + "%",
                      height: bgImageSize + "%",
                      objectFit: "cover",
                      transition: "0.3s",
                    }}
                  />
                ) : (
                  "Cliquer pour choisir une image"
                )}
              </Box>
              <input
                type="file"
                id="bgImageInput"
                hidden
                accept="image/*"
                onChange={(e) => setPageBgImage(URL.createObjectURL(e.target.files[0]))}
              />

              <Typography fontWeight="bold" sx={{ color: "#9A616D" }}>Taille de l'image :</Typography>
              <input
                type="range"
                min={50}
                max={200}
                value={bgImageSize}
                onChange={(e) => setBgImageSize(Number(e.target.value))}
                style={{ width: "100%", accentColor: "#9A616D", cursor: "pointer" }}
              />
            </Stack>
          )}

          {/* Panel "Buttons" */}
          {activePanel === "buttons" && (
            <Stack spacing={2}>
              <Typography fontWeight="bold" sx={{ color: "#9A616D" }}>Couleur des boutons :</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {["#7e4a53","#3f51b5","#4caf50","#ff9800","#f44336"].map((color) => (
                  <Box
                    key={color}
                    onClick={() => setButtonColor(color)}
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      bgcolor: color,
                      cursor: "pointer",
                      border: buttonColor === color ? "3px solid black" : "2px solid #ccc",
                      transition: "transform 0.2s",
                      "&:hover": { transform: "scale(1.2)" },
                    }}
                  />
                ))}
              </Stack>
              <Typography fontWeight="bold" sx={{ color: "#9A616D" }}>Couleur personnalisée :</Typography>
              <Box sx={{ width: 40, height: 40, borderRadius: "50%", overflow: "hidden", border: "2px solid #ccc" }}>
                <input
                  type="color"
                  value={buttonColor}
                  onChange={(e) => setButtonColor(e.target.value)}
                  style={{ width: "100%", height: "100%", border: "none", padding: 0, cursor: "pointer" }}
                />
              </Box>
            </Stack>
          )}

          {/* Panel "Global Styles" */}
          {activePanel === "global" && (
            <Stack spacing={2}>
              <Typography fontWeight="bold" sx={{ color: "#9A616D" }}>Police globale :</Typography>
              <Stack direction="row" spacing={2} flexWrap="wrap">
                {["Arial","Verdana","Tahoma","Georgia"].map((font) => (
                  <Typography
                    key={font}
                    sx={{
                      fontFamily: font,
                      color: globalFont === font ? "#9A616D" : "#000",
                      fontWeight: globalFont === font ? "bold" : "normal",
                      cursor: "pointer",
                    }}
                    onClick={() => setGlobalFont(font)}
                  >
                    Aa
                  </Typography>
                ))}
              </Stack>

              <Typography fontWeight="bold" sx={{ color: "#9A616D" }}>Fond global :</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {["#f5f5f5","#ffffff","#e3f2fd","#e8f5e9","#fff3e0","#fce4ec","#ffebee","#f3e5f5"].map((color) => (
                  <Box
                    key={color}
                    onClick={() => setPageBg(color)}
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      bgcolor: color,
                      cursor: "pointer",
                      border: pageBg === color ? "3px solid #9A616D" : "2px solid #ccc",
                      "&:hover": { transform: "scale(1.2)" },
                    }}
                  />
                ))}
              </Stack>

              <Typography fontWeight="bold" sx={{ color: "#9A616D" }}>Ombre (BoxShadow) :</Typography>
              <input
                type="range"
                min={0}
                max={24}
                value={boxShadow}
                onChange={(e) => setBoxShadow(Number(e.target.value))}
                style={{ width: "100%", accentColor: "#9A616D", cursor: "pointer" }}
              />

              <Typography fontWeight="bold" sx={{ color: "#9A616D" }}>Arrondi des bordures :</Typography>
              <input
                type="range"
                min={0}
                max={32}
                value={borderRadiusGlobal}
                onChange={(e) => setBorderRadiusGlobal(Number(e.target.value))}
                style={{ width: "100%", accentColor: "#9A616D", cursor: "pointer" }}
              />
            </Stack>
          )}
        </Box>
      )}
    </>
  );
};

export default CustomizationSidebar;
