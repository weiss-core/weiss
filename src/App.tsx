//@ts-nocheck
import React, { useMemo } from "react";
import "./App.css";
import { GridZone } from "./components/GridZone";
import WidgetSelector from "./components/WidgetSelector/WidgetSelector";
import PropertyEditor from "./components/PropertyEditor/PropertyEditor";
import NavBar from "./components/NavBar/NavBar";
import { useEditorContext } from "./context/useEditorContext";
import { GRID_ID } from "./constants/constants";
import RasAppCore from "@ReactAutomationStudio/components/SystemComponents/RasAppCore";
import themes from "@ReactAutomationStudio/components/UI/Themes/themes";

const App: React.FC = () => {
  const { editorWidgets } = useEditorContext();
  const gridProperties = useMemo(
    () => editorWidgets.find((w) => w.id === GRID_ID),
    [editorWidgets]
  );
  return (
    <RasAppCore themes={themes} defaultTheme={"Light"}>
      <div className="app">
        <div className="appBar">
          <NavBar />
        </div>
        <div className="designerArea">
          <div className="widgetSelector">
            <WidgetSelector />
          </div>
          <div id="gridContainer">
            <GridZone.component data={gridProperties!} />
          </div>
          <div className="propertyEditor">
            <PropertyEditor />
          </div>
        </div>
      </div>
    </RasAppCore>
  );
};

export default App;
