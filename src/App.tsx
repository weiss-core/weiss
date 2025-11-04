import React, { useMemo } from "react";
import "./App.css";
import { GridZone } from "./components/GridZone";
import WidgetPicker from "./components/WidgetPicker/WidgetPicker";
import PropertyEditor from "./components/PropertyEditor/PropertyEditor";
import NavBar from "./components/NavBar/NavBar";
import { useEditorContext } from "./context/useEditorContext";
import { GRID_ID } from "./constants/constants";

const App: React.FC = () => {
  const { editorWidgets } = useEditorContext();
  const gridProperties = useMemo(
    () => editorWidgets.find((w) => w.id === GRID_ID),
    [editorWidgets]
  );
  return (
    <div className="app">
      <div className="appBar">
        <NavBar />
      </div>
      <div className="designerArea">
        <div className="widgetPicker">
          <WidgetPicker />
        </div>
        <div id="gridContainer">
          <GridZone.component data={gridProperties!} />
        </div>
        <div className="propertyEditor">
          <PropertyEditor />
        </div>
      </div>
    </div>
  );
};

export default App;
