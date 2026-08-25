import torch
from torch.utils.data import DataLoader, TensorDataset

from neural_archaeology.analysis.ablation import AblationExperiment
from neural_archaeology.instrumentation.hooks import InstrumentationEngine
from neural_archaeology.models.registry import ModelRegistry


def test_ablation_experiment():
    print("Testing Ablation Experiment Wrapper...")
    model = ModelRegistry.get_model("cnn_small")
    engine = InstrumentationEngine(model)
    ablation_engine = AblationExperiment(model, engine)
    
    # Create dummy dataset
    dummy_images = torch.randn(10, 3, 32, 32)
    # Binary random labels for 10 classes
    dummy_labels = torch.randint(0, 10, (10,))
    dataset = TensorDataset(dummy_images, dummy_labels)
    dataloader = DataLoader(dataset, batch_size=2)
    
    # Run ablation on relu3 (which has 128 channels). Let's target channel 42.
    # The spatial size of relu3 in our small CNN for a 32x32 image is 8x8.
    results = ablation_engine.run_single_component_ablation(
        layer_name="relu3",
        component_idx=42,
        num_components=128,
        dataloader=dataloader,
        device="cpu"
    )
    
    print("\nAblation Results:")
    for k, v in results.items():
        print(f"  {k}: {v:.4f}")
        
    assert "causal_impact" in results
    assert "delta_target" in results
    assert "delta_control" in results
    
    # Because it's an untrained model on random data, accuracy will be terrible and random,
    # but the mechanics of the wrapper should execute perfectly without crashing.
    print("\nAblation test passed.")

if __name__ == "__main__":
    test_ablation_experiment()
