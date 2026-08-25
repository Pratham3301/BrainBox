@echo off
echo ==========================================
echo Starting Neural Archaeology Platform
echo ==========================================

echo Starting FastAPI Backend (Port 8000)...
start "Neural Archaeology Backend" cmd /k ".\.venv\Scripts\activate.bat && set PYTHONPATH=src && uvicorn backend.main:app --reload"


echo Starting Vite Frontend (Port 5173)...
start "Neural Archaeology Frontend" cmd /k "cd frontend && npm run dev"

echo Waiting for servers to boot...
ping 127.0.0.1 -n 5 > nul

echo Opening dashboard in your default browser...
start http://localhost:5173

echo Done! You can close this window. The servers will remain running in their own terminal windows.
