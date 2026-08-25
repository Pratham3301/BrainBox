# Core Research Questions

Neural Archaeology is built to answer specific, scientifically rigorous questions about representation learning inside neural networks.

### RQ1 — Neuron Selectivity
Which neurons respond selectively to particular semantic or visual concepts?
*Are individual neurons polysemantic, or do they encode singular concepts?*

### RQ2 — Layer-wise Representation
How does information evolve across network layers?
*At what depth does the network transition from low-level feature extraction (e.g., edge detection) to high-level semantic representation?*

### RQ3 — Causal Importance
Which neurons/components are actually causally important rather than merely correlated with model behavior?
*If a highly selective neuron is ablated, does the network's predictive accuracy for that specific concept drop proportionally?*

### RQ4 — Representation Similarity
Do independently trained models learn similar internal representations?
*Given two identical architectures trained with different random seeds, do they converge on the same internal feature spaces (convergent learning)?*

### RQ5 — Redundancy
How much redundant computation exists inside the network?
*Can we ablate large clusters of neurons or entire attention heads without measurable loss in performance?*

### RQ6 — Robustness of Interpretations
Do discovered features remain meaningful across datasets, seeds, and model variants?
*Is a feature circuit universal, or an artifact of a specific training run?*
