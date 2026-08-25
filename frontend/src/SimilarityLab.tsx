import { API_BASE_URL } from "./config";
import { useState } from 'react';
import { BarChart2, BookOpen, Activity, Bot, X, Microscope } from 'lucide-react';

export default function SimilarityLab() {
  const [similarityData, setSimilarityData] = useState<any>(null);
  const [probingData, setProbingData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  const runFullScan = async () => {
    setLoading(true);
    setScanProgress(0);
    
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 95) return prev;
        return prev + Math.random() * 20;
      });
    }, 150);

    try {
        const [simRes, probeRes] = await Promise.all([
          fetch(API_BASE_URL + '/api/experiment/similarity', { method: "POST" }),
          fetch(API_BASE_URL + '/api/experiment/probe', { method: "POST" })
        ]);
      setSimilarityData(await simRes.json());
      setProbingData(await probeRes.json());
    } catch (e) { console.error(e); }
    
    clearInterval(interval);
    setScanProgress(100);
    setTimeout(() => setLoading(false), 200);
  };

  return (
    <>
      <div className="lab-container">
        {/* Header Banner */}
        <div className="lab-header-banner" style={{ background: 'var(--accent-cyan)', boxShadow: '6px 6px 0px var(--accent-purple)' }}>
          <div>
            <h2 style={{ margin: '0 0 5px 0', fontSize: '2rem', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <BarChart2 size={32} /> Similarity & Probing Lab
            </h2>
            <p style={{ margin: 0, fontWeight: 'bold' }}>Scan the AI's "brainwaves" across layers to see how thoughts evolve.</p>
          </div>
          <div style={{ background: 'var(--panel-bg)', color: 'var(--text)', padding: '10px 20px', border: '3px solid #000', fontWeight: '900', transform: 'rotate(-2deg)' }}>
            MODEL: GPT / ResNet
          </div>
        </div>

        {/* Main Content Split: Left Controls, Right Results */}
        <div className="lab-grid">
          
          {/* LEFT PANEL: Dense Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            
            <div className="panel" style={{ padding: '15px', background: '#fafafa' }}>
              <div className="panel-header" style={{ margin: '-15px -15px 15px -15px', padding: '10px 15px', fontSize: '1rem', background: '#000', color: '#fff' }}>
                Operations Desk
              </div>
              <p className="help-text" style={{ margin: '0 0 15px 0' }}>
                Run a full cross-layer brain scan. This will compute both the <b>Evolution of Thought</b> (similarity) and <b>Mind Reading Accuracy</b> (probing) across all layers simultaneously.
              </p>
              
              <button onClick={runFullScan} disabled={loading} className="btn-main" style={{ width: '100%', height: '60px', fontSize: '1rem' }}>
                {loading ? 'SCANNING BRAINWAVES...' : <><Microscope size={16} style={{verticalAlign: 'middle', marginRight: 4}}/> RUN FULL BRAIN SCAN <Microscope size={16} style={{verticalAlign: 'middle', marginLeft: 4}}/></>}
              </button>
              
              {loading && (
                <div style={{ marginTop: '12px', background: 'var(--panel-bg)', border: '2px solid #000', height: '16px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', background: 'var(--accent-red)', width: `${scanProgress}%`, transition: 'width 0.2s ease' }} />
                </div>
              )}
            </div>

          </div>

          {/* RIGHT PANEL: Outputs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {!similarityData && (
              <div className="panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '300px' }}>
                <div className="panel-header" style={{ background: '#000', color: '#fff', margin: '-24px -24px 20px -24px' }}>
                  <BookOpen size={20} style={{ verticalAlign: 'middle', marginRight: 10 }} />
                  Newbie Guide: How to use the Probing Lab
                </div>
                <div style={{ fontSize: '1rem', lineHeight: '1.6', overflowY: 'auto', paddingRight: '10px' }}>
                  <h3 style={{ marginTop: 0, color: 'var(--accent-blue)' }}>Welcome to the Mind Reading Lab!</h3>
                  <p>In this lab, we zoom all the way out and look at <b>entire layers</b> of the AI's brain as a whole, rather than looking at individual cells.</p>
                  
                  <h4 style={{ color: 'var(--accent-blue)', borderBottom: '2px solid #000', paddingBottom: '5px', marginTop: '20px' }}>1. Evolution of Thought (Similarity)</h4>
                  <p>Imagine taking a snapshot of the AI's brainwaves at Layer 1, and another at Layer 4. Are they thinking about the same thing? We compare them to see how the AI's thoughts evolve from simple shapes into complex concepts as information travels deeper.</p>

                  <h4 style={{ color: 'var(--accent-green)', borderBottom: '2px solid #000', paddingBottom: '5px', marginTop: '20px' }}>2. Mind Reading (Linear Probing)</h4>
                  <p>Can we read the AI's mind <i>before</i> it finishes thinking? A "probe" is like a lie-detector attached to a specific layer. We ask the probe to predict the final answer just by looking at that layer's brainwaves. If it guesses correctly, we know the knowledge has fully formed!</p>
                </div>
              </div>
            )}

            {similarityData && probingData && (
              <>
                {/* Evolution of Thought */}
                <div className="panel">
                  <div className="panel-header blue">Evolution of Thought (Layer Similarity)</div>
                  <p className="help-text">Measures how similar the "brainwaves" (representations) are between different layers. 1.0 means perfectly identical.</p>
                  
                  <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    <div style={{ overflowX: 'auto', background: 'var(--panel-bg)', border: '2px solid #000', padding: '10px', flexShrink: 0 }}>
                      <table className="attn-table" style={{ marginTop: 0 }}>
                        <thead>
                          <tr>
                            <th>Layer</th>
                            {similarityData.layers.map((l: string) => <th key={l}>{l}</th>)}
                          </tr>
                        </thead>
                        <tbody>
                          {similarityData.layers.map((l1: string, i: number) => (
                            <tr key={l1}>
                              <th>{l1}</th>
                              {similarityData.layers.map((_: string, j: number) => {
                                const val = similarityData.matrix[i][j];
                                return (
                                  <td key={j} style={{ backgroundColor: `rgba(56,182,255,${val})`, color: val > 0.5 ? '#fff' : '#333', fontWeight: 'bold' }}>
                                    {val.toFixed(3)}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div style={{ flex: 1, minWidth: '250px', padding: '15px', background: '#e0f2fe', border: '2px dashed var(--accent-blue)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                      <b style={{ fontSize: '1.1rem', color: 'var(--accent-blue)' }}>How to read this matrix:</b>
                      <p style={{ marginTop: '10px' }}>
                        Notice how <b>layer1 and layer4</b> have a very low score? 
                      </p>
                      <p style={{ marginBottom: 0 }}>
                        This mathematically proves that the AI's thoughts completely transform between the back of its brain (where it sees simple edges) and the front of its brain (where it recognizes abstract objects).
                      </p>
                    </div>
                  </div>
                </div>

                {/* Mind Reading */}
                <div className="panel" style={{ border: '4px solid var(--accent-cyan)' }}>
                  <div className="panel-header" style={{ background: 'var(--accent-cyan)' }}>Mind Reading (Linear Probes)</div>
                  <p className="help-text">We attach a "lie detector" to each layer to see if it already knows the final answer.</p>
                  
                  <div className="results-box green-border" style={{ marginTop: 0 }}>
                    {probingData.probe_results.map((r: any, idx: number) => (
                      <div key={idx} style={{ marginBottom: 15, paddingBottom: 10, borderBottom: '1px solid rgba(0,0,0,0.15)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                          <span style={{ fontSize: '1.1rem' }}>{r.layer.toUpperCase()}</span>
                          <span className="green-text" style={{ color: 'var(--accent-green)', textShadow: '1px 1px 0 #000' }}>
                            Probe Accuracy: {(r.test_accuracy * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="thought-item" style={{ marginTop: 6, padding: '4px' }}>
                          <div className="prob-bar" style={{ width: `${r.test_accuracy * 100}%`, background: 'var(--accent-green)' }}></div>
                          <span style={{ fontWeight: 'bold' }}>{(r.test_accuracy * 100).toFixed(1)}% Accuracy</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Conclusion Box */}
                <div className="panel" style={{ background: '#000', color: '#fff', border: '4px solid var(--accent-yellow)', boxShadow: '8px 8px 0px var(--accent-yellow)' }}>
                  <div className="panel-header" style={{ background: 'var(--accent-yellow)', color: '#000', margin: '0', padding: '12px 24px' }}>
                    <Activity size={18} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                    Lab Conclusion
                  </div>
                  <div style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
                    <p>Based on this full brain scan, we can conclude two things:</p>
                    <ul style={{ paddingLeft: '20px' }}>
                      <li style={{ marginBottom: '10px' }}>
                        <b>Representations Evolve:</b> The AI does not process an image all at once. The low similarity between early and late layers proves it processes data hierarchically—building from pixels to complex concepts.
                      </li>
                      <li>
                        <b>Knowledge is Formed Early:</b> The "Mind Reading" probes show that by Layer 3 or 4, a simple lie-detector can easily predict the final answer with over 90% accuracy, long before the final output layer!
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
            <div className="panel-header blue" style={{ display: 'flex', justifyContent: 'space-between', margin: '-20px -20px 15px -20px', padding: '12px 20px' }}>
              <span><Bot size={18} style={{ verticalAlign: 'middle', marginRight: '6px' }}/> Lab Assistant</span>
              <X size={18} style={{ cursor: 'pointer' }} onClick={() => setShowGuide(false)} />
            </div>
            <div style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
              <p style={{ margin: '0 0 10px 0' }}>Linear Probes act like <b>mind readers</b>!</p>
              <p style={{ margin: '0 0 10px 0' }}>If a probe attached to Layer 2 gets 90% accuracy, it means Layer 2 already has enough information to identify the object.</p>
              <hr style={{ borderTop: '2px dashed var(--text)', opacity: 0.3, margin: '12px 0' }} />
              <p style={{ margin: '0' }}><i>Tip: Click "Run Full Brain Scan" to see the mind reading in action.</i></p>
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
