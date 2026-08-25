
import torch


def centering(K: torch.Tensor) -> torch.Tensor:
    """Centers the kernel matrix."""
    n = K.shape[0]
    unit = torch.ones([n, n], device=K.device)
    I = torch.eye(n, device=K.device)
    H = I - unit / n
    # H K H
    return torch.matmul(torch.matmul(H, K), H)

def linear_cka(features_x: torch.Tensor, features_y: torch.Tensor) -> float:
    """
    Computes Linear Centered Kernel Alignment (CKA) between two feature matrices.
    Features should be of shape [Num_Samples, Num_Features].
    Values closer to 1.0 indicate highly similar representation spaces.
    """
    # Ensure they have the same number of samples
    assert features_x.shape[0] == features_y.shape[0], "Number of samples must match."
    
    # Flatten spatial dimensions if they exist
    if len(features_x.shape) > 2:
        features_x = features_x.view(features_x.shape[0], -1)
    if len(features_y.shape) > 2:
        features_y = features_y.view(features_y.shape[0], -1)
        
    # Move to same device
    device = features_x.device
    features_y = features_y.to(device)
    
    # Compute dot product kernels
    K = torch.matmul(features_x, features_x.t())
    L = torch.matmul(features_y, features_y.t())
    
    # Center the kernels
    Kc = centering(K)
    Lc = centering(L)
    
    # Compute trace of products
    tr_KcLc = torch.sum(Kc * Lc)
    tr_KcKc = torch.sum(Kc * Kc)
    tr_LcLc = torch.sum(Lc * Lc)
    
    cka_score = tr_KcLc / torch.sqrt(tr_KcKc * tr_LcLc)
    
    return cka_score.item()
