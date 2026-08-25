# Experiment Protocol

Every experiment run through Neural Archaeology must follow this standard protocol.

## 1. Hypothesis Formulation
The experiment must start with a clearly defined hypothesis. 
*Example: "Neuron 42 in Layer 3 is causally responsible for detecting 'dog' features, and its ablation will disproportionately reduce accuracy on the 'dog' class."*

## 2. Configuration Definition
All hyperparameters, paths, random seeds, and intervention settings must be declared in a `config.yaml` file before execution.

## 3. Model Execution & Instrumentation
1. The system loads the designated checkpoint.
2. Forward hooks are registered.
3. The dataset is passed through the model (batched).
4. Target activations/gradients are extracted and saved.

## 4. Intervention (If Applicable)
If the experiment involves ablation:
1. Baseline accuracy is recorded.
2. The intervention hook modifies the targeted component during a second forward pass.
3. Intervened accuracy is recorded.
4. The random-baseline ablation is executed and recorded.

## 5. Statistical Analysis
Metrics are computed (mean, std, $\Delta$ accuracy).

## 6. Report Generation
A structured JSON report is generated and saved to the experiment's unique directory.
