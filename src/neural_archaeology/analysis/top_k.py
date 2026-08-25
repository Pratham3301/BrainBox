
import torch
from torch.utils.data import DataLoader
from tqdm import tqdm

from neural_archaeology.instrumentation.hooks import InstrumentationEngine


class TopKExtractor:
    """
    Scans a dataset to find the top-K highest activating examples for each channel in a specific layer.
    """
    def __init__(self, model: torch.nn.Module, engine: InstrumentationEngine):
        self.model = model
        self.engine = engine

    def extract(self, layer_name: str, dataloader: DataLoader, top_k: int = 10, device: str = "cpu") -> dict[int, list[dict]]:
        """
        Runs the dataloader through the model and keeps track of the top-K highest activations
        for every channel in the target layer.
        
        Returns:
            Dict mapping channel_idx -> List of dicts: {'score': float, 'image': Tensor, 'label': int}
        """
        self.engine.clear_hooks()
        self.engine.register_capture_hook(layer_name)
        self.model.to(device)
        self.model.eval()

        # Dictionary to store a min-heap (or just sorted list) for each channel
        # channel_idx -> [(score, image, label), ...]
        top_examples = {}
        
        print(f"Scanning dataset for Top-{top_k} examples in {layer_name}...")
        
        with torch.no_grad():
            for images, labels in tqdm(dataloader):
                images = images.to(device)
                _ = self.model(images)
                
                # Captured shape: [Batch, Channels, H, W] or [Batch, Features]
                activations = self.engine.activations[layer_name]
                
                if len(activations.shape) == 4:
                    # Spatial mean for Conv layers to get a single score per channel per image
                    batch_scores = activations.mean(dim=(2, 3)).cpu()
                else:
                    batch_scores = activations.cpu()
                    
                num_channels = batch_scores.shape[1]
                
                if not top_examples:
                    # Initialize empty lists for each channel
                    top_examples = {c: [] for c in range(num_channels)}
                
                # Iterate through batch
                for batch_idx in range(images.shape[0]):
                    img = images[batch_idx].cpu()
                    label = labels[batch_idx].item()
                    
                    for c in range(num_channels):
                        score = batch_scores[batch_idx, c].item()
                        
                        # Maintain top-k list
                        channel_list = top_examples[c]
                        if len(channel_list) < top_k:
                            channel_list.append({'score': score, 'image': img, 'label': label})
                            channel_list.sort(key=lambda x: x['score'], reverse=True)
                        elif score > channel_list[-1]['score']:
                            channel_list[-1] = {'score': score, 'image': img, 'label': label}
                            channel_list.sort(key=lambda x: x['score'], reverse=True)
                            
        self.engine.clear_hooks()
        self.engine.clear_activations()
        return top_examples
