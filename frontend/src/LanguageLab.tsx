import { API_BASE_URL } from "./config";
import { useState } from 'react';
import { Wand2, Activity, Brain, BookOpen, Bot, X, Share2, Network, Target } from 'lucide-react';

export default function LanguageLab() {
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

  const [prompt, setPrompt] = useState<string>(initialSharedState?.prompt ?? 'The capital of France is');
  const [selectedLayer, setSelectedLayer] = useState<number | null>(initialSharedState?.selectedLayer ?? 0);
  const [selectedHead, setSelectedHead] = useState<number | null>(initialSharedState?.selectedHead ?? 0);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [showCopied, setShowCopied] = useState(false);

  const handleShare = () => {
    const state = btoa(JSON.stringify({ prompt, selectedLayer, selectedHead }));
    const url = new URL(window.location.href);
    url.searchParams.set('state', state);
    navigator.clipboard.writeText(url.toString());
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };


  const runAnalysis = async (lIdx = selectedLayer, hIdx = selectedHead) => {
    if (lIdx === null || hIdx === null) return;
    setLoading(true);
    setAnalysisProgress(0);
    
    const interval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 95) return prev;
        return prev + Math.random() * 25;
      });
    }, 150);

    try {
      const res = await fetch(API_BASE_URL + '/api/transformer/ablate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, layer_idx: lIdx, head_idx: hIdx })
      });
      setResult(await res.json());
    } catch (e) { console.error(e); }
    
    clearInterval(interval);
    setAnalysisProgress(100);
    setTimeout(() => setLoading(false), 200);
  };

  const suggestHead = () => {
    if (prompt.toLowerCase().includes('france')) {
      setSelectedLayer(8);
      setSelectedHead(11);
    } else if (prompt.toLowerCase().includes('einstein')) {
      setSelectedLayer(9);
      setSelectedHead(4);
    } else {
      setSelectedLayer(Math.floor(Math.random() * 4) + 8); // Late layers 8-11 usually route facts
      setSelectedHead(Math.floor(Math.random() * 12));
    }
  };

  return (
    <>
      <div className="lab-container">
        {/* Header Banner */}
        <div className="lab-header-banner" style={{ background: 'var(--accent-purple)', boxShadow: '6px 6px 0px var(--accent-yellow)' }}>
          <div>
            <h2 style={{ margin: '0 0 5px 0', fontSize: '2rem', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Network size={32} /> Language Lab
            </h2>
            <p style={{ margin: 0, fontWeight: 'bold' }}>Peek inside the attention heads to see how the neural network routes knowledge and grammar.</p>
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
            <div style={{ background: 'var(--panel-bg)', color: 'var(--text)', padding: '10px 20px', border: '3px solid #000', fontWeight: '900', transform: 'rotate(2deg)' }}>
              MODEL: GPT-2 (124M)
            </div>
          </div>
        </div>

        {/* Main Content Split: Left Controls, Right Results */}
        {/* Main Content Split: Left Controls, Right Results */}
        <div className="lab-grid">
          
          {/* LEFT PANEL: Dense Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            
            <div className="panel" style={{ padding: '15px' }}>
              <div className="panel-header purple" style={{ margin: '-15px -15px 15px -15px', padding: '10px 15px', fontSize: '1rem' }}>
                1. Input Prompt
              </div>
              <p className="help-text" style={{ margin: '0 0 10px 0' }}>Enter a prompt to inspect how GPT-2 routes attention:</p>
              <input type="text" className="prompt-input" value={prompt} onChange={e => setPrompt(e.target.value)} />
              <div className="presets-row" style={{ marginBottom: 0 }}>
                <span className="preset-chip" onClick={() => setPrompt('The capital of France is')}>France Capital</span>
                <span className="preset-chip" onClick={() => setPrompt('Albert Einstein was born in')}>Einstein</span>
              </div>
            </div>

            <div className="panel" style={{ padding: '15px', background: '#fafafa' }}>
              <div className="panel-header" style={{ margin: '-15px -15px 15px -15px', padding: '10px 15px', fontSize: '1rem', background: '#000', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>2. Select Attention Head (12x12)</span>
                <button 
                  onClick={suggestHead}
                  className="hover-3d"
                  style={{ background: 'var(--accent-purple)', color: '#000', border: '2px solid #fff', fontSize: '0.75rem', padding: '2px 8px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  <Wand2 size={14} style={{verticalAlign: 'middle', marginRight: 4}}/> Auto-Suggest
                </button>
              </div>
              <p className="help-text" style={{ margin: '0 0 10px 0' }}>Select an attention head to ablate (turn off) during inference:</p>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: '0.65rem', fontWeight: 'bold', color: 'var(--text)', opacity: 0.7, paddingBottom: '2px', paddingTop: '2px' }}>
                  {[...Array(12)].map((_, i) => <span key={i}>L{i}</span>)}
                </div>
                <div className="head-matrix" style={{ gap: '2px', flex: 1, marginTop: 0 }}>
                  {[...Array(12)].map((_, lIdx) =>
                    [...Array(12)].map((_, hIdx) => (
                      <div
                        key={`${lIdx}-${hIdx}`}
                        className={`head-cell ${selectedLayer === lIdx && selectedHead === hIdx ? 'active' : ''}`}
                        title={`Layer ${lIdx}, Head ${hIdx}`}
                        onClick={() => { 
                          if (selectedLayer === lIdx && selectedHead === hIdx) {
                            setSelectedLayer(null);
                            setSelectedHead(null);
                          } else {
                            setSelectedLayer(lIdx); 
                            setSelectedHead(hIdx); 
                          }
                        }}
                        style={{ fontSize: '0.65rem', padding: '0', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                      >
                        {hIdx}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="panel" style={{ padding: '15px', background: '#f3e8ff' }}>
              <div className="panel-header" style={{ margin: '-15px -15px 15px -15px', padding: '10px 15px', fontSize: '1rem', background: 'var(--accent-purple)', color: '#000' }}>
                3. Operations Desk
              </div>
              <button onClick={() => runAnalysis()} disabled={loading || selectedLayer === null} className="btn-purple" style={{ width: '100%', height: '50px', opacity: selectedLayer === null ? 0.5 : 1, cursor: selectedLayer === null ? 'not-allowed' : 'pointer' }}>
                {loading ? 'ANALYZING...' : '⚡ RUN TRANSFORMER ANALYSIS ⚡'}
              </button>
              {loading && (
                <div style={{ marginTop: '8px', background: 'var(--panel-bg)', border: '2px solid #000', height: '14px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', background: 'var(--accent-purple)', width: `${analysisProgress}%`, transition: 'width 0.2s ease' }} />
                </div>
              )}
              <p className="help-text" style={{ fontSize: '0.75rem', margin: '10px 0 0 0', fontWeight: 'bold' }}>
                Computes attention matrix and measures next-token probability shift when Head L{selectedLayer}H{selectedHead} is ablated.
              </p>
            </div>

          </div>

          {/* RIGHT PANEL: Outputs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {!result && (
              <div className="panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '300px' }}>
                <div className="panel-header" style={{ background: '#000', color: '#fff', margin: '-24px -24px 20px -24px' }}>
                  <BookOpen size={20} style={{ verticalAlign: 'middle', marginRight: 10 }} />
                  Newbie Guide: How to use the Language Lab
                </div>
                <div style={{ fontSize: '1rem', lineHeight: '1.6', overflowY: 'auto', paddingRight: '10px' }}>
                  <h3 style={{ marginTop: 0, color: 'var(--accent-purple)' }}>Welcome to the GPT-2 Transformer Engine!</h3>
                  <p>This lab lets you look inside a language model to see exactly how it reads your sentence and decides what word comes next.</p>
                  
                  <h4 style={{ color: 'var(--accent-blue)', borderBottom: '2px solid #000', paddingBottom: '5px', marginTop: '20px' }}>Attention Heads</h4>
                  <p>Language models use "Attention Heads" to connect words together. For example, if you say "The <b>capital</b> of <b>France</b> is", an attention head connects "France" back to "capital" to figure out you want a city.</p>
                  <p>GPT-2 has <b>144 Attention Heads</b> (12 layers × 12 heads per layer). Each head acts like a mini-investigator looking for specific grammar or facts.</p>

                  <h4 style={{ color: 'var(--accent-red)', borderBottom: '2px solid #000', paddingBottom: '5px', marginTop: '20px' }}>What happens when you click "Run"?</h4>
                  <ul style={{ paddingLeft: '20px' }}>
                    <li style={{ marginBottom: '10px' }}><b>Attention Heatmap:</b> We'll show you exactly which words the model was paying attention to before answering.</li>
                    <li><b>Ablation (Lobotomy):</b> By selecting a head on the left, we temporarily turn it off. We then compare the model's top predictions with the head <b>ON</b> vs. <b>OFF</b>.</li>
                  </ul>
                  <p style={{ fontWeight: 'bold' }}>If the prediction drops significantly, you just found the exact "brain cell" responsible for that piece of knowledge!</p>
                </div>
              </div>
            )}

            {result && (
              <>
                <div className="panel">
                  <div className="panel-header blue">
                    Attention Routing & Head Ablation (Layer {selectedLayer}, Head {selectedHead})
                  </div>
                  
                  <h3 style={{ margin: '0 0 10px 0' }}><Target size={18} style={{verticalAlign: 'middle', marginRight: 4}}/> ATTENTION MATRIX HEATMAP</h3>
                  <p className="help-text">How strongly each token attends to preceding tokens at L{result.layer_idx}H{result.head_idx}:</p>
                  {result.attention_matrix && result.attention_matrix.length > 0 && (
                    <div style={{ overflowX: 'auto', background: 'var(--panel-bg)', border: '2px solid #000', padding: '10px' }}>
                      <table className="attn-table" style={{ marginTop: 0 }}>
                        <thead>
                          <tr>
                            <th>Key \ Query</th>
                            {result.tokens.map((t: string, i: number) => <th key={i}>{t}</th>)}
                          </tr>
                        </thead>
                        <tbody>
                          {result.tokens.map((qToken: string, rowIdx: number) => (
                            <tr key={rowIdx}>
                              <th>{qToken}</th>
                              {result.tokens.map((_: string, colIdx: number) => {
                                const val = result.attention_matrix[rowIdx]?.[colIdx] ?? 0;
                                const alpha = Math.min(1.0, val * 1.5);
                                return (
                                  <td key={colIdx} style={{ backgroundColor: `rgba(168,85,247,${alpha})`, color: alpha > 0.5 ? '#fff' : '#333' }}>
                                    {val.toFixed(2)}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div className="results-box" style={{ marginTop: 25 }}>
                    <h3 style={{ margin: '0 0 10px 0' }}><Brain size={18} style={{verticalAlign: 'middle', marginRight: 4}}/> NEXT-TOKEN PREDICTION PROBABILITIES (Before vs. After Ablation)</h3>
                    <div className="stats-row" style={{ marginTop: 0 }}>
                      <div className="thought-col">
                        <span className="thought-label blue-text">Baseline Predictions (Head ON):</span>
                        {result.baseline_predictions.map((p: any, i: number) => (
                          <div key={i} className="thought-item" style={{ padding: '6px' }}>
                            <div className="prob-bar" style={{ width: `${p.probability * 100}%`, background: 'var(--accent-blue)' }}></div>
                            <span style={{ fontWeight: 'bold' }}>{(p.probability * 100).toFixed(1)}% — "{p.token}"</span>
                          </div>
                        ))}
                      </div>
                      <div className="thought-col">
                        <span className="thought-label red-text">Ablated Head L{selectedLayer}H{selectedHead} (Head OFF):</span>
                        {result.ablated_predictions.map((p: any, i: number) => (
                          <div key={i} className="thought-item" style={{ padding: '6px' }}>
                            <div className="prob-bar" style={{ width: `${p.probability * 100}%`, background: 'var(--accent-red)' }}></div>
                            <span style={{ fontWeight: 'bold' }}>{(p.probability * 100).toFixed(1)}% — "{p.token}"</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Conclusion Box */}
                <div className="panel" style={{ background: '#000', color: '#fff', border: '4px solid var(--accent-purple)', boxShadow: '8px 8px 0px var(--accent-purple)' }}>
                  <div className="panel-header" style={{ background: 'var(--accent-purple)', color: '#000', margin: '0', padding: '12px 24px' }}>
                    <Activity size={18} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                    Lab Conclusion
                  </div>
                  <div style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
                    <p>Based on your analysis of <b>L{selectedLayer}H{selectedHead}</b>:</p>
                    <ul style={{ paddingLeft: '20px' }}>
                      <li style={{ marginBottom: '10px' }}>
                        <b>Attention Routing:</b> The heatmap above shows exactly how information flows between words. Darker purple means a stronger connection. Heads often specialize in grammar (like matching verbs to nouns) or copying previous words.
                      </li>
                      <li>
                        <b>Ablation Impact:</b> Look at the difference between the Baseline and Ablated predictions. If the top word's probability dropped significantly when this head was turned off, you found a "circuit" critical for recalling that specific fact!
                      </li>
                    </ul>
                  </div>
                </div>
              </>
            )}

          </div>
        </div>
      </div>

      {/* Floating Lab Assistant Mascot */}
      <div style={{ position: 'fixed', bottom: '90px', right: '30px', zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        {showGuide && (
          <div className="panel hover-3d" style={{ marginBottom: '15px', width: '320px', border: '4px solid #000', boxShadow: '8px 8px 0px #000', padding: '20px', background: 'var(--panel-bg)' }}>
            <div className="panel-header purple" style={{ display: 'flex', justifyContent: 'space-between', margin: '-20px -20px 15px -20px', padding: '12px 20px' }}>
              <span><Bot size={18} style={{ verticalAlign: 'middle', marginRight: '6px' }}/> Lab Assistant</span>
              <X size={18} style={{ cursor: 'pointer' }} onClick={() => setShowGuide(false)} />
            </div>
            <div style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
              <p style={{ margin: '0 0 10px 0' }}><b>GPT-2 has 144 Attention Heads.</b> They act as mini-processors passing messages between words.</p>
              <hr style={{ borderTop: '2px dashed var(--text)', opacity: 0.3, margin: '12px 0' }} />
              <p style={{ margin: '0' }}><i>Tip: Try the "France Capital" preset. Then ablate <b>Layer 8, Head 11</b>. You might see the probability for "Paris" plummet!</i></p>
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
