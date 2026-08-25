import torch
from torch.utils.data import DataLoader, TensorDataset

from neural_archaeology.analysis.probing import LinearProbe
from neural_archaeology.analysis.similarity import linear_cka
from neural_archaeology.instrumentation.hooks import InstrumentationEngine
from neural_archaeology.models.registry import ModelRegistry


def test_probing_and_cka():
    print("Testing Linear Probe and CKA...")
    model = ModelRegistry.get_model("cnn_small")
    engine = InstrumentationEngine(model)
    
    # 1. Test Linear Probe
    probe = LinearProbe(model, engine)
    
    # Create dummy datasets (small enough for quick logistic regression)
    dummy_train_images = torch.randn(50, 3, 32, 32)
    dummy_train_labels = torch.randint(0, 10, (50,))
    train_loader = DataLoader(TensorDataset(dummy_train_images, dummy_train_labels), batch_size=10)
    
    dummy_test_images = torch.randn(20, 3, 32, 32)
    dummy_test_labels = torch.randint(0, 10, (20,))
    test_loader = DataLoader(TensorDataset(dummy_test_images, dummy_test_labels), batch_size=10)
    
    print("\nTraining probe on 'relu2'...")
    probe_results = probe.train_and_evaluate(
        layer_name="relu2",
        train_loader=train_loader,
        test_loader=test_loader,
        device="cpu"
    )
    
    for k, v in probe_results.items():
        print(f"  {k}: {v:.4f}")
    assert "probe_train_accuracy" in probe_results
    assert "probe_test_accuracy" in probe_results
    
    # 2. Test CKA
    print("\nTesting Linear CKA...")
    # Create two random feature matrices of shape [Num_Samples, Features]
    features_a = torch.randn(100, 64)
    
    # Identical representations should have CKA of 1.0
    cka_identical = linear_cka(features_a, features_a)
    print(f"  CKA (Identical): {cka_identical:.4f}")
    assert torch.isclose(torch.tensor(cka_identical), torch.tensor(1.0), atol=1e-4)
    
    # Orthogonal/Random representations should have low CKA
    features_b = torch.randn(100, 128)
    cka_random = linear_cka(features_a, features_b)
    print(f"  CKA (Random): {cka_random:.4f}")
    assert cka_random < 0.5 # Usually much lower, near 0.1 for high dimensions
    
    print("\nProbing & Similarity test passed.")

if __name__ == "__main__":
    test_probing_and_cka()
