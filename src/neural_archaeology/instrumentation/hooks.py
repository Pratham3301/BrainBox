
import torch
from torch import nn


class InstrumentationEngine:
    """
    Core engine for intercepting and modifying neural network activations.
    Supports capturing activations for analysis and ablating neurons for causal experiments.
    """
    def __init__(self, model: nn.Module):
        self.model = model
        self.activations: dict[str, torch.Tensor] = {}
        self.hooks: list[torch.utils.hooks.RemovableHandle] = []
        self._ablation_masks: dict[str, torch.Tensor] = {}
        
    def _get_layer_by_name(self, name: str) -> nn.Module:
        for n, module in self.model.named_modules():
            if n == name:
                return module
        raise ValueError(f"Layer {name} not found in model.")

    def register_capture_hook(self, layer_name: str):
        """Registers a forward hook to capture the output activations of a specific layer."""
        layer = self._get_layer_by_name(layer_name)
        
        def hook_fn(module, input, output):
            # Move to CPU immediately to prevent VRAM OOM on 4GB cards
            self.activations[layer_name] = output.detach().cpu()
            
        handle = layer.register_forward_hook(hook_fn)
        self.hooks.append(handle)

    def register_ablation_hook(self, layer_name: str, channels: list[int] | None = None, replacement_value: float = 0.0):
        """
        Registers a forward hook that intercepts the activation and overwrites specific 
        channels/neurons to a target value.
        """
        layer = self._get_layer_by_name(layer_name)
        if channels is None:
            channels = []
            
        def hook_fn(module, input, output):
            # Create a copy so we don't modify the graph in-place illegally
            ablated_output = output.clone()
            if len(ablated_output.shape) == 4:
                # Conv layer: [Batch, Channels, H, W]
                ablated_output[:, channels, :, :] = replacement_value
            elif len(ablated_output.shape) == 2:
                # Linear layer: [Batch, Features]
                ablated_output[:, channels] = replacement_value
            return ablated_output
            
        handle = layer.register_forward_hook(hook_fn)
        self.hooks.append(handle)

    def clear_hooks(self):
        """Removes all registered hooks."""
        for handle in self.hooks:
            handle.remove()
        self.hooks = []
        
    def clear_activations(self):
        """Clears cached activations to free memory."""
        self.activations.clear()
