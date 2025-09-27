import React, { useState, useEffect } from "react";
import { Box, Typography, ListItem, Popover } from "@mui/material";
import { Sketch } from "@uiw/react-color";
import type { PropertyKey, PropertyValue } from "@src/types/widgets";
import { COLORS } from "@src/constants/constants";

interface ColorPropertyProps {
  propName: PropertyKey;
  label: string;
  value: PropertyValue;
  onChange: (propName: PropertyKey, newValue: PropertyValue) => void;
}

const ColorProperty: React.FC<ColorPropertyProps> = (props) => {
  const { propName, label, value, onChange } = props;
  const [localVal, setLocalVal] = useState(value as string);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setLocalVal(value as string);
  }, [value]);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    if (localVal !== value) {
      onChange(propName, localVal);
    }
  };

  const open = Boolean(anchorEl);

  return (
    <ListItem key={propName} disablePadding sx={{ px: 2, py: 1 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, width: "100%" }}>
        <Typography variant="body2">{label}</Typography>
        <Box
          onClick={handleClick}
          sx={{
            width: 40,
            height: 20,
            border: `2px solid ${COLORS.lightGray}`,
            borderRadius: "4px",
            backgroundColor: localVal,
            cursor: "pointer",
          }}
        />
        <Popover
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
        >
          <Sketch
            color={localVal}
            presetColors={Object.values(COLORS)}
            onChange={(color) => {
              const { r, g, b, a } = color.rgba;
              const rgbaString = `rgba(${r}, ${g}, ${b}, ${a})`;
              setLocalVal(rgbaString);
              onChange(propName, rgbaString);
            }}
          />
        </Popover>
      </Box>
    </ListItem>
  );
};

export default React.memo(ColorProperty);
