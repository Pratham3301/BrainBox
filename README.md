---
title: BrainBox Backend
emoji: 🧠
colorFrom: blue
colorTo: purple
sdk: docker
app_port: 7860
pinned: false
hardware: cpu-basic
---

# BrainBox Backend API

This Space runs the FastAPI service in `backend.main` directly on port 7860.
It is intentionally a Docker Space: the frontend is deployed independently
and calls this service over HTTPS.
