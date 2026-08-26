"""Hugging Face entry point for the BrainBox FastAPI service."""

import os
import sys

import uvicorn
import spaces

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "src"))
from backend.main import app


@spaces.GPU
def reserve_zero_gpu():
    """ZeroGPU marker required by this Space's assigned hardware."""
    return None


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", "7860")))
