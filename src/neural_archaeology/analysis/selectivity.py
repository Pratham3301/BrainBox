
import torch


def compute_sparsity(activations: torch.Tensor, epsilon: float = 1e-6) -> torch.Tensor:
    """
    Computes the sparsity of each neuron (or channel) across a batch.
    
    Args:
        activations: Tensor of shape [Batch, Channels, Height, Width] or [Batch, Features]
        epsilon: Threshold below which an activation is considered exactly zero.
        
    Returns:
        Tensor of shape [Channels] (or [Features]) representing the % of time the component was inactive.
    """
    # Check if this is a Conv2d output [B, C, H, W]
    if len(activations.shape) == 4:
        # We want to compute sparsity per channel. 
        # A channel is "inactive" for a specific image if all spatial locations are <= epsilon.
        # However, a stricter definition of sparsity is the percentage of all spatial/batch elements that are zero.
        # We'll use the latter for more granular channel-level analysis.
        total_elements = activations.shape[0] * activations.shape[2] * activations.shape[3]
        inactive_count = (activations <= epsilon).sum(dim=(0, 2, 3))
        return inactive_count.float() / total_elements
        
    # Check if this is a Linear output [B, Features]
    elif len(activations.shape) == 2:
        total_elements = activations.shape[0]
        inactive_count = (activations <= epsilon).sum(dim=0)
        return inactive_count.float() / total_elements
        
    else:
        raise ValueError(f"Unsupported activation shape for sparsity: {activations.shape}")


def compute_class_selectivity(
    activations: torch.Tensor, 
    labels: torch.Tensor, 
    num_classes: int = 10,
    epsilon: float = 1e-6
) -> torch.Tensor:
    """
    Computes the selectivity score for each channel/neuron per class.
    Selectivity_c = (mu_c - mu_not_c) / (mu_c + mu_not_c + epsilon)
    
    Args:
        activations: Tensor of shape [Batch, Channels, H, W] or [Batch, Features]
        labels: Tensor of shape [Batch] containing class indices
        num_classes: Total number of classes
        
    Returns:
        Tensor of shape [Channels, num_classes] (or [Features, num_classes])
    """
    # Reduce spatial dimensions if necessary to get mean channel activation per image
    if len(activations.shape) == 4:
        # Shape: [Batch, Channels]
        acts_flat = activations.mean(dim=(2, 3))
    elif len(activations.shape) == 2:
        acts_flat = activations
    else:
         raise ValueError(f"Unsupported activation shape: {activations.shape}")
         
    num_features = acts_flat.shape[1]
    selectivity_scores = torch.zeros((num_features, num_classes), device=activations.device)
    
    for c in range(num_classes):
        # Mask for the current class
        mask_c = (labels == c)
        mask_not_c = (labels != c)
        
        # If a class is entirely missing in this batch, skip it to avoid NaN
        if mask_c.sum() == 0 or mask_not_c.sum() == 0:
            continue
            
        # Mean activation for this class across the batch
        mu_c = acts_flat[mask_c].mean(dim=0)
        # Mean activation for all OTHER classes
        mu_not_c = acts_flat[mask_not_c].mean(dim=0)
        
        # Compute selectivity score (bound between -1 and 1)
        score = (mu_c - mu_not_c) / (mu_c + mu_not_c + epsilon)
        selectivity_scores[:, c] = score
        
    return selectivity_scores
