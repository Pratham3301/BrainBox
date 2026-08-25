import React, { useState } from 'react';
import { Network, BookOpen, ChevronRight, ChevronDown, Terminal, Database, ShieldAlert, Cpu, Activity, Eye, Brain, Layers, FlaskConical, Lock, BarChart3, Target, Microscope, FileCode, Server, Gauge } from 'lucide-react';

type SectionType = 'methodology' | 'docs';

interface MindmapNode {
  id: string;
  title: string;
  description: string;
  details: string[];
  color?: string;
  icon?: string;
  children?: MindmapNode[];
}

const METHODOLOGY_DATA: MindmapNode = {
  id: 'root',
  title: 'Neural Archaeology Scientific Methodology',
  description: 'The overarching scientific framework dictating rigorous analysis of artificial neural networks. Every experiment conducted within BrainBox is governed by these principles.',
  details: [
    'CORE AXIOM: All experiments must strictly adhere to falsifiable hypothesis testing. If a claim cannot be disproven by experiment, it is not science — it is narrative.',
    'GOLDEN RULE: Correlation does not equal causation. Observation without intervention proves nothing about mechanism. Use causal intervention to establish functional links.',
    'REPRODUCIBILITY MANDATE: Every finding must be independently reproducible. Seeds are fixed, hardware is documented, and environments are isolated.',
    'TRANSPARENCY: All code, data transformations, and statistical tests must be open and auditable. No black-box claims are permitted.'
  ],
  children: [
    {
      id: 'causation',
      title: '1. Causation over Correlation',
      description: 'Moving beyond observational visualizations to active, surgical network interventions that prove mechanism.',
      color: 'var(--accent-red)',
      details: [
        'PRINCIPLE: Activation visualizations (max-activating images, saliency maps) only prove correlation with the dataset distribution. They do NOT prove that a neuron is functionally necessary for a behavior.',
        'RULE 1.A: Observational data (e.g. max activating images) is inherently biased by the dataset distribution. A neuron might fire for "dogs" simply because dogs co-occur with grass in the training set.',
        'RULE 1.B: Interventions (Ablation/Activation Patching/Steering) must be performed to isolate neuron functionality and establish necessity and sufficiency.',
        'IMPLEMENTATION NOTE: Mean-ablation (replacing activations with their expected value over a dataset) is preferred over zero-ablation to avoid shifting the network out of distribution, which can cause misleading cascading failures.'
      ],
      children: [
        {
          id: 'ablation',
          title: '1.1 Ablation Protocols',
          description: 'Standardized, reproducible methods for silencing network components to test causal necessity.',
          details: [
            '▸ Zero Ablation: Force activation vector to [0, 0, ...]. Fastest method but shifts the batch normalization statistics, potentially causing misleading cascade effects.',
            '▸ Mean Ablation: Replace with dataset-averaged activation. Mathematically rigorous because it preserves the expected value of downstream computations.',
            '▸ Resample Ablation: Sample activation from a separate, uncorrelated forward pass. The gold standard for isolating the contribution of a specific input.',
            '▸ Activation Patching: Swap the activation from a "clean" run into a "corrupted" run (or vice versa) to test if restoring a single component is sufficient to recover behavior.',
            'EXECUTION PROTOCOL: Step 1: Identify target node (Neuron/Channel/Head). Step 2: Compute baseline behavior on evaluation dataset X. Step 3: Intercept forward pass via PyTorch hook. Step 4: Overwrite tensor with intervention value. Step 5: Measure delta in behavior Y (accuracy, token probability, output distribution).',
            'STATISTICAL REQUIREMENT: Report the full distribution of effects, not just the mean. Use bootstrapped confidence intervals (95%) over multiple batches.'
          ]
        },
        {
          id: 'steering',
          title: '1.2 Activation Steering',
          description: 'Injecting synthetic directional signals into the residual stream to test causal sufficiency.',
          details: [
            'MECHANISM: Instead of removing information (ablation tests necessity), steering ADDS a scaled direction vector `v` to the representation `h`: h\' = h + α·v. This tests sufficiency.',
            'VECTOR COMPUTATION: The steering vector `v` is computed as the difference between mean activations for two contrasting concepts: v = E[h|concept_A] - E[h|concept_B].',
            'CALIBRATION WARNING: Requires careful calibration of scaling factor `α`. Too small = no visible effect. Too large = destroys coherent generation by pushing the hidden state out of distribution.',
            'INJECTION LAYER: Typically injected at the midpoint of the network (e.g., Layer 6 of 12 in GPT-2) for maximum downstream propagation without early-layer interference.',
            'VALIDATION: A successful steering intervention should produce a consistent, interpretable behavioral change that is proportional to `α` and reversible when `α` is set to 0.'
          ]
        },
        {
          id: 'patching',
          title: '1.3 Activation Patching',
          description: 'Transplanting activations between forward passes to localize computation.',
          details: [
            'CLEAN-TO-CORRUPT: Run the model on a "clean" prompt where it behaves correctly, and a "corrupted" prompt where it fails. Patch clean activations into the corrupted run one component at a time.',
            'If patching component C restores correct behavior, then C is SUFFICIENT for the computation.',
            'CORRUPT-TO-CLEAN: Patch corrupted activations into the clean run. If patching component C breaks the correct behavior, then C is NECESSARY.',
            'GRANULARITY: Can be applied at the level of full layers, individual attention heads, MLP blocks, or even individual neuron dimensions.',
            'This is the primary technique used in Automated Circuit Discovery (e.g., ACDC, Edge Patching).'
          ]
        }
      ]
    },
    {
      id: 'controls',
      title: '2. Experimental Controls',
      description: 'Establishing statistically sound baselines to distinguish real findings from noise.',
      color: 'var(--accent-blue)',
      details: [
        'PRINCIPLE: A finding is only valid if it survives rigorous control testing against null hypotheses. Without controls, you are measuring your own confirmation bias.',
        'Every claim of "this component does X" must be accompanied by evidence that random/arbitrary components do NOT do X to the same degree.'
      ],
      children: [
        {
          id: 'ablation-control',
          title: '2.1 The Random-Node Baseline',
          description: 'Controlling for the general degradation of network capacity when ANY component is removed.',
          details: [
            'PROTOCOL: When ablating a specialized neuron (e.g., "curve detector") and observing a 5% drop in accuracy, you MUST also ablate N randomly selected neurons in the same layer and report the distribution of accuracy drops.',
            'FAILURE CASE: If the random neurons also cause a ~5% drop on average, the "curve detector" is not uniquely causal — you have only measured the general redundancy/fragility of that layer.',
            'STATISTICAL THRESHOLD: The target ablation must produce an effect size at least 2 standard deviations (2σ) greater than the mean of the random ablation distribution to be considered significant. For strong claims, use 3σ.',
            'SAMPLE SIZE: Minimum N=20 random ablations per target ablation. For publication-grade claims, N=100.'
          ]
        },
        {
          id: 'probe-control',
          title: '2.2 The Random-Network Baseline',
          description: 'Controlling for the expressivity of the linear probe itself.',
          details: [
            'PROBLEM: Linear probes can often "learn" to classify data even from random noise if the representation dimension is high enough. A high probe accuracy does NOT necessarily mean the network has learned a concept.',
            'CONTROL PROTOCOL: Instantiate a network with identical architecture but randomly initialized (untrained) weights. Train the same linear probe on the untrained network\'s representations. Compare accuracy.',
            'INTERPRETATION: The "true signal" is: trained_probe_accuracy - random_probe_accuracy. If this difference is small, the probe is exploiting high-dimensional geometry, not learned representations.',
            'ADDITIONAL CONTROL (Selectivity): Compare the probe\'s accuracy on the target concept vs. its accuracy on a maximally different concept using the same representations. High selectivity = genuine encoding.'
          ]
        },
        {
          id: 'statistical',
          title: '2.3 Statistical Rigor',
          description: 'The statistical machinery underpinning all experimental claims.',
          details: [
            'MULTIPLE COMPARISONS: When testing many neurons/heads, apply Bonferroni correction or False Discovery Rate (FDR) control to avoid p-hacking.',
            'EFFECT SIZE: Always report Cohen\'s d or equivalent alongside p-values. A statistically significant but tiny effect is not scientifically meaningful.',
            'CONFIDENCE INTERVALS: Report bootstrapped 95% CIs. Point estimates alone are insufficient.',
            'NON-PARAMETRIC TESTS: When normality cannot be assumed (common with neural network metrics), use Wilcoxon signed-rank or Mann-Whitney U tests instead of t-tests.'
          ]
        }
      ]
    },
    {
      id: 'stability',
      title: '3. Seed & Hardware Stability',
      description: 'Ensuring findings reflect fundamental properties, not artifacts of initialization or compute.',
      color: 'var(--accent-green)',
      details: [
        'PRINCIPLE: Deep learning is stochastic. Weight initialization, data ordering, and dropout masks all introduce randomness. We must isolate fundamental algorithmic properties from idiosyncratic noise.',
        'Hardware differences (CPU vs GPU, CUDA versions, different GPU architectures) can cause floating-point discrepancies that alter results.'
      ],
      children: [
        {
          id: 'multi-seed',
          title: '3.1 Multi-Seed Verification',
          description: 'Testing architectural claims across independent training trajectories.',
          details: [
            'REQUIREMENT: Any claim of structural universality (e.g. "early layers learn Gabor filters", "Layer 3 learns syntax") must be verified on N ≥ 3 identical models trained with different random seeds.',
            'ARTIFACT REJECTION: If a feature only appears in Seed 1, it is an idiosyncratic artifact of that specific training trajectory, not a general property of the architecture.',
            'CONVERGENCE ANALYSIS: Report the variance of key metrics across seeds. High variance indicates the finding is unstable and may not generalize.',
            'SEED FIXING: Use torch.manual_seed(), torch.cuda.manual_seed_all(), np.random.seed(), and random.seed() with the same value for full reproducibility within a single run.'
          ]
        },
        {
          id: 'hardware-iso',
          title: '3.2 Hardware Isolation',
          description: 'Managing floating-point discrepancies and ensuring deterministic execution.',
          details: [
            'FP32 ISSUE: Floating-point operations differ between CPUs and GPUs. CUDA optimizes operation ordering (fused multiply-add), which alters the least significant bits of results.',
            'DETERMINISM: Experiments must set torch.backends.cudnn.deterministic = True and torch.backends.cudnn.benchmark = False. Note: this can reduce performance by 10-30%.',
            'DOCUMENTATION: All reproducibility checks must explicitly state: GPU model (e.g., NVIDIA RTX 4090), CUDA version (e.g., 12.1), cuDNN version, PyTorch version, and OS.',
            'CROSS-HARDWARE: Claims should ideally be verified on at least 2 different hardware configurations (e.g., A100 vs RTX 4090, or GPU vs CPU).'
          ]
        }
      ]
    },
    {
      id: 'workflow',
      title: '4. Experimental Workflow',
      description: 'The step-by-step lifecycle of every experiment in BrainBox.',
      color: 'var(--accent-purple)',
      details: [
        'Every experiment follows a strict lifecycle from hypothesis to archival.'
      ],
      children: [
        {
          id: 'hypothesis',
          title: '4.1 Hypothesis Formulation',
          description: 'Defining a precise, falsifiable claim before touching any code.',
          details: [
            'FORMAT: "If I [intervention], then [measurable outcome] will change by [predicted magnitude]."',
            'EXAMPLE: "If I zero-ablate attention head L5H3, then the model\'s accuracy on subject-verb agreement will drop by more than 10%, while accuracy on sentiment classification will remain within 2% of baseline."',
            'PRE-REGISTRATION: The hypothesis must be written BEFORE running the experiment. Post-hoc narratives ("we found that...") are exploratory, not confirmatory.',
            'NULL HYPOTHESIS: Explicitly state the null: "Ablating L5H3 will have no statistically significant effect on subject-verb agreement accuracy compared to random head ablation."'
          ]
        },
        {
          id: 'execution',
          title: '4.2 Execution & Data Collection',
          description: 'Running the experiment with full instrumentation.',
          details: [
            'ENVIRONMENT: Lock all dependencies (pip freeze > requirements.txt). Record the exact git commit hash.',
            'INSTRUMENTATION: Use the InstrumentationEngine with context managers to ensure all hooks are automatically cleaned up.',
            'MEMORY MANAGEMENT: For large models, stream activations to disk in safetensors format. Never hold more than 2GB of activations in RAM.',
            'LOGGING: Every experiment generates a UUID folder: metadata.json (config), metrics.parquet (results), and plots/ (visualizations).',
            'IMMUTABILITY: Once an experiment completes, its folder is NEVER modified. New analyses create new experiment folders.'
          ]
        },
        {
          id: 'analysis',
          title: '4.3 Analysis & Reporting',
          description: 'Interpreting results with full transparency.',
          details: [
            'VISUALIZATION: Use Plotly for interactive plots, Matplotlib for publication-quality figures. Always include axis labels, titles, and legends.',
            'ERROR BARS: All bar charts and line plots must include error bars (95% CI or ±1 std).',
            'NEGATIVE RESULTS: Report experiments that failed to reject the null hypothesis. Negative results are as valuable as positive ones and prevent the community from wasting time on dead ends.',
            'ARCHIVAL: All experiment artifacts are persisted to the experiments/ directory and can be queried programmatically.'
          ]
        }
      ]
    }
  ]
};

