import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from fastapi.testclient import TestClient

from backend.main import app

client = TestClient(app)

def test_get_layers():
    response = client.get("/api/model/layers")
    assert response.status_code == 200
    data = response.json()
    assert "layers" in data
    assert len(data["layers"]) == 4

def test_run_ablation():
    payload = {
        "layer_name": "layer1",
        "component_idx": 0,
        "num_components": 64
    }
    response = client.post("/api/experiment/ablate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "baseline_accuracy" in data
    assert "target_ablation_accuracy" in data
    assert "causal_impact" in data

def test_transformer_info():
    response = client.get("/api/transformer/info")
    assert response.status_code == 200
    data = response.json()
    assert data["num_layers"] == 12
    assert data["num_heads"] == 12

def test_transformer_ablate():
    payload = {
        "prompt": "The capital of France is",
        "layer_idx": 0,
        "head_idx": 0
    }
    response = client.post("/api/transformer/ablate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "tokens" in data
    assert "baseline_predictions" in data
    assert "ablated_predictions" in data
    assert "attention_matrix" in data

def test_similarity_endpoint():
    response = client.get("/api/experiment/similarity")
    assert response.status_code == 200
    data = response.json()
    assert "layers" in data
    assert "matrix" in data
    assert len(data["matrix"]) == 4

def test_probe_endpoint():
    response = client.get("/api/experiment/probe")
    assert response.status_code == 200
    data = response.json()
    assert "probe_results" in data
    assert len(data["probe_results"]) == 4
