// src/components/PropertyFields/TextFieldProperty.tsx
import React from "react";
import { TextField, ListItem } from "@mui/material";
import type { PropertyKey, PropertyValue } from "@src/types/widgets";
import LocalValueWrapper from "./LocalValueWrapper";

interface TextFieldPropertyProps {
  propName: PropertyKey;
  label: string;
  value: PropertyValue;
  selType: "text" | "number";
  onChange: (propName: PropertyKey, newValue: PropertyValue) => void;
}

const TextFieldProperty: React.FC<TextFieldPropertyProps> = (props) => {
  const { propName, label, value, selType, onChange } = props;
  return (
    <ListItem key={propName} disablePadding sx={{ px: 2, py: 1 }}>
      <LocalValueWrapper
        initial={value}
        render={(localVal, setLocalVal) => (
          <TextField
            fullWidth
            label={label}
            variant="outlined"
            size="small"
            type={selType}
            value={localVal}
            onChange={(e) =>
              setLocalVal(selType === "number" ? Number(e.target.value) : e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (localVal !== value) onChange(propName, localVal);
              }
            }}
            onBlur={() => {
              if (localVal !== value) onChange(propName, localVal);
            }}
          />
        )}
      />
    </ListItem>
  );
};

export default React.memo(TextFieldProperty);
