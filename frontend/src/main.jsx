import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import ErrorBoundary from "./components/ErrorBoundary";

// Verificar configuração de ambiente
if (!import.meta.env.VITE_API_URL) {
  console.debug("⚠️ VITE_API_URL não configurado!");
  console.debug("💡 Crie um arquivo .env.local baseado no .env.example:");
  console.debug("   cp .env.example .env.local");
  console.debug("   # Edite .env.local com suas configurações");
}

const container = document.getElementById("root");
if (!container) {
  throw new Error("Root element not found (#root)");
}
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);