import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import ErrorBoundary from "./components/ErrorBoundary";
import { I18nProvider } from "./i18n/useI18n";
import { checkEnvVars } from "@/utils/checkEnv";
import { WEB3_CONFIG } from "@/web3/addresses";

checkEnvVars();

if (import.meta.env.DEV) {
  // eslint-disable-next-line no-console
  console.log("[WEB3_CONFIG]", WEB3_CONFIG);
}

const container = document.getElementById("root");
if (!container) {
  throw new Error("Root element not found (#root)");
}
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <I18nProvider>
        <App />
      </I18nProvider>
    </ErrorBoundary>
  </React.StrictMode>
);