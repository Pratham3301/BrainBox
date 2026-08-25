# Reproducibility Guarantee

Reproducibility is mandatory. Every generated experiment artifact will include the following metadata payload:

```json
{
  "environment": {
    "os": "string",
    "python_version": "string",
    "pytorch_version": "string",
    "cuda_available": "boolean",
    "gpu_name": "string"
  },
  "git": {
    "commit_hash": "string",
    "is_dirty": "boolean"
  },
  "experiment": {
    "random_seed": "integer",
    "deterministic_mode_enabled": "boolean"
  }
}
```

## Determinism
To the greatest extent possible, PyTorch will be configured for deterministic execution:
```python
torch.manual_seed(seed)
torch.backends.cudnn.deterministic = True
torch.backends.cudnn.benchmark = False
np.random.seed(seed)
random.seed(seed)
```

## Caching
Expensive intermediate computations (e.g., full dataset activation extraction) are cached locally based on a hash of the configuration parameters. If an experiment is re-run with identical parameters, the cached activations are used.
