import React from "react";
import { SvgIcon, type SvgIconProps } from "@mui/material";

interface GradientBitIconProps extends SvgIconProps {
  onColor: string;
  offColor: string;
}

const GradientBitIcon: React.FC<GradientBitIconProps> = ({ onColor, offColor, ...props }) => (
  <SvgIcon {...props}>
    <defs>
      <linearGradient id="bitGradient" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="50%" stopColor={onColor} />
        <stop offset="50%" stopColor={offColor} />
      </linearGradient>
    </defs>
    <circle cx="12" cy="12" r="10" fill="url(#bitGradient)" />
  </SvgIcon>
);

export default GradientBitIcon;
