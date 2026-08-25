import torch

from neural_archaeology.analysis.selectivity import (
    compute_class_selectivity,
    compute_sparsity,
)


def test_sparsity():
    print("Testing sparsity computation...")
    # Create a dummy batch of Linear activations: [Batch=4, Features=3]
    # Feature 0 is always 0 (sparsity = 1.0)
    # Feature 1 is never 0 (sparsity = 0.0)
    # Feature 2 is 0 half the time (sparsity = 0.5)
    activations = torch.tensor([
        [0.0, 1.5, 0.0],
        [0.0, 2.1, 3.2],
        [0.0, 0.5, 0.0],
        [0.0, 0.9, 1.1]
    ])
    
    sparsity = compute_sparsity(activations, epsilon=1e-5)
    
    assert torch.isclose(sparsity[0], torch.tensor(1.0)), f"Expected 1.0, got {sparsity[0]}"
    assert torch.isclose(sparsity[1], torch.tensor(0.0)), f"Expected 0.0, got {sparsity[1]}"
    assert torch.isclose(sparsity[2], torch.tensor(0.5)), f"Expected 0.5, got {sparsity[2]}"
    print("Sparsity test passed.")

def test_selectivity():
    print("Testing class selectivity computation...")
    # [Batch=4, Features=2]
    # Let's say Feature 0 fires ONLY for class 0, and not for class 1.
    # Feature 1 fires equally for both.
    activations = torch.tensor([
        [5.0, 2.0], # Class 0
        [4.0, 2.0], # Class 0
        [0.0, 2.0], # Class 1
        [0.0, 2.0]  # Class 1
    ])
    labels = torch.tensor([0, 0, 1, 1])
    
    scores = compute_class_selectivity(activations, labels, num_classes=2)
    
    # Feature 0 Selectivity for Class 0:
    # mu_c (Class 0) = 4.5
    # mu_not_c (Class 1) = 0.0
    # Score = (4.5 - 0.0) / (4.5 + 0.0) = 1.0 (highly selective)
    assert torch.isclose(scores[0, 0], torch.tensor(1.0), atol=1e-4), f"F0 C0 expected 1.0, got {scores[0,0]}"
    
    # Feature 0 Selectivity for Class 1:
    # mu_c = 0.0, mu_not_c = 4.5
    # Score = (0.0 - 4.5) / 4.5 = -1.0 (anti-selective)
    assert torch.isclose(scores[0, 1], torch.tensor(-1.0), atol=1e-4), f"F0 C1 expected -1.0, got {scores[0,1]}"
    
    # Feature 1 Selectivity for Class 0:
    # mu_c = 2.0, mu_not_c = 2.0
    # Score = (2.0 - 2.0) / 4.0 = 0.0 (not selective)
    assert torch.isclose(scores[1, 0], torch.tensor(0.0), atol=1e-4), f"F1 C0 expected 0.0, got {scores[1,0]}"
    
    print("Selectivity test passed.")

if __name__ == "__main__":
    test_sparsity()
    test_selectivity()
