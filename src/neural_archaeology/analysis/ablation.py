import random

import torch
from torch.utils.data import DataLoader

from neural_archaeology.instrumentation.hooks import InstrumentationEngine


class AblationExperiment:
    """
    Executes a scientifically rigorous causal ablation experiment.
    Computes the baseline performance, the intervened performance, and a random control baseline.
    """
    def __init__(self, model: torch.nn.Module, engine: InstrumentationEngine):
        self.model = model
        self.engine = engine

    def _evaluate(self, dataloader: DataLoader, device: str) -> float:
        """Helper function to compute accuracy on a dataloader."""
        correct = 0
        total = 0
        with torch.no_grad():
            for images, labels in dataloader:
                images, labels = images.to(device), labels.to(device)
                outputs = self.model(images)
                _, predicted = torch.max(outputs.data, 1)
                total += labels.size(0)
                correct += (predicted == labels).sum().item()
        return correct / total

    def run_single_component_ablation(
        self, 
        layer_name: str, 
        component_idx: int, 
        num_components: int,
        dataloader: DataLoader, 
        device: str = "cpu"
    ) -> dict[str, float]:
        """
        Ablates a single component (neuron or channel) and compares it to a random control.
        """
        self.model.to(device)
        self.model.eval()
        self.engine.clear_hooks()

        print("1/3: Measuring Baseline Accuracy...")
        baseline_acc = self._evaluate(dataloader, device)

        print(f"2/3: Measuring Ablated Accuracy (Target: {layer_name}, Idx: {component_idx})...")
        self.engine.register_ablation_hook(layer_name, channels=[component_idx], replacement_value=0.0)
        ablated_acc = self._evaluate(dataloader, device)
        self.engine.clear_hooks()

        print("3/3: Measuring Random Control Baseline...")
        # Randomly select a different component
        control_idx = component_idx
        while control_idx == component_idx:
             control_idx = random.randint(0, num_components - 1)
             
        self.engine.register_ablation_hook(layer_name, channels=[control_idx], replacement_value=0.0)
        control_acc = self._evaluate(dataloader, device)
        self.engine.clear_hooks()

        # Calculate Deltas
        delta_target = baseline_acc - ablated_acc
        delta_control = baseline_acc - control_acc

        return {
            "baseline_accuracy": baseline_acc,
            "target_ablation_accuracy": ablated_acc,
            "control_ablation_accuracy": control_acc,
            "delta_target": delta_target,
            "delta_control": delta_control,
            "causal_impact": delta_target - delta_control # True causal effect minus random noise
        }
