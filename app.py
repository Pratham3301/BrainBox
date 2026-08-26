"""Local entry point for the BrainBox FastAPI backend.

Hugging Face starts the same application through the Dockerfile. Keeping this
file as a normal Uvicorn launcher makes local execution behave identically.
"""

import os

import uvicorn

from backend.main import app

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", "7860")))
