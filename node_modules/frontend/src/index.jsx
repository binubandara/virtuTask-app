import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import SettingContextProvider from "./context/SettingsContext";
import { TaskProvider } from "./context/TaskContext"; 

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <SettingContextProvider>
    <TaskProvider>
      <App />
    </TaskProvider>
  </SettingContextProvider>
);
