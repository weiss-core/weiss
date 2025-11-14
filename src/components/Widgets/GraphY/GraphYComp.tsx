import React, { useEffect, useState, useRef } from "react";
import type { WidgetUpdate } from "@src/types/widgets";
import Plot from "react-plotly.js";
import { useEditorContext } from "@src/context/useEditorContext";
import { COLORS } from "@src/constants/constants";
import type { TimeStamp } from "@src/types/epicsWS";

const GraphYComp: React.FC<WidgetUpdate> = ({ data }) => {
  const { inEditMode } = useEditorContext();
  const p = data.editableProperties;
  const lineColors = p.lineColors?.value;
  const pvNames = p.pvNames?.value;
  const bufferSize = p.plotBufferSize?.value ?? 50;
  const multiPvData = data.multiPvData;
  const plotLineStyle = p.plotLineStyle?.value ?? "lines";

  const valueBuffers = useRef<Record<string, number[]>>({});
  const [plotData, setPlotData] = useState<Plotly.Data[]>([]);
  const prevPvTimestamps = useRef<Record<string, TimeStamp>>({});
  const [layout, setLayout] = useState<Partial<Plotly.Layout>>({});

  // build traces
  useEffect(() => {
    if (inEditMode) {
      valueBuffers.current = {};
      const previewPvs = pvNames ?? ["<pvname>"];
      const previewTraces = previewPvs.map((pvName, idx) => {
        const base = idx * 0.5;
        const y = [base, base + 3, base + 2, base + 5];
        return {
          y,
          type: "scatter",
          mode: plotLineStyle,
          line: { color: lineColors?.[idx] ?? "auto" },
          name: pvName,
        } as Plotly.Data;
      });
      setPlotData(previewTraces);
      return;
    }

    if (!multiPvData) return;
    let updated = false;

    for (const [pvName, pv] of Object.entries(multiPvData)) {
      const newValTs = pv.timeStamp;
      const oldValTs = prevPvTimestamps.current[pvName];
      if (newValTs === oldValTs) continue; // avoid re-render if no update
      const newVal = pv.value;
      prevPvTimestamps.current[pvName] = newValTs;
      updated = true;

      if (typeof newVal === "number") {
        if (!valueBuffers.current[pvName]) valueBuffers.current[pvName] = [];
        const buf = valueBuffers.current[pvName];
        buf.push(newVal);
        if (buf.length > bufferSize) buf.shift();
      }
    }

    if (!updated) return;

    const traces = Object.entries(multiPvData)
      .map(([pvName, pv]) => {
        const pvIdx = pvNames?.indexOf(pvName) ?? -1;
        if (pvIdx === -1) return null;

        const value = pv.value;
        const y =
          typeof value === "number"
            ? [...(valueBuffers.current[pvName] ?? [])]
            : Array.isArray(value)
            ? [...value]
            : null;

        if (!y) return null;

        return {
          y,
          type: "scatter",
          mode: plotLineStyle,
          line: { color: lineColors?.[pvIdx] },
          name: pvName,
        } as Plotly.Data;
      })
      .filter((t): t is Plotly.Data => t !== null);

    setPlotData(traces);
  }, [inEditMode, multiPvData, bufferSize, plotLineStyle, lineColors, pvNames]);

  // build layout
  useEffect(() => {
    setLayout((prev) => ({
      ...prev,
      title: {
        text: p.plotTitle?.value,
        font: {
          family: p.fontFamily?.value,
          size: p.fontSize?.value,
          weight: p.fontBold?.value ? 800 : 0,
          style: p.fontItalic?.value ? "italic" : "normal",
        },
      },
      xaxis: {
        ...prev.xaxis, // keep previous range if any
        title: {
          text: p.xAxisTitle?.value,
          font: {
            family: p.fontFamily?.value,
            size: (p.fontSize?.value ?? 12) - 2,
            color: COLORS.lightGray,
          },
        },
      },
      yaxis: {
        ...prev.yaxis,
        type: p.logscaleY?.value ? "log" : "linear",
        title: {
          text: p.yAxisTitle?.value,
          font: {
            family: p.fontFamily?.value,
            size: (p.fontSize?.value ?? 12) - 2,
            color: COLORS.lightGray,
          },
        },
      },
      paper_bgcolor: p.backgroundColor?.value,
      plot_bgcolor: p.backgroundColor?.value,
      margin: { b: 35, l: 35, t: 50, r: 30 },
      width: p.width?.value,
      height: p.height?.value,
      legend: {
        orientation: "h",
        x: 1,
        xanchor: "right",
        y: 0.975,
        bgcolor: "00000000",
      },
    }));
  }, [p]);

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
      <Plot
        data={plotData}
        layout={layout}
        onRelayout={(eventData) => {
          const x0 = eventData["xaxis.range[0]"];
          const x1 = eventData["xaxis.range[1]"];
          const y0 = eventData["yaxis.range[0]"];
          const y1 = eventData["yaxis.range[1]"];

          setLayout((prev) => ({
            ...prev,
            xaxis:
              x0 !== undefined && x1 !== undefined
                ? { ...prev.xaxis, range: [x0, x1] }
                : { ...prev.xaxis, range: undefined },
            yaxis:
              y0 !== undefined && y1 !== undefined
                ? { ...prev.yaxis, range: [y0, y1] }
                : { ...prev.yaxis, range: undefined },
          }));
        }}
        config={{
          responsive: true,
          modeBarButtonsToRemove: [
            "zoom2d",
            "lasso2d",
            "zoomIn2d",
            "zoomOut2d",
            "select2d",
            "autoScale2d",
          ],
          displaylogo: false,
          staticPlot: inEditMode,
        }}
      />
    </div>
  );
};

export { GraphYComp };
