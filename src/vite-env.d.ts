/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE?: string;
  // Additional environment variables can be safely declared here
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
