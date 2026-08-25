import torch

from neural_archaeology.instrumentation.hooks import InstrumentationEngine
from neural_archaeology.models.registry import ModelRegistry


def test_instrumentation_capture_and_ablate():
    print("Initializing test...")
    # 1. Load model
    model = ModelRegistry.get_model("cnn_small")
    model.eval()  # Set to eval mode for deterministic testing
    
    # 2. Attach instrumentation engine
    engine = InstrumentationEngine(model)
    
    # 3. Register a capture hook on the second ReLU activation (after conv2)
    engine.register_capture_hook("relu2")
    
    # 4. Register an ablation hook on the third ReLU.
    # The output of conv3/relu3 will have 128 channels. 
    # We will ablate the first 10 channels.
    channels_to_ablate = list(range(10))
    engine.register_ablation_hook("relu3", channels=channels_to_ablate, replacement_value=0.0)
    
    # 5. Run a forward pass with a dummy CIFAR-10 sized image (Batch=1, C=3, H=32, W=32)
    print("Running forward pass...")
    dummy_input = torch.randn(1, 3, 32, 32)
    with torch.no_grad():
        model(dummy_input)
        
    # 6. Verify Capture
    assert "relu2" in engine.activations, "relu2 activation was not captured."
    captured_tensor = engine.activations["relu2"]
    
    # Output of conv2/relu2 (assuming input 32x32, pool1 halves to 16x16, 
    # conv2 keeps 16x16 because padding=1, so shape is [1, 64, 16, 16])
    print(f"Captured relu2 shape: {captured_tensor.shape}")
    assert captured_tensor.shape == (1, 64, 16, 16), "Captured shape is incorrect!"
    
    # 7. Verify Ablation
    # We need to manually capture the output of relu3 to see if it was zeroed out.
    # We can do this by registering another capture hook *after* the ablation hook fires.
    engine.clear_hooks()
    
    engine.register_ablation_hook("relu3", channels=channels_to_ablate, replacement_value=0.0)
    engine.register_capture_hook("relu3") # This hook fires AFTER the ablation hook
    
    with torch.no_grad():
        model(dummy_input)
        
    ablated_tensor = engine.activations["relu3"]
    # First 10 channels should be exactly 0
    assert torch.all(ablated_tensor[:, :10, :, :] == 0.0), "Ablation failed! Values are non-zero."
    # The remaining channels should not be entirely zero
    assert not torch.all(ablated_tensor[:, 10:, :, :] == 0.0), "Ablation broke other channels!"
    
    print("SUCCESS: Instrumentation Engine is capturing and ablating correctly.")
    
if __name__ == "__main__":
    test_instrumentation_capture_and_ablate()
