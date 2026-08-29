---
title: BrainBox Backend
emoji: 🧠
colorFrom: blue
colorTo: purple
sdk: gradio
sdk_version: 5.13.0
app_file: app.py
pinned: false
---

# BrainBox

BrainBox is an interactive neural-network experimentation laboratory that turns AI from a black box into something users can inspect and intervene on.

## Purpose

Traditional AI learning focuses on prompts, outputs, and accuracy. BrainBox lets learners disable layers, inspect representations, steer activations, and observe causal changes directly. It uses established, lightweight models—ResNet-18, GPT-2, and SpeechT5—so experiments remain understandable, repeatable, and affordable on CPU hardware.

## Labs

Vision (ResNet-18 ablation and feature visualization), Language (GPT-2 transformer ablation), Audio (SpeechT5 layer ablation with WAV output), Similarity (linear CKA and probing), Safety (activation steering), Discovery (circuit analysis), Chatbot, and Documentation.

## Architecture

React/TypeScript/Vite frontend on Vercel → HTTPS Nginx reverse proxy on Oracle Cloud → FastAPI/Uvicorn Docker container → PyTorch, TorchVision, and Hugging Face experiments.

The API is implemented in `backend/main.py`; reusable analysis code is in `src/neural_archaeology/`; the frontend is in `frontend/`.

## Models and libraries

ResNet-18 (TorchVision/ImageNet), GPT-2, `microsoft/speecht5_tts`, `microsoft/speecht5_hifigan`, and CMU Arctic speaker embeddings. Backend libraries include FastAPI, PyTorch, Transformers, Datasets, NumPy, SciPy, scikit-learn, pandas, Plotly, Pillow, and SoundFile. Frontend libraries include React 19, TypeScript, Vite, Framer Motion, and Lucide React.

## API

Main routes include `/api/model/layers`, `/api/experiment/ablate`, `/api/experiment/visualize`, `/api/experiment/audio`, `/api/experiment/similarity`, `/api/experiment/probe`, `/api/experiment/discover_circuit`, `/api/transformer/*`, and `/api/safety/*`.

## Local development

Install Python dependencies with `pip install -r requirements.txt`, then run `uvicorn backend.main:app --host 0.0.0.0 --port 8000`. For the frontend, run `npm install` and `npm run dev` inside `frontend/`. The API URL is configured in `frontend/src/config.ts` and supports `VITE_API_BASE_URL`.

## Production

Frontend: `https://brainbox-neura.vercel.app`. API: `https://brainbox-neura.duckdns.org`. CORS is restricted to the production frontend and localhost. Cloudflare Turnstile uses a public frontend site key and a private `TURNSTILE_SECRET_KEY` stored only in Oracle’s `.env`; never commit the secret.

The Oracle container listens on port 8000 while Nginx owns ports 80/443 and provides TLS. Deploy with `git pull origin main` followed by `sudo docker compose -f docker-compose.oracle.yml up -d --build`.

## Reliability

Models load lazily and remain cached. Audio inference is CPU-intensive. A shared re-entrant lock serializes experiments and prevents conflicting hooks. Public high-volume deployments should add rate limiting, payload limits, monitoring, and stronger authentication.

BrainBox is an educational and research tool: visualizations build intuition, while formal claims require controlled, repeated experiments and independent validation.

This Space hosts the FastAPI service and a small Gradio control surface. The
API remains available at `/api/*` for the independently deployed frontend.
