# Metrics

This document defines the mathematical definitions for all quantitative measurements used in the system.

## 1. Sparsity
The percentage of time a neuron's activation is exactly zero (or below a tiny $\epsilon$ threshold) across a given dataset.
$$ Sparsity = \frac{1}{N} \sum_{i=1}^{N} \mathbb{1}(a_i \le \epsilon) $$

## 2. Selectivity (Class-wise)
Measures how exclusively a neuron fires for a specific class versus all other classes.
$$ Selectivity_c = \frac{\mu_c - \mu_{not\_c}}{\mu_c + \mu_{not\_c} + \epsilon} $$
Where $\mu_c$ is the mean activation for class $c$.

## 3. Causal Impact ($\Delta$ Accuracy)
The change in task performance when a component is ablated.
$$ \Delta Acc = Acc_{baseline} - Acc_{ablated} $$
*(A positive value indicates the component was helpful for the task).*

## 4. Centered Kernel Alignment (CKA)
Used for Representation Similarity. Measures the similarity of representation spaces between two layers or two networks, independent of orthogonal transformations.
