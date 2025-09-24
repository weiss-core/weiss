import React from "react";
import type { WidgetUpdate } from "../../../types/widgets";
import { useEditorContext } from "../../../context/useEditorContext";
import GraphY from "ReactAutomationStudio/components/BaseComponents/GraphY";
import { EDIT_MODE } from "../../../constants/constants";

const GraphYComp: React.FC<WidgetUpdate> = ({ data }) => {
  const { mode, macros } = useEditorContext();
  const p = data.editableProperties;
  const pvs = p.pvNames?.value ?? [];
  const inEditMode = mode === EDIT_MODE;

  return (
    <div
      style={{
        width: p.width?.value,
        height: p.height?.value,
        borderRadius: p.borderRadius?.value,
        borderStyle: p.borderStyle?.value,
        borderWidth: p.borderWidth?.value,
        borderColor: p.borderColor?.value,
        display: "flex",
      }}
    >
      <GraphY
        key={mode}
        pvs={pvs}
        macros={macros}
        title={p.plotTitle?.value}
        xAxisTitle={p.xAxisTitle?.value}
        yAxisTitle={p.yAxisTitle?.value}
        lineColor={p.lineColors?.value}
        backgroundColor={p.backgroundColor?.value}
        maxLength={p.plotBufferSize?.value}
        showLegend={p.showLegend?.value}
        yScaleLog10={p.logscaleY?.value}
        useTimeStamp={p.useTimestamp?.value}
        plotlyStyle={{
          position: "relative",
          display: "inline-block",
          width: "100%",
          height: "100%",
        }}
        editMode={inEditMode}
        displayModeBar={!inEditMode}
        disableContextMenu={inEditMode}
        disableMobileStatic={inEditMode}
      />
    </div>
  );
};

export { GraphYComp };
