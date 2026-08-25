from torch import nn


class TransformerEngine:
    """
    Engine for ablating Attention Heads in GPT-2 Transformers.
    
    Uses WEIGHT-BASED ablation (temporarily zeroing c_proj weight slices)
    instead of forward hooks, which is robust across all transformers versions.
    """
    def __init__(self, model: nn.Module):
        self.model = model
        self._saved_weights: list[tuple] = []

    def ablate_heads(self, heads: list[tuple[int, int]]):
        """
        Zero out the output projection weights for specified attention heads.
        Call BEFORE the forward pass. Call restore_heads() AFTER.
        
        Args:
            heads: List of (layer_idx, head_idx) tuples to ablate.
        """
        self.restore_heads()  # Clean up any previous ablation
        
        config = self.model.config
        head_dim = config.n_embd // config.n_head
        
        for layer_idx, head_idx in heads:
            block = self.model.transformer.h[layer_idx]
            c_proj = block.attn.c_proj
            start = head_idx * head_dim
            end = start + head_dim
            
            # Save the original weight slice and bias slice
            saved_w = c_proj.weight.data[start:end, :].clone()
            saved_b = c_proj.bias.data.clone() if c_proj.bias is not None else None
            self._saved_weights.append((c_proj, start, end, saved_w, saved_b))
            
            # Zero the input slice of c_proj corresponding to this head
            c_proj.weight.data[start:end, :] = 0.0

    def restore_heads(self):
        """Restore all original weights after ablation."""
        for c_proj, start, end, saved_w, saved_b in self._saved_weights:
            c_proj.weight.data[start:end, :] = saved_w
        self._saved_weights = []

    def clear_hooks(self):
        """Compatibility method - restores weights."""
        self.restore_heads()

    def clear_cache(self):
        pass
