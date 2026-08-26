import base64
import io

import numpy as np
import torch
import torch.nn.functional as F
from PIL import Image
from torch import optim


class FeatureVisualizer:
    """
    Uses Gradient Ascent to hallucinate an input image that maximally activates a target neuron.
    This version uses its OWN hook that preserves gradients (does NOT detach).
    """
    def __init__(self, model: torch.nn.Module):
        self.model = model

    def generate_synthetic_image(
        self, 
        layer_name: str, 
        channel_idx: int, 
        steps: int = 200, 
        lr: float = 0.05,
        device: str = "cpu"
    ) -> str:
        self.model.to(device)
        self.model.eval()
        
        # We need our own hook that does NOT detach (so gradients flow)
        target_layer = None
        for name, module in self.model.named_modules():
            if name == layer_name:
                target_layer = module
                break
        if target_layer is None:
            raise ValueError(f"Layer {layer_name} not found")
        
        captured_activation = {}
        
        def grad_hook(module, input, output):
            # Store WITHOUT detaching so backward() can flow through
            captured_activation['value'] = output
        
        handle = target_layer.register_forward_hook(grad_hook)
        
        # ResNet accepts smaller spatial inputs.  Starting at 96px makes the
        # interactive feature-visualization endpoint finish on CPU Spaces;
        # the result is enlarged for display below.
        image_tensor = torch.randn((1, 3, 96, 96), device=device) * 0.01
        image_tensor = image_tensor.requires_grad_(True)
        
        optimizer = optim.Adam([image_tensor], lr=lr, weight_decay=1e-6)
        
        for step in range(steps):
            optimizer.zero_grad()
            
            _ = self.model(image_tensor)
            
            acts = captured_activation['value']
            
            if len(acts.shape) == 4:
                target_activation = acts[0, channel_idx, :, :].mean()
            else:
                target_activation = acts[0, channel_idx]
            
            loss = -target_activation
            loss.backward()
            optimizer.step()
            
            # Blur every 10 steps to reduce high-frequency noise
            if step % 10 == 0:
                with torch.no_grad():
                    image_tensor.data = F.avg_pool2d(
                        image_tensor.data, kernel_size=3, stride=1, padding=1
                    )

        handle.remove()
        
        # Post-process into viewable image
        img_data = image_tensor.detach().cpu().squeeze().numpy()
        img_data = np.transpose(img_data, (1, 2, 0))
        
        for c in range(3):
            ch = img_data[:, :, c]
            ch_min, ch_max = ch.min(), ch.max()
            if ch_max - ch_min > 1e-5:
                img_data[:, :, c] = (ch - ch_min) / (ch_max - ch_min)
            else:
                img_data[:, :, c] = 0.5
        
        img_uint8 = (np.clip(img_data, 0, 1) * 255).astype(np.uint8)
        pil_img = Image.fromarray(img_uint8).resize((512, 512), Image.LANCZOS)
        
        buffered = io.BytesIO()
        pil_img.save(buffered, format="PNG")
        return base64.b64encode(buffered.getvalue()).decode("utf-8")