const DOCUMENTATION_DATA = [
  {
    category: 'Architecture: Core System',
    icon: <Database size={22} />,
    color: 'var(--accent-blue)',
    items: [
      {
        title: 'Model Registry',
        icon: <Layers size={18} />,
        content: `The Model Registry (src/models/) is the central repository for all analyzed architectures. It enforces strict separation of concerns between model weights, graph topology, and forward-pass execution.

KEY DESIGN DECISIONS:
• Every model must inherit from BaseAnalyzableModel, which exposes a standardized interface for hook registration, layer enumeration, and weight access.
• Models register their computational graph as a nested dictionary, exposing named hook points at every layer boundary.
• Weights are lazy-loaded via memory mapping (mmap) to prevent RAM saturation when loading model ensembles for comparative analysis.

SUPPORTED ARCHITECTURES:
• Vision: ResNet-18/50, VGG-16, EfficientNet (CNN family)
• Language: GPT-2 (Small/Medium), BERT-base (Transformer family)
• Audio: SpeechT5 (Encoder-Decoder Transformer)

HOOK POINT NAMING CONVENTION:
  model.layer1        → First residual block
  model.layer1.0.conv1 → First conv in first block
  model.transformer.h[i] → Transformer block i
  model.transformer.h[i].attn → Attention module in block i`
      },
      {
        title: 'Instrumentation Engine',
        icon: <Microscope size={18} />,
        content: `The data collection layer (src/neural_archaeology/instrumentation/) uses PyTorch forward/backward hooks to intercept activations during live inference.

ARCHITECTURE:
• InstrumentationEngine: For CNN models (ResNet). Registers hooks on named modules.
• TransformerEngine: For Transformer models (GPT-2). Provides head-level ablation and attention capture.

CRITICAL IMPLEMENTATION DETAILS:
• Hook registration uses context managers (with instrument(model): ...) to guarantee hooks are always removed, preventing memory leaks in long-running sessions.
• Activations are captured and immediately moved to CPU RAM via non-blocking streams: tensor.to('cpu', non_blocking=True).
• Memory Manager: If accumulated activations exceed 2GB, the buffer is automatically flushed to disk in safetensors format (not pickle — see Security).
• Backward hooks capture gradients for feature importance and input sensitivity analysis (e.g., integrated gradients).

THREAD SAFETY:
• All experiment endpoints acquire an ablation_lock (threading.Lock) before modifying model state, preventing race conditions in concurrent API requests.`
      }
    ]
  },
  {
    category: 'Analysis & Operations',
    icon: <Activity size={22} />,
    color: 'var(--accent-purple)',
    items: [
      {
        title: 'Intervention Engine',
        icon: <Target size={18} />,
        content: `The causal intervention system (src/neural_archaeology/analysis/ablation.py) performs surgical modifications to the forward pass.

SUPPORTED INTERVENTION TYPES:
1. ZERO ABLATION — Set activations to 0
2. MEAN ABLATION — Replace with dataset mean
3. NOISE INJECTION — Add Gaussian noise (σ configurable)
4. ACTIVATION PATCHING — Swap activations between runs
5. ACTIVATION STEERING — Add directional vector to residual stream

EXECUTION PIPELINE:
Step 1: Target Selection
  Define targets as (layer_name, channel_indices) for CNNs
  or (layer_idx, head_idx) for Transformers.

Step 2: Baseline Measurement
  Run full forward pass without intervention. Record predictions, accuracies, and internal metrics.

Step 3: Hook Injection
  Register a pre-forward hook that intercepts the target layer's output tensor.

Step 4: Tensor Overwrite
  tensor[..., target_indices] = intervention_value
  Gradient tracking is automatically disabled for the intervened slice.

Step 5: Measurement
  Run intervened forward pass. Compare to baseline.

Step 6: Cleanup
  engine.clear_hooks() removes all registered hooks.`
      },
      {
        title: 'Probing Subsystem',
        icon: <FlaskConical size={18} />,
        content: `Trains linear classifiers on frozen intermediate representations to decode semantic concepts (src/neural_archaeology/analysis/probing.py).

PURPOSE: Test whether a specific layer has learned to encode a particular concept (e.g., "does Layer 3 encode part-of-speech?").

RIGOROUS PROBING PROTOCOL:
1. DATA SPLITTING
   Always use a strict Train/Val/Test split (60/20/20).
   NEVER probe on the same dataset used to train the original model.

2. PROBE ARCHITECTURE
   Use a single-layer linear classifier (logistic regression).
   Non-linear probes (MLPs) can "create" information and give false positives.

3. REGULARIZATION
   Apply L2 regularization (Ridge, C=1.0) to prevent overfitting to high-dimensional noise.

4. EARLY STOPPING
   Monitor validation loss. Stop training if val_loss does not improve for 5 epochs.

5. DIMENSIONALITY REDUCTION
   If layer dimension > 4096, apply PCA (retaining 99% variance) before probing for numerical stability.

6. CONTROL (Critical!)
   Always compare to a probe trained on a randomly initialized model's representations (see Methodology §2.2).

METRICS REPORTED:
• Train Accuracy, Test Accuracy (gap indicates overfitting)
• Mean Sparsity (fraction of dead neurons)
• Selectivity Score (how specific is the representation)`
      }
    ]
  },
  {
    category: 'Similarity & Metrics',
    icon: <BarChart3 size={22} />,
    color: 'var(--accent-cyan)',
    items: [
      {
        title: 'CKA Similarity Analysis',
        icon: <Network size={18} />,
        content: `Centered Kernel Alignment (CKA) measures representational similarity between layers (src/neural_archaeology/analysis/similarity.py).

WHAT IT ANSWERS:
"How similar are the representations learned by Layer A and Layer B?"

MATHEMATICAL FOUNDATION:
CKA(X, Y) = HSIC(X, Y) / sqrt(HSIC(X, X) · HSIC(Y, Y))

Where HSIC is the Hilbert-Schmidt Independence Criterion. We use the linear kernel for computational efficiency.

INTERPRETATION:
• CKA ≈ 1.0 → Layers encode nearly identical information
• CKA ≈ 0.0 → Layers encode completely different information
• Diagonal is always 1.0 (a layer is identical to itself)
• Adjacent layers typically have CKA > 0.8
• Early vs Late layers typically have CKA < 0.3

USAGE IN BRAINBOX:
The Similarity Lab computes a full NxN CKA matrix across all 4 ResNet layers, visualized as an interactive heatmap.`
      },
      {
        title: 'Sparsity & Selectivity Metrics',
        icon: <Gauge size={18} />,
        content: `Quantitative measures of how neurons encode information (src/neural_archaeology/analysis/selectivity.py).

SPARSITY (Hoyer Metric):
Measures the fraction of neurons that are "dead" (activation ≈ 0) for a given input batch.
• Sparsity = 0.0 → All neurons fire (dense encoding)
• Sparsity = 1.0 → No neurons fire (completely sparse)
• Typical healthy range: 0.3 – 0.7

HIGH SPARSITY IMPLICATIONS:
Sparse representations are thought to be more interpretable because each neuron is responsible for fewer concepts. However, extreme sparsity (>0.95) may indicate dying neurons (training pathology).

CLASS SELECTIVITY INDEX (CSI):
Measures how selective a neuron is for a specific class.
CSI(neuron_i, class_c) = (μ_c - μ_¬c) / (μ_c + μ_¬c)

• CSI = +1.0 → Perfectly selective (fires only for class c)
• CSI = -1.0 → Anti-selective (fires for everything except class c)
• CSI = 0.0 → Non-selective (fires equally for all classes)

USAGE: The Vision Lab displays per-neuron sparsity and the Probe Lab reports layer-level mean sparsity.`
      }
    ]
  },
  {
    category: 'Infrastructure & Safety',
    icon: <Terminal size={22} />,
    color: 'var(--accent-orange)',
    items: [
      {
        title: 'Experiment Tracking',
        icon: <FileCode size={18} />,
        content: `A lightweight, filesystem-based tracking system that avoids heavy database dependencies.

FOLDER STRUCTURE:
experiments/
  └── {experiment_uuid}_{timestamp}/
      ├── metadata.json
      │   ├── git_commit: "a1b2c3d"
      │   ├── python_version: "3.13.7"
      │   ├── torch_version: "2.5.0"
      │   ├── cuda_version: "12.1"
      │   ├── gpu_model: "RTX 4090"
      │   ├── seeds: { torch: 42, numpy: 42, python: 42 }
      │   └── hyperparameters: { ... }
      ├── metrics.parquet
      │   └── Columnar storage for numerical results
      ├── plots/
      │   ├── attention_heatmap.svg
      │   └── ablation_impact.pdf
      └── logs.txt
          └── Full execution trace (DEBUG level)

IMMUTABILITY RULE:
Once an experiment folder is created and the run completes, it is NEVER modified. If you need to re-analyze, create a new experiment that references the original UUID.

QUERYING:
Experiments can be loaded and compared programmatically using pandas: pd.read_parquet("experiments/*/metrics.parquet")`
      },
      {
        title: 'Security & Sandboxing',
        icon: <Lock size={18} />,
        content: `Neural network weights are code. Loading untrusted models is equivalent to running untrusted executables.

THREAT MODEL:
• Pickle deserialization can execute arbitrary Python code
• Malicious models can exfiltrate data during forward passes
• Large models can cause OOM kills that crash the host

SECURITY PROTOCOLS:
1. NO PICKLE — Strict prohibition of the pickle module for loading weights. All models MUST use safetensors format (safe, fast, zero-copy).

2. EXECUTION SANDBOXING — Analysis scripts should run in isolated Docker containers with:
   • No network access during analysis
   • Read-only filesystem except for the output directory
   • Memory limits enforced via cgroups

3. MEMORY QUOTAS — The InstrumentationEngine monitors psutil.virtual_memory(). If RAM usage exceeds 90%, the process triggers an Emergency Flush (write activations to disk) and gracefully aborts to prevent OS lockup.

4. INPUT VALIDATION — All API inputs are validated via Pydantic models. Layer names are checked against the model registry. Channel indices are bounds-checked.

5. RATE LIMITING — Concurrent experiment execution is serialized via ablation_lock to prevent resource exhaustion.`
      }
    ]
  },
  {
    category: 'API Reference',
    icon: <Server size={22} />,
    color: 'var(--accent-green)',
    items: [
      {
        title: 'Vision Endpoints',
        icon: <Eye size={18} />,
        content: `REST API for vision model analysis (ResNet-18).

GET /api/model/layers
  Returns: Model name, layer list with types and channel counts.

POST /api/experiment/ablate
  Body: { layer_name, component_idx, num_components }
  Returns: baseline_accuracy, target_ablation_accuracy, causal_impact, thought_shifts (per-image prediction changes), top_evidence (max-activating images).

GET /api/experiment/visualize/{layer}/{channel}
  Returns: Synthetic "dream" image that maximally activates the specified channel (feature visualization via gradient ascent, 150 steps, lr=0.05).

POST /api/experiment/inception
  Body: { layer_name, intensity }
  Returns: Per-image prediction flips caused by injecting a constant activation value into all channels of the target layer.

GET /api/experiment/similarity
  Returns: 4x4 CKA similarity matrix across all ResNet layers.

GET /api/experiment/probe
  Returns: Per-layer probe accuracy, test accuracy, and mean sparsity.`
      },
      {
        title: 'Language & Safety Endpoints',
        icon: <Brain size={18} />,
        content: `REST API for Transformer analysis (GPT-2) and safety testing.

GET /api/transformer/info
  Returns: Model name, num_layers (12), num_heads (12), vocab_size (50257).

POST /api/transformer/ablate
  Body: { prompt, layer_idx, head_idx }
  Returns: Baseline and ablated next-token predictions, attention matrix for the specified head.

POST /api/transformer/chat
  Body: { prompt, max_tokens, ablations[], vector_type, intensity }
  Returns: Generated text with optional head ablations and activation steering applied.

POST /api/experiment/discover_circuit
  Body: { prompt, target_token }
  Returns: Top 10 most critical attention heads for predicting the target token, ranked by probability drop when ablated.

POST /api/safety/steer
  Body: { prompt, vector_type, intensity }
  Returns: Baseline and steered generated text.

POST /api/safety/batch_steer
  Body: { prompts[], vector_type, intensity }
  Returns: Per-prompt baseline/steered text with divergence detection.`
      }
    ]
  }
];

