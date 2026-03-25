/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GROQ_API_KEY?: string;
  readonly VITE_GROQ_MODEL?: string;
  /** Optional API origin when the client is hosted separately from the Node API */
  readonly VITE_API_URL?: string;
  /** Set to "1" to call Groq from the browser (static hosting; requires client key + CORS). */
  readonly VITE_GROQ_DIRECT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
