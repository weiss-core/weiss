import React from "react";
import type { ReactNode, CSSProperties } from "react";
import type { Alarm } from "@src/types/epicsWS";
import { COLORS } from "@src/constants/constants";
import { useEditorContext } from "@src/context/useEditorContext";

interface AlarmBorderProps {
  alarmData?: Alarm;
  children: ReactNode;
  enable: boolean | undefined;
}

/**
 * AlarmBorder wraps any widget and applies a border color based on PV alarm severity.
 * - Defaults to COLORS.disconnected if PV hasn't been read yet.
 * - Severity → Color mapping:
 *   - NO_ALARM → no border
 *   - MINOR → COLORS.minor
 *   - MAJOR → COLORS.major
 *   - INVALID → COLORS.invalid
 */
const AlarmBorder: React.FC<AlarmBorderProps> = ({ alarmData, children, enable }) => {
  const { inEditMode } = useEditorContext();
  const getBorderColor = (): string | undefined => {
    if (!alarmData) return COLORS.disconnected;
    switch (alarmData.severity) {
      case 0: // NO_ALARM
        return undefined;
      case 1: // MINOR
        return COLORS.minor;
      case 2: // MAJOR
        return COLORS.major;
      case 3: // INVALID
        return COLORS.invalid;
      default:
        return COLORS.disconnected;
    }
  };

  const borderColor = getBorderColor();

  const style: CSSProperties = {
    width: "100%",
    height: "100%",
    borderColor: borderColor,
    borderWidth: borderColor ? "3px" : 0,
    borderStyle: borderColor === COLORS.disconnected ? "dashed" : "solid",
    borderRadius: "2px",
    boxSizing: "border-box",
  };

  return enable && !inEditMode ? <div style={style}>{children}</div> : children;
};

export default AlarmBorder;
