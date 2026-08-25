
import numpy as np
import torch
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
from torch.utils.data import DataLoader
from tqdm import tqdm

from neural_archaeology.instrumentation.hooks import InstrumentationEngine


class LinearProbe:
    """
    Trains a linear classifier on top of frozen internal representations 
    to decode concepts at specific depths of the network.
    """
    def __init__(self, model: torch.nn.Module, engine: InstrumentationEngine):
        self.model = model
        self.engine = engine

    def _extract_dataset_activations(
        self, 
        layer_name: str, 
        dataloader: DataLoader, 
        device: str
    ) -> tuple[np.ndarray, np.ndarray]:
        """Runs the entire dataloader and aggregates activations into memory."""
        self.engine.clear_hooks()
        self.engine.register_capture_hook(layer_name)
        self.model.to(device)
        self.model.eval()

        all_activations = []
        all_labels = []

        with torch.no_grad():
            for images, labels in tqdm(dataloader, desc=f"Extracting {layer_name}"):
                images = images.to(device)
                _ = self.model(images)
                
                # Activations are [Batch, Channels, H, W] or [Batch, Features]
                acts = self.engine.activations[layer_name]
                
                # For linear probing, we usually flatten spatial dimensions or pool them.
                # Standard practice: Global Average Pooling (GAP) for Conv layers.
                if len(acts.shape) == 4:
                    acts = acts.mean(dim=(2, 3))
                    
                all_activations.append(acts.cpu().numpy())
                all_labels.append(labels.numpy())

        self.engine.clear_hooks()
        self.engine.clear_activations()
        
        X = np.vstack(all_activations)
        y = np.concatenate(all_labels)
        return X, y

    def train_and_evaluate(
        self, 
        layer_name: str, 
        train_loader: DataLoader, 
        test_loader: DataLoader, 
        device: str = "cpu"
    ) -> dict[str, float]:
        """
        Trains a logistic regression probe and evaluates its accuracy.
        """
        print(f"Extracting training representations for {layer_name}...")
        X_train, y_train = self._extract_dataset_activations(layer_name, train_loader, device)
        
        print(f"Extracting testing representations for {layer_name}...")
        X_test, y_test = self._extract_dataset_activations(layer_name, test_loader, device)
        
        print("Training linear probe (Logistic Regression)...")
        # Use limited iterations for speed during testing, in reality use lbfgs or increase max_iter
        clf = LogisticRegression(max_iter=1000, n_jobs=-1)
        clf.fit(X_train, y_train)
        
        train_acc = accuracy_score(y_train, clf.predict(X_train))
        test_acc = accuracy_score(y_test, clf.predict(X_test))
        
        return {
            "probe_train_accuracy": train_acc,
            "probe_test_accuracy": test_acc
        }