const LEVEL_COLORS = [
  'var(--accent-cyan)',
  'var(--accent-red)',
  'var(--accent-blue)',
  'var(--accent-green)',
  'var(--accent-purple)',
];

const MindmapNodeComponent: React.FC<{ node: MindmapNode; level: number }> = ({ node, level }) => {
  const [isExpanded, setIsExpanded] = useState(level < 1);
  const color = node.color || LEVEL_COLORS[level % LEVEL_COLORS.length];

  return (
    <div className="mindmap-node-container" style={{ margin: level === 0 ? '0' : '20px 0 0 0' }}>
      <div
        className="mindmap-node-panel"
        style={{
          border: `4px solid ${level === 0 ? '#000' : color}`,
          borderLeftWidth: level === 0 ? '4px' : '10px',
          padding: level === 0 ? '30px' : '20px',
          background: 'var(--panel-bg)',
          boxShadow: level === 0 ? `12px 12px 0px ${color}` : `6px 6px 0px #000`,
          position: 'relative',
          transition: 'all 0.3s ease'
        }}
      >
        {/* Header acts as toggle */}
        <div
          className="node-header"
          onClick={() => setIsExpanded(!isExpanded)}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}
        >
          {node.children && node.children.length > 0 ? (
            <span className="expand-icon" style={{
              background: isExpanded ? color : 'transparent',
              color: isExpanded ? '#000' : color,
              border: `3px solid ${color}`,
              width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              transition: 'all 0.2s'
            }}>
              {isExpanded ? <ChevronDown size={22} /> : <ChevronRight size={22} />}
            </span>
          ) : (
            <span style={{ width: '24px', height: '24px', background: color, border: '3px solid #000', borderRadius: '50%', flexShrink: 0 }}></span>
          )}

          <h3 style={{
            fontSize: level === 0 ? 'clamp(1.5rem, 3vw, 2.2rem)' : level === 1 ? 'clamp(1.2rem, 2.5vw, 1.6rem)' : '1.2rem',
            margin: 0, textTransform: 'uppercase', flexGrow: 1, fontWeight: 900
          }}>
            {node.title}
          </h3>

          {!isExpanded && node.children && (
            <span style={{ fontSize: '0.75rem', background: '#000', color: color, padding: '6px 12px', fontWeight: 900, letterSpacing: '2px', border: `2px solid ${color}`, whiteSpace: 'nowrap' }}>
              {node.children.length} SUB-PROTOCOLS
            </span>
          )}
        </div>

        <p className="node-desc" style={{
          fontSize: '1.1rem', fontWeight: 'bold', margin: '15px 0 0 0',
          paddingLeft: (node.children && node.children.length > 0) ? '47px' : '39px',
          color: 'var(--text)'
        }}>
          {node.description}
        </p>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="node-expanded-content" style={{ paddingLeft: level === 0 ? '0' : '15px' }}>
            <div className="node-details" style={{
              margin: '25px 0', padding: '25px',
              background: 'rgba(0,0,0,0.02)',
              border: '3px solid var(--text)',
              borderLeft: `6px solid ${color}`,
              boxShadow: 'inset 4px 4px 0px rgba(0,0,0,0.03)'
            }}>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {node.details.map((detail, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', fontSize: '1rem', fontWeight: 'bold', lineHeight: 1.6 }}>
                    <span style={{ color: color, marginRight: '12px', marginTop: '2px', flexShrink: 0 }}>
                      <Activity size={18} />
                    </span>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Render children INSIDE the parent box, creating nested panels */}
            {node.children && (
              <div className="mindmap-children" style={{
                marginTop: '30px',
                paddingLeft: level === 0 ? '0' : '20px',
                borderLeft: level === 0 ? 'none' : `4px dashed ${color}40`,
                display: 'flex', flexDirection: 'column', gap: '10px'
              }}>
                {node.children.map(child => (
                  <MindmapNodeComponent key={child.id} node={child} level={level + 1} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default function DocumentationLab() {
  const [activeView, setActiveView] = useState<SectionType>('methodology');

  return (
    <div className="docs-lab-container fade-in">

      {/* Comic Banner Header */}
      <div style={{ background: '#000', color: 'var(--accent-cyan)', padding: '10px 0', textAlign: 'center', fontWeight: 900, fontSize: '0.8rem', letterSpacing: '3px', textTransform: 'uppercase', borderBottom: '4px solid var(--accent-cyan)', marginBottom: '30px' }}>
        /// CLASSIFIED DOCUMENTATION /// NEURAL ARCHAEOLOGY RESEARCH PROTOCOLS /// AUTHORIZED PERSONNEL ONLY ///
      </div>

      <div className="docs-header">
        <div style={{ display: 'inline-block', background: 'var(--accent-red)', color: '#fff', padding: '4px 14px', fontWeight: 900, fontSize: '0.75rem', letterSpacing: '3px', textTransform: 'uppercase', border: '2px solid #000', marginBottom: '15px' }}>
          ISSUE #00 — THE REFERENCE MANUAL
        </div>
        <h1>
          <BookOpen size={36} className="inline-icon" />
          Documentation & Methodology
        </h1>
        <p>The definitive, exhaustively detailed guide to the Neural Archaeology platform's scientific rigor and system architecture.</p>

        <div className="docs-toggle">
          <button
            className={`toggle-btn ${activeView === 'methodology' ? 'active' : ''}`}
            onClick={() => setActiveView('methodology')}
          >
            <Network size={18} />
            Methodology Mindmap
          </button>
          <button
            className={`toggle-btn ${activeView === 'docs' ? 'active' : ''}`}
            onClick={() => setActiveView('docs')}
          >
            <Terminal size={18} />
            Technical Documentation
          </button>
        </div>
      </div>

      <div className="docs-content">
        {activeView === 'methodology' ? (
          <>
            <div className="info-box blue" style={{ minHeight: '160px' }}>
              <ShieldAlert size={28} color="var(--text)" style={{ flexShrink: 0 }} />
              <div>
                <p style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text)' }}><strong>⚡ INTERACTIVE METHODOLOGY MAP</strong></p>
                <p style={{ margin: '8px 0 0 0', color: 'var(--text)' }}>Click any node to expand its sub-protocols. Each node contains detailed instructions, statistical requirements, and implementation specifics. The tree covers the full scientific workflow from hypothesis formulation through analysis and reporting.</p>
              </div>
            </div>
            <div className="mindmap-wrapper">
              <div className="mindmap-canvas">
                <MindmapNodeComponent node={METHODOLOGY_DATA} level={0} />
              </div>
            </div>
          </>
        ) : (
          <div className="detailed-docs-wrapper">
            <div className="info-box blue" style={{ minHeight: '160px' }}>
              <Cpu size={28} color="var(--text)" style={{ flexShrink: 0 }} />
              <div>
                <p style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text)' }}><strong><Microscope size={18} style={{verticalAlign: 'text-bottom', marginRight: 6}} /> TECHNICAL DEEP DIVE</strong></p>
                <p style={{ margin: '8px 0 0 0', color: 'var(--text)' }}>Exhaustive structural documentation covering every component: model registry, instrumentation, analysis engines, similarity metrics, experiment tracking, security protocols, and the complete API reference.</p>
              </div>
            </div>

            {DOCUMENTATION_DATA.map((section, idx) => (
              <div key={idx} className="doc-section">
                <h2 className="doc-section-title" style={{ borderBottomColor: section.color }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: section.color, color: '#000', width: '36px', height: '36px', border: '2px solid #000', flexShrink: 0 }}>
                    {section.icon}
                  </span>
                  {section.category}
                </h2>
                <div className="doc-items-grid">
                  {section.items.map((item, i) => (
                    <div key={i} className="doc-card hover-3d">
                      <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {item.icon}
                        {item.title}
                      </h3>
                      <pre className="doc-content-text">
                        {item.content}
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
