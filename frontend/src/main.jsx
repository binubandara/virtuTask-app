// main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import SettingContextProvider from "./context/SettingsContext";
import { TaskProvider } from "./context/TaskContext"; 

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <SettingContextProvider>
      <TaskProvider>
        <App />
      </TaskProvider>
    </SettingContextProvider>
  </React.StrictMode>
);