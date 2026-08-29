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

# BrainBox: Interactive Neural Network Experimentation Laboratory

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Open%20BrainBox-7C3AED?style=for-the-badge)](https://brainbox-neura.vercel.app)
[![Backend Status](https://img.shields.io/badge/Backend-Online-22C55E?style=for-the-badge)](https://brainbox-neura.duckdns.org)
[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?style=for-the-badge&logo=python&logoColor=white)](#local-development)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](#models--tooling)
[![PyTorch](https://img.shields.io/badge/PyTorch-Powered-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white)](#models--tooling)

> **Most AI tools let us use models. BrainBox lets us understand them.**

## Table of Contents

- [Interactive Labs](#interactive-labs)
- [System Architecture](#system-architecture)
- [Models & Tooling](#models--tooling)
- [Security & Production Hardening](#security--production-hardening)
- [API Reference](#api-reference)
- [Local Development](#local-development)
- [Deployment Guide](#deployment-guide)
- [License](#license)

BrainBox is an interactive neural-network experimentation laboratory that turns AI from a black box into something users can inspect and intervene on.

## Purpose

Traditional AI learning focuses on prompts, outputs, and accuracy. BrainBox lets learners disable layers, inspect representations, steer activations, and observe causal changes directly. It uses established, lightweight models—ResNet-18, GPT-2, and SpeechT5—so experiments remain understandable, repeatable, and affordable on CPU hardware.

## Interactive Labs

| Lab | Capabilities |
|---|---|
| 👁️ Vision Lab | ResNet-18 mechanistic layer ablation, activation inspection, and feature visualization. |
| 🗣️ Language Lab | GPT-2 124M transformer-block ablation and output/logit behavior tracking. |
| 🎧 Audio & Speech Lab | SpeechT5 six-layer decoder intervention, CMU Arctic embeddings, phonetic degradation, and 16 kHz WAV output. |
| 🔎 Auto-Circuit Discovery | Causal tracing across up to 144 GPT-2 attention heads with Top-10 critical-node ranking. |
| 📊 Similarity & Probing | Linear CKA and linear probing for representation analysis. |
| 🛡️ Safety & Steering | Representation engineering with activation steering vectors. |
| 🤖 Guided AI Co-Pilot | Context-aware help for architecture and experiment concepts. |
| 🔗 State Capture | Reproducible experiment snapshots and shareable URLs. |

## System Architecture

```text
React 19 + TypeScript + Vite + Turnstile
                 │ HTTPS / JSON
                 ▼
Oracle Cloud Nginx Reverse Proxy (TLS)
                 │ localhost:8000
                 ▼
Docker: FastAPI + Uvicorn
Turnstile validation · CORS · RLock hook isolation
                 │
                 ▼
ResNet-18 · GPT-2 · SpeechT5
PyTorch hooks · CKA · probing · steering · circuit tracing
```

The API is implemented in `backend/main.py`; reusable analysis code is in `src/neural_archaeology/`; the frontend is in `frontend/`.

## Models & Tooling

| Layer | Technologies | Purpose |
|---|---|---|
| Frontend | React 19, TypeScript, Vite, Framer Motion | Interactive laboratory UI |
| Backend | FastAPI, Uvicorn | REST experiment API |
| Deep Learning | PyTorch, TorchVision, Transformers | Hook-based model manipulation |
| Audio | SoundFile, SciPy, NumPy | In-memory 16 kHz WAV synthesis |
| Analysis | scikit-learn, pandas, Plotly | CKA, probing, causal analysis |
| Security | Cloudflare Turnstile | Bot verification for protected requests |
| Infrastructure | Docker, Nginx, Oracle Cloud | HTTPS container deployment |

Models include ResNet-18, GPT-2, `microsoft/speecht5_tts`, `microsoft/speecht5_hifigan`, and CMU Arctic speaker embeddings.

## Security & Production Hardening

- Cloudflare Turnstile verifies protected browser requests; tokens are single-use and refreshed after each protected call.
- CORS allows the Vercel production site and local development origin only.
- `threading.RLock` serializes PyTorch hook experiments and avoids conflicting interventions.
- Lazy model loading and persistent in-memory caching reduce repeat-load cost.
- Rate limiting and payload limits are recommended before high-volume public use.

## API Reference

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/model/layers` | ResNet layer metadata |
| `POST` | `/api/experiment/ablate` | Vision ablation |
| `POST` | `/api/transformer/ablate` | Language ablation |
| `POST` | `/api/experiment/audio` | SpeechT5 synthesis and intervention |
| `POST` | `/api/experiment/discover_circuit` | Circuit discovery |
| `POST` | `/api/experiment/similarity` | Linear CKA comparison |
| `POST` | `/api/safety/steer` | Activation steering |

Additional routes support probing, feature visualization, activation maximization, chat, attention-head scans, and batch steering.

## Local Development

Clone: `git clone https://github.com/Pratham3301/BrainBox.git && cd BrainBox`

Backend: `python -m venv .venv`, activate it, run `pip install -r requirements.txt`, then run `uvicorn backend.main:app --host 0.0.0.0 --port 8000`.

Frontend: run `cd frontend`, `npm install`, and `npm run dev`. Configure the API with `frontend/src/config.ts` or `VITE_API_BASE_URL`.

## Deployment Guide

Frontend: `https://brainbox-neura.vercel.app`. API: `https://brainbox-neura.duckdns.org`. CORS is restricted to the production frontend and localhost. Cloudflare Turnstile uses a public frontend site key and a private `TURNSTILE_SECRET_KEY` stored only in Oracle’s `.env`; never commit the secret.

The Oracle container listens on port 8000 while Nginx owns ports 80/443 and provides TLS. Required private `.env` values are `TURNSTILE_SECRET_KEY` and `PORT=8000`. Deploy with `git pull origin main`, then `sudo docker compose -f docker-compose.oracle.yml up -d --build`, then `sudo systemctl restart nginx`.

## Reliability

Models load lazily and remain cached. Audio inference is CPU-intensive. A shared re-entrant lock serializes experiments and prevents conflicting hooks. Public high-volume deployments should add rate limiting, payload limits, monitoring, and stronger authentication.

## Project Structure

`backend/main.py` contains FastAPI routes; `src/neural_archaeology/` contains instrumentation and analysis modules; `frontend/src/` contains the React labs; `Dockerfile` and `docker-compose.oracle.yml` define Oracle deployment.

## License

Licensed under the MIT License. See [LICENSE](LICENSE).

Built with ❤️ for AI Interpretability & Mechanistic Understanding.
