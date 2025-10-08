import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { EditorProvider } from "./context/EditorProvider.tsx";
import App from "./App.jsx";

import { BrowserRouter, Routes, Route } from "react-router-dom";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <EditorProvider>
        <Routes>
          <Route path="/" element={<App />} />
        </Routes>
      </EditorProvider>
    </BrowserRouter>
  </StrictMode>
);
