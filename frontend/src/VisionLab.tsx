import { API_BASE_URL } from "./config";
import { useState } from 'react';
import { Eye, Brain, Activity, Image, Bot, X, Share2, Search } from 'lucide-react';

interface Layer {
  name: string;
  type: string;
  channels: number;
}

interface VisionLabProps {
  layers: Layer[];
}

export default function VisionLab({ layers }: VisionLabProps) {
  // Parse shared state from URL on initial load
  const [initialSharedState] = useState(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const stateParam = searchParams.get('state');
      return stateParam ? JSON.parse(atob(stateParam)) : null;
    } catch (e) {
      console.error("Failed to parse shared state", e);
      return null;
    }
  });

  const [selectedLayer, setSelectedLayer] = useState<string>(initialSharedState?.selectedLayer || 'layer4');
  const [selectedNeuron, setSelectedNeuron] = useState<number | null>(initialSharedState?.selectedNeuron ?? 0);
  const [ablationResult, setAblationResult] = useState<any>(null);
  const [hallucinationImage, setHallucinationImage] = useState<string | null>(null);
  const [inceptionResult, setInceptionResult] = useState<any>(null);
  const [loadingVision, setLoadingVision] = useState(false);
  const [loadingImg, setLoadingImg] = useState(false);
  const [loadingInception, setLoadingInception] = useState(false);
  const [hallucinationProgress, setHallucinationProgress] = useState(0);
  const [showGuide, setShowGuide] = useState(false);
  const [showCopied, setShowCopied] = useState(false);

  const handleShare = () => {
    const state = btoa(JSON.stringify({ selectedLayer, selectedNeuron }));
    const url = new URL(window.location.href);
    url.searchParams.set('state', state);
    navigator.clipboard.writeText(url.toString());
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  const getNumComponents = () => {
    const layer = layers.find(l => l.name === selectedLayer);
    return layer ? layer.channels : 512;
  };

  const runAblation = async () => {
    if (!selectedLayer || selectedNeuron === null) return;
    setLoadingVision(true);
    setAblationResult(null);
    try {
      const res = await fetch(API_BASE_URL + '/api/experiment/ablate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ layer_name: selectedLayer, component_idx: selectedNeuron, num_components: getNumComponents() })
      });
      setAblationResult(await res.json());
    } catch (e) { console.error(e); }
    setLoadingVision(false);
  };

  const runHallucination = async () => {
    if (!selectedLayer || selectedNeuron === null) return;
    setLoadingImg(true);
    setHallucinationImage(null);
    setHallucinationProgress(0);
    
    const interval = setInterval(() => {
      setHallucinationProgress(prev => {
        if (prev >= 95) return prev;
        return prev + Math.random() * 15;
      });
    }, 600);

    try {
      const response = await fetch(API_BASE_URL + `/api/experiment/visualize/${selectedLayer}/${selectedNeuron}`);
      const data = await response.json();
      if (data.image_b64) setHallucinationImage(`data:image/png;base64,${data.image_b64}`);
    } catch (e) { console.error(e); }
    
    clearInterval(interval);
    setHallucinationProgress(100);
    setTimeout(() => setLoadingImg(false), 300);
  };

  const runInception = async () => {
    if (!selectedLayer) return;
    setLoadingInception(true);
    setInceptionResult(null);
    try {
      const response = await fetch(API_BASE_URL + '/api/experiment/inception', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ layer_name: selectedLayer, intensity: 500.0 })
      });
      setInceptionResult(await response.json());
    } catch (e) { console.error(e); }
    setLoadingInception(false);
  };

  const busy = loadingVision || loadingImg || loadingInception;

  return (
    <>
      <div className="lab-container">
        {/* Header Banner */}
        <div className="lab-header-banner" style={{ background: 'var(--accent-blue)', boxShadow: '6px 6px 0px var(--accent-yellow)' }}>
          <div>
            <h2 style={{ margin: '0 0 5px 0', fontSize: '2rem', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Eye size={32} /> Vision Lab
            </h2>
            <p style={{ margin: 0, fontWeight: 'bold' }}>Lobotomize convolutional layers to see how the AI detects edges, textures, and objects.</p>
          </div>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <button 
              className="hover-3d" 
              onClick={handleShare}
              style={{ 
                background: 'var(--panel-bg)', padding: '10px 15px', border: '3px solid #000', 
                fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' 
              }}
            >
              <Share2 size={18} /> {showCopied ? "COPIED!" : "SHARE STATE"}
            </button>
            <div style={{ background: 'var(--panel-bg)', color: 'var(--text)', padding: '10px 20px', border: '3px solid #000', fontWeight: '900', transform: 'rotate(-2deg)' }}>
              MODEL: ResNet-18 (ImageNet)
            </div>
          </div>
        </div>

        {/* Main Content Split: Left Controls, Right Results */}
        <div className="lab-grid">
          
          {/* LEFT PANEL: Dense Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            
            <div className="panel" style={{ padding: '15px' }}>
              <div className="panel-header blue" style={{ margin: '-15px -15px 15px -15px', padding: '10px 15px', fontSize: '1rem' }}>
                1. Navigation
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '15px' }}>
                {layers.map(layer => (
                  <button
                    key={layer.name}
                    className={selectedLayer === layer.name ? 'active-red' : 'btn-main'}
                    onClick={() => { setSelectedLayer(layer.name); setSelectedNeuron(0); setAblationResult(null); setHallucinationImage(null); }}
                    style={{ padding: '6px 10px', fontSize: '0.8rem', flex: '1 1 calc(50% - 8px)' }}
                  >
                    {layer.name} <span style={{ opacity: 0.7 }}>({layer.channels})</span>
                  </button>
                ))}
              </div>

              <h4 style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: 'var(--accent-purple)' }}>Channel Select (0-19)</h4>
              <div className="neuron-grid" style={{ gap: '4px' }}>
                {[...Array(20)].map((_, i) => (
                  <button
                    key={i}
                    className={`neuron-btn ${selectedNeuron === i ? 'active' : ''}`}
                    style={{ width: '36px', height: '36px', fontSize: '0.75rem' }}
                    onClick={() => { 
                      if (selectedNeuron === i) {
                        setSelectedNeuron(null);
                      } else {
                        setSelectedNeuron(i); 
                      }
                      setAblationResult(null); 
                      setHallucinationImage(null); 
                    }}
                  >{i}</button>
                ))}
              </div>
            </div>

            <div className="panel" style={{ padding: '15px', background: '#fafafa' }}>
              <div className="panel-header" style={{ margin: '-15px -15px 15px -15px', padding: '10px 15px', fontSize: '1rem', background: '#000', color: '#fff' }}>
                2. Single-Channel Ops
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ background: 'var(--panel-bg)', border: '2px solid #000', padding: '10px', boxShadow: '2px 2px 0px #000', opacity: selectedNeuron === null ? 0.5 : 1 }}>
                  <button onClick={runAblation} disabled={busy || selectedNeuron === null} className="btn-main" style={{ width: '100%', marginBottom: '8px', cursor: selectedNeuron === null ? 'not-allowed' : 'pointer' }}>
                    {loadingVision ? 'OPERATING...' : '⚡ ABLATE & ANALYZE ⚡'}
                  </button>
                  <p style={{ fontSize: '0.75rem', margin: '0', fontWeight: 'bold', color: '#444' }}>
                    Temporarily turn off this channel to see if it causes selective blindness.
                  </p>
                </div>

                <div style={{ background: '#e0f2fe', border: '2px solid var(--accent-blue)', padding: '10px', boxShadow: '2px 2px 0px var(--accent-blue)', opacity: selectedNeuron === null ? 0.5 : 1 }}>
                  <button onClick={runHallucination} disabled={busy || selectedNeuron === null} className="btn-blue" style={{ width: '100%', marginBottom: '8px', cursor: selectedNeuron === null ? 'not-allowed' : 'pointer' }}>
                    {loadingImg ? 'DREAMING...' : <><Eye size={16} style={{verticalAlign: 'middle', marginRight: 4}}/> HALLUCINATE <Eye size={16} style={{verticalAlign: 'middle', marginLeft: 4}}/></>}
                  </button>
                  <p style={{ fontSize: '0.75rem', margin: '0', fontWeight: 'bold', color: '#0369a1' }}>
                    Ask the AI to draw the perfect picture that makes this channel fire.
                  </p>
                  {loadingImg && (
                    <div style={{ marginTop: '8px', background: 'var(--panel-bg)', border: '2px solid #000', height: '14px', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', background: 'var(--accent-blue)', width: `${hallucinationProgress}%`, transition: 'width 0.3s ease' }} />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="panel" style={{ padding: '15px', background: '#f3e8ff' }}>
              <div className="panel-header purple" style={{ margin: '-15px -15px 15px -15px', padding: '10px 15px', fontSize: '1rem' }}>
                3. Layer-wide Ops
              </div>
              <button onClick={runInception} disabled={busy} className="btn-purple" style={{ width: '100%', marginBottom: '8px' }}>
                {loadingInception ? 'HIJACKING...' : <><Brain size={16} style={{verticalAlign: 'middle', marginRight: 4}}/> INJECT ALIEN THOUGHT</>}
              </button>
              <p style={{ fontSize: '0.75rem', margin: '0', fontWeight: 'bold', color: '#6b21a8' }}>
                Forcefully trigger this layer to trick the AI into seeing something else.
              </p>
            </div>

          </div>

          {/* RIGHT PANEL: Outputs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {ablationResult && (
              <div className="panel">
                <div className="panel-header">Ablation Report — {selectedLayer} → N-{selectedNeuron}</div>
                <div className="results-box" style={{ marginTop: 0 }}>
                  <h3 style={{ margin: '0 0 10px 0' }}><Brain size={16} style={{ verticalAlign: 'middle' }} /> CAUSAL IMPACT SCORES</h3>
                  <div className="stats-row" style={{ marginTop: 0 }}>
                    <div className="stat-card">
                      <span className="stat-label">Baseline Accuracy</span>
                      <span className="stat-value green">{(ablationResult.baseline_accuracy * 100).toFixed(1)}%</span>
                    </div>
                    <div className="stat-card">
                      <span className="stat-label">After Ablation</span>
                      <span className="stat-value red">{(ablationResult.target_ablation_accuracy * 100).toFixed(1)}%</span>
                    </div>
                    <div className="stat-card">
                      <span className="stat-label">Causal Impact</span>
                      <span className="stat-value red">{(ablationResult.causal_impact * 100).toFixed(2)}%</span>
                    </div>
                  </div>
                </div>

                {ablationResult.thought_shifts && (
                  <div className="results-box" style={{ marginTop: 15 }}>
                    <h3 style={{ margin: '0 0 10px 0' }}><Brain size={18} style={{verticalAlign: 'middle', marginRight: 4}}/> THOUGHT SHIFT TRACKER</h3>
                    {ablationResult.thought_shifts.map((shift: any, idx: number) => (
                      <div key={idx} className="thought-shift-row" style={{ padding: '8px 0' }}>
                        <img src={`data:image/png;base64,${shift.image_b64}`} alt={shift.image_name} className="evidence-thumb" style={{ width: 60, height: 60 }} />
                        <div className="thought-col">
                          <span className="thought-label blue-text">Before:</span>
                          {shift.before.map((t: any, i: number) => (
                            <div key={i} className="thought-item" style={{ padding: '2px 4px' }}>
                              <div className="prob-bar" style={{ width: `${t.probability * 100}%`, background: 'var(--accent-blue)' }}></div>
                              <span style={{ fontSize: '0.75rem' }}>{(t.probability * 100).toFixed(1)}% {t.class}</span>
                            </div>
                          ))}
                        </div>
                        <div className="thought-col">
                          <span className="thought-label red-text">After:</span>
                          {shift.after.map((t: any, i: number) => (
                            <div key={i} className="thought-item" style={{ padding: '2px 4px' }}>
                              <div className="prob-bar" style={{ width: `${t.probability * 100}%`, background: 'var(--accent-red)' }}></div>
                              <span style={{ fontSize: '0.75rem' }}>{(t.probability * 100).toFixed(1)}% {t.class}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {ablationResult.top_evidence && (
                  <div className="results-box green-border" style={{ marginTop: 15 }}>
                    <h3 style={{ margin: '0 0 10px 0' }}><Search size={18} style={{verticalAlign: 'middle', marginRight: 4}}/> TOP-5 ACTIVATING IMAGES</h3>
                    <div className="evidence-row">
                      {ablationResult.top_evidence.map((item: any, i: number) => (
                        <div className="evidence-card" key={i} style={{ width: 100 }}>
                          <img src={`data:image/png;base64,${item.image_b64}`} alt={item.name} style={{ width: 80, height: 80 }} />
                          <span className="evidence-name" style={{ fontSize: '0.7rem' }}>{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {hallucinationImage && (
            <div className="panel">
              <div className="panel-header blue">Hallucination Report — {selectedLayer} → N-{selectedNeuron}</div>
              <div className="results-box blue-border" style={{ marginTop: 0 }}>
                <h3 style={{ margin: '0 0 10px 0' }}><Image size={16} style={{ verticalAlign: 'middle' }} /> SYNTHETIC FEATURE DREAM</h3>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                  <img src={hallucinationImage} alt="Hallucinated" className="synthetic-img" style={{ maxWidth: '300px', flexShrink: 0 }} />
                  <div style={{ flex: 1, padding: '15px', background: 'var(--panel-bg)', border: '2px dashed var(--accent-blue)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                    <b style={{ fontSize: '1.1rem', color: 'var(--accent-blue)' }}>What are you looking at?</b>
                    <p style={{ marginTop: '10px' }}>
                      This image doesn't exist in the real world. We started with pure static (noise) and repeatedly adjusted the pixels to make this specific channel (N-{selectedNeuron}) fire as strongly as possible.
                    </p>
                    <p style={{ marginBottom: 0 }}>
                      The repeating patterns, textures, or shapes you see here represent the <b>purest ideal concept</b> that this brain cell is looking for when it scans a real image.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

            {inceptionResult && (
              <div className="panel">
                <div className="panel-header purple">Inception Report — {selectedLayer}</div>
                <div className="results-box" style={{ marginTop: 0 }}>
                  <h3 style={{ margin: '0 0 10px 0' }}>HIJACK REPORT — {inceptionResult.total_flipped}/{inceptionResult.total_images} Predictions Overridden</h3>
                  <div className="inception-grid">
                    {inceptionResult.details.map((d: any, i: number) => (
                      <div key={i} className={`inception-card ${d.flipped ? 'flipped' : 'survived'}`} style={{ width: '100%', padding: '8px' }}>
                        <img src={`data:image/png;base64,${d.image_b64}`} alt={d.image_name} style={{ width: 60, height: 60 }} />
                        <div className="inception-info" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                          <div><b>{d.image_name}</b> <span style={{ float: 'right', fontSize: '0.8rem' }} className={d.flipped ? 'flip-yes' : 'flip-no'}>{d.flipped ? '⚠ HIJACKED' : '✓ SAFE'}</span></div>
                          <div className="blue-text" style={{ fontSize: '0.75rem' }}>Original: {d.original} ({(d.original_confidence * 100).toFixed(1)}%)</div>
                          <div className="red-text" style={{ fontSize: '0.75rem' }}>Hijacked: {d.hijacked} ({(d.hijacked_confidence * 100).toFixed(1)}%)</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {!ablationResult && !hallucinationImage && !inceptionResult && (
            <div className="panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.4, minHeight: '300px' }}>
              <Activity size={64} />
              <h3 style={{ marginTop: '15px' }}>Awaiting experiments...</h3>
              <p>Select a layer and channel on the left, then run an operation to view results.</p>
            </div>
          )}

          {/* Executive Summary / Conclusion */}
          {(ablationResult || hallucinationImage || inceptionResult) && (
            <div className="panel" style={{ background: '#000', color: '#fff', border: '4px solid var(--accent-yellow)', boxShadow: '8px 8px 0px var(--accent-yellow)' }}>
              <div className="panel-header" style={{ background: 'var(--accent-yellow)', color: '#000', margin: '0', padding: '12px 24px' }}>
                <Activity size={18} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                Lab Conclusion
              </div>
              <div style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
                <p>Based on your experiments on <b>{selectedLayer}</b>:</p>
                <ul style={{ paddingLeft: '20px' }}>
                  {ablationResult && (
                    <li style={{ marginBottom: '10px' }}>
                      <b>Ablation (N-{selectedNeuron}):</b> Turning off this channel caused a <span style={{ color: 'var(--accent-red)', fontWeight: 'bold' }}>{(ablationResult.causal_impact * 100).toFixed(2)}% drop</span> in the model's accuracy. This proves the channel plays a {ablationResult.causal_impact > 0.05 ? 'critical' : 'minor'} role in the network's reasoning.
                    </li>
                  )}
                  {hallucinationImage && (
                    <li style={{ marginBottom: '10px' }}>
                      <b>Hallucination (N-{selectedNeuron}):</b> We visually decoded this channel's "thoughts." The synthetic image reveals the exact geometric or semantic pattern it is uniquely responsible for detecting in the wild.
                    </li>
                  )}
                  {inceptionResult && (
                    <li>
                      <b>Inception:</b> We successfully bypassed the model's natural vision and forced a hallucination. We overrode its organic predictions and hijacked <span style={{ color: 'var(--accent-red)', fontWeight: 'bold' }}>{inceptionResult.total_flipped} out of {inceptionResult.total_images} thoughts</span>.
                    </li>
                  )}
                </ul>
                <div style={{ background: '#222', padding: '15px', borderLeft: '4px solid var(--accent-green)', marginTop: '20px' }}>
                  <p style={{ color: 'var(--accent-green)', fontWeight: 'bold', margin: '0' }}>
                    Takeaway: By combining these tools, we can fully map, interpret, and selectively mind-control the internal logic of a black-box AI.
                  </p>
                </div>
              </div>
            </div>
          )}

          </div>
        </div>
      </div>

      {/* Floating Lab Assistant Mascot */}
      <div style={{ position: 'fixed', bottom: '90px', right: '30px', zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        {showGuide && (
          <div className="panel hover-3d" style={{ marginBottom: '15px', width: '320px', border: '4px solid #000', boxShadow: '8px 8px 0px #000', padding: '20px', background: 'var(--panel-bg)' }}>
            <div className="panel-header blue" style={{ display: 'flex', justifyContent: 'space-between', margin: '-20px -20px 15px -20px', padding: '12px 20px' }}>
              <span><Bot size={18} style={{ verticalAlign: 'middle', marginRight: '6px' }}/> Lab Assistant</span>
              <X size={18} style={{ cursor: 'pointer' }} onClick={() => setShowGuide(false)} />
            </div>
            <div style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
              <p style={{ margin: '0 0 10px 0' }}><b>Layers</b> are like layers of an onion. Early layers see simple edges, while deep layers see complex concepts like faces.</p>
              <p style={{ margin: '0 0 10px 0' }}><b>Channels</b> are individual brain cells looking for specific patterns.</p>
              <hr style={{ borderTop: '2px dashed var(--text)', opacity: 0.3, margin: '12px 0' }} />
              <p style={{ margin: '0' }}><i>Tip: Try clicking <b><Eye size={14} style={{verticalAlign: 'middle', marginRight: 4}}/> Hallucinate</b> on different channels to see exactly what they are looking for!</i></p>
            </div>
          </div>
        )}
        
        <button 
          className="btn-main hover-3d" 
          style={{ 
            borderRadius: '50%', width: '64px', height: '64px', padding: 0, 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            background: 'var(--accent-yellow)', border: '4px solid #000', color: '#000' 
          }}
          onClick={() => setShowGuide(!showGuide)}
          title="Need help?"
        >
          <Bot size={32} />
        </button>
      </div>
    </>
  );
}
