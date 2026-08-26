"""Hugging Face entry point for the BrainBox FastAPI service."""

import os
import sys

import uvicorn

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "src"))
from backend.main import app


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", "7860")))
