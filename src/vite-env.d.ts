/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Backend API URL (all secrets are kept on backend)
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
