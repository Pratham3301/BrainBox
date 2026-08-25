# Neural Archaeology

> Reverse-engineering what neural networks learn, where they learn it, and which internal components actually cause their behavior.

## Overview
Neural Archaeology is a research-grade, reproducible, high-performance platform for investigating mechanistic interpretability inside neural networks. It moves beyond simple visualization by supporting causal interventions (ablation) and representation probing.

## Features
* **Causal Ablation:** Isolate and ablate individual neurons or channels to measure their causal impact on model predictions.
* **Selectivity Analysis:** Identify neurons that respond exclusively to specific features.
* **Probing:** Train linear classifiers on frozen intermediate representations.
* **Hardware Efficient:** Designed to run locally with strict VRAM management, supporting hardware as small as 4GB VRAM.

## Installation
```bash
python -m venv .venv
source .venv/bin/activate  # Or .\.venv\Scripts\Activate.ps1 on Windows
pip install -e .
```
