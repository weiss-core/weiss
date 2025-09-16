import React from "react";
import type { WidgetUpdate } from "../../../types/widgets";
import { EDIT_MODE, RUNTIME_MODE } from "../../../constants/constants";
import { useEditorContext } from "../../../context/useEditorContext";

const BitIndicatorComp: React.FC<WidgetUpdate> = ({ data }) => {
  const p = data.editableProperties;
  const { mode } = useEditorContext();

  if (!p.visible?.value) return null;

  const bitsCount = p.nBits?.value ?? 1;
  const onColor = p.onColor?.value;
  const offColor = p.offColor?.value;
  const invertOrder = p.invertBitOrder?.value;
  const orientation = p.orientation?.value;

  return <div></div>;
};

export { BitIndicatorComp };
