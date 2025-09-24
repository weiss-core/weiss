import React, { useState, useRef } from "react";
import { IconButton, Fade, Box, Typography, Tooltip } from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

const HelpOverlay: React.FC = () => {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<number | null>(null);

  const handleOpen = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setOpen(true);
  };

  const handleCloseWithDelay = () => {
    closeTimer.current = window.setTimeout(() => {
      setOpen(false);
    }, 1000); // keep it alive for 1s after leaving
  };

  return (
    <>
      <Tooltip title="Help / Shortcuts">
        <IconButton onMouseEnter={handleOpen} onMouseLeave={handleCloseWithDelay} sx={{ color: "white" }}>
          <HelpOutlineIcon />
        </IconButton>
      </Tooltip>

      <Fade in={open} timeout={300}>
        <Box
          onMouseEnter={handleOpen}
          onMouseLeave={handleCloseWithDelay}
          sx={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "rgba(50, 50, 50, 0.9)",
            color: "white",
            p: 3,
            borderRadius: 2,
            boxShadow: 4,
            maxWidth: "400px",
            textAlign: "center",
            zIndex: 1300,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Help & Shortcuts
          </Typography>
          <Typography variant="body2">help goes here!!</Typography>
        </Box>
      </Fade>
    </>
  );
};

export default HelpOverlay;
