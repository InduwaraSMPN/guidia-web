/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  // Add other environment variables here if needed
}

import { HLJSApi } from "highlight.js";

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare global {
  interface Window {
    hljs?: HLJSApi;
  }
}
