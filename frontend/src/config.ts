const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const normalizedBaseUrl = configuredBaseUrl.replace(/\/$/, '');
const isLocalBackend = /localhost|127\.0\.0\.1/.test(normalizedBaseUrl);

// Hugging Face Gradio Spaces reserve `/api/*` for Gradio's own handlers.
// The FastAPI backend is deliberately mounted below `/backend` in production.
export const API_BASE_URL = isLocalBackend
  ? normalizedBaseUrl
  : `${normalizedBaseUrl}/backend`;
