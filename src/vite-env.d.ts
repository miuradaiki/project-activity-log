/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ENABLE_TEST_DATA: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
