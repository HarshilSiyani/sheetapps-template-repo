/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SHEETAPPS_API_URL: string
  readonly VITE_SHEETAPPS_API_KEY: string
  readonly VITE_SHEET_ID: string
  readonly VITE_SHEET_HEADERS: string
  readonly VITE_SHEET_DATA_TYPES: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_DESCRIPTION: string
  readonly VITE_PROJECT_ID: string
  readonly VITE_DEV_MODE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}