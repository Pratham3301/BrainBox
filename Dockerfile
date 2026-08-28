FROM python:3.11-slim

WORKDIR /app

# Install system audio dependencies (required for soundfile)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libsndfile1 \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install PyTorch CPU wheels first to keep the image lightweight and fast
RUN pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu

# Install Python requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .
RUN pip install -e .

# Oracle's public HTTP listener is configured through the PORT environment
# variable. Keep 8000 as the container default for local and OCI deployment.
ENV PORT=8000
EXPOSE 8000

# Start Uvicorn
CMD ["sh", "-c", "uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-7860}"]
