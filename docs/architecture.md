# Architecture: Neural Archaeology

This document describes the high-level architecture of the Neural Archaeology platform.

## 1. Core Philosophy
The platform is designed as a local-first, scientifically rigorous framework for analyzing neural networks. It avoids black-box abstractions, ensuring all interventions and measurements are mathematically transparent.

## 2. System Components

### 2.1 Model Registry (`models/`)
A PyTorch-based registry that standardizes access to various architectures (initially small CNNs, scaling to Transformers). It separates model weights from the forward-pass logic, enabling isolated layer access.

### 2.2 Instrumentation Engine (`src/neural_archaeology/instrumentation/`)
The core data-collection layer. Uses PyTorch forward and backward hooks (`register_forward_hook`) to intercept tensor activations without altering the model graph.
*   **Memory Manager:** Streams activations to CPU/Disk (safetensors format) to prevent VRAM overflow on hardware with limited GPU memory (e.g., 4GB limits).

### 2.3 Analysis & Ablation Engine (`src/neural_archaeology/analysis/`)
Performs causal interventions.
*   **Intervention Module:** Overwrites specific neuron/channel activations during the forward pass (e.g., zero-ablation, mean-replacement).
*   **Probing Module:** Trains linear classifiers on frozen intermediate representations.

### 2.4 Experiment Tracking (`experiments/`)
A lightweight, filesystem-based tracking mechanism. Every experiment generates a unique UUID folder containing:
*   `metadata.json` (commit, seeds, hardware, hyperparameters)
*   `results.parquet` (tabular metrics)
*   `plots/` (generated Plotly/Matplotlib artifacts)

### 2.5 API & UI (`backend/`, `frontend/`)
*   **Backend:** FastAPI provides REST endpoints for the UI to request specific ablations or query neuron distributions.
*   **Frontend:** React + TypeScript dashboard visualizing layer topologies, activation distributions, and causal graphs.

## 3. Data Flow
1. **Define Hypothesis:** User configures an experiment via CLI or UI.
2. **Execute Forward Pass:** Model processes batch; Instrumentation Engine captures internal state.
3. **Analyze:** Activations are aggregated (mean, variance, sparsity).
4. **Ablate (Optional):** Forward pass is repeated with intervened states.
5. **Report:** Results are statistically compared to baselines and persisted.
