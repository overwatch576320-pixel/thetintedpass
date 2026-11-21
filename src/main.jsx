import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, HashRouter } from "react-router-dom";
import App from "./App";
import "./styles.css";

// Use HashRouter if opened via file:// protocol; otherwise standard BrowserRouter
const isFileProtocol = typeof window !== "undefined" && window.location.protocol === "file:";
const Router = isFileProtocol ? HashRouter : BrowserRouter;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>
);
