import { API_BASE_URL } from "./config";
import { useState } from 'react';
import { Search, BookOpen, Bot, X, Share2, Lightbulb, Activity, AlertTriangle, BrainCircuit } from 'lucide-react';

interface CircuitNode {
  layer: number;
  head: number;
  drop: number;
}

interface DiscoveryResult {
  target_token: string;
  baseline_prob: number;
  circuit: CircuitNode[];
}

export default function DiscoveryLab() {
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

  const [prompt, setPrompt] = useState(initialSharedState?.prompt ?? 'The capital of France is');
  const [targetToken, setTargetToken] = useState(initialSharedState?.targetToken ?? '');
  const [result, setResult] = useState<DiscoveryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [showGuide, setShowGuide] = useState(false);
  const [showCopied, setShowCopied] = useState(false);

  const handleShare = () => {
    const state = btoa(JSON.stringify({ prompt, targetToken }));
    const url = new URL(window.location.href);
    url.searchParams.set('state', state);
    navigator.clipboard.writeText(url.toString());
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  const runDiscovery = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setScanProgress(0);
    setResult(null);
    
    // Simulate a 15-second scan since running 144 passes takes some time
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 98) return prev;
        return prev + (100 / 75); // ~15 seconds at 200ms intervals
      });
    }, 200);

    try {
      const res = await fetch(API_BASE_URL + '/api/experiment/discover_circuit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, target_token: targetToken })
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      console.error(e);
    }
    
    clearInterval(interval);
    setScanProgress(100);
    setTimeout(() => setLoading(false), 300);
  };

  return (
    <>
      <div className="lab-container">
        {/* Header Banner */}
        <div className="lab-header-banner" style={{ background: 'var(--accent-orange)', boxShadow: '6px 6px 0px var(--accent-blue)' }}>
          <div>
            <h2 style={{ margin: '0 0 5px 0', fontSize: '2rem', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Search size={32} /> Auto-Circuit Discovery Lab
            </h2>
            <p style={{ margin: 0, fontWeight: 'bold' }}>Automatically hunt down the exact attention heads responsible for a specific behavior (Causal Tracing).</p>
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

        {/* Main Content */}
        <div className="lab-grid">
          
          {/* LEFT PANEL: Inputs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            
            <div className="panel" style={{ padding: '20px', background: 'var(--panel-bg)' }}>
              <h3 style={{ marginTop: 0, borderBottom: '3px solid #000', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BrainCircuit size={20} /> Target Behavior
              </h3>
              
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Input Prompt:</label>
              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                style={{ width: '100%', height: '80px', padding: '10px', border: '3px solid #000', fontFamily: 'var(--font-main)', fontSize: '1rem', marginBottom: '15px', resize: 'vertical' }}
              />

              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Target Token (Optional):</label>
              <p style={{ margin: '0 0 10px 0', fontSize: '0.85rem', color: 'var(--text)', opacity: 0.7 }}>If left blank, the scanner will use the model's top predicted token as the target.</p>
              <input
                type="text"
                value={targetToken}
                onChange={e => setTargetToken(e.target.value)}
                placeholder="e.g., ' Paris'"
                style={{ width: '100%', padding: '10px', border: '3px solid #000', fontFamily: 'var(--font-main)', fontSize: '1rem', marginBottom: '20px' }}
              />

              <button 
                onClick={runDiscovery} 
                disabled={loading}
                className="btn-main hover-3d" 
                style={{ width: '100%', height: '60px', fontSize: '1.1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', background: 'var(--accent-orange)' }}
              >
                {loading ? <><Activity className="animate-spin" /> SCANNING NETWORK...</> : <><Search size={24} /> INITIATE AUTO-SCAN</>}
              </button>

              {loading && (
                <div style={{ marginTop: '15px', background: 'var(--panel-bg)', border: '3px solid #000', height: '24px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', background: 'var(--accent-red)', width: `${scanProgress}%`, transition: 'width 0.2s ease' }} />
                  <div style={{ position: 'absolute', width: '100%', textAlign: 'center', fontWeight: '900', color: scanProgress > 50 ? '#fff' : '#000', mixBlendMode: 'difference' }}>
                    {Math.round(scanProgress)}% - LOBOTOMIZING 144 HEADS
                  </div>
                </div>
              )}
            </div>
            
            {/* Help Note */}
            <div style={{ padding: '15px', background: 'rgba(0, 188, 212, 0.1)', border: '3px solid var(--accent-blue)', marginTop: '10px' }}>
              <p style={{ margin: 0, fontWeight: 'bold', fontSize: '0.9rem' }}><Lightbulb size={16} style={{verticalAlign:'middle', marginRight: 4}} /> Note: The scanner iterates through all 144 heads in GPT-2. It takes about 15 seconds to complete.</p>
            </div>
            
          </div>

          {/* RIGHT PANEL: Results */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {!result && !loading && (
              <div className="panel" style={{ height: '100%', background: 'var(--panel-bg)', border: '4px solid #000', padding: '20px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ background: 'var(--accent-orange)', color: '#000', margin: '-20px -20px 20px -20px', padding: '15px 20px', borderBottom: '4px solid #000', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.2rem', fontWeight: 'bold' }}>
                  <BookOpen size={24} /> Newbie Guide: Causal Tracing
                </div>
                
                <div style={{ flexGrow: 1, fontSize: '1.1rem', lineHeight: '1.6', color: 'var(--text)' }}>
                  <h3 style={{ color: 'var(--accent-red)', textTransform: 'uppercase', marginBottom: '10px' }}>How it Works</h3>
                  <ol style={{ paddingLeft: '20px', marginBottom: '20px' }}>
                    <li style={{ marginBottom: '10px' }}><b>Baseline:</b> We run the network normally and record how confident it is in predicting the Target Token.</li>
                    <li style={{ marginBottom: '10px' }}><b>Ablation Search:</b> The algorithm surgically lobotomizes one single attention head, re-runs the prompt, and measures if the confidence dropped.</li>
                    <li style={{ marginBottom: '10px' }}><b>Iteration:</b> It repeats this automatically 144 times (12 layers * 12 heads) in just a few seconds.</li>
                    <li style={{ marginBottom: '10px' }}><b>Ranking:</b> The heads that cause the most massive drops in probability are the "Critical Circuit" responsible for that behavior.</li>
                  </ol>
                  
                  <div style={{ background: 'var(--bg)', padding: '15px', borderLeft: '4px solid var(--accent-orange)' }}>
                    <b>Ready to try?</b> Type a prompt on the left and hit the scan button. Watch the engine map out GPT-2's internal wiring in real-time.
                  </div>
                </div>
              </div>
            )}

            {result && (
              <div className="panel animate-fade-in" style={{ padding: '20px' }}>
                <div className="panel-header" style={{ background: '#000', color: 'var(--accent-orange)', margin: '-20px -20px 20px -20px', padding: '15px 20px', fontSize: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span><AlertTriangle size={20} style={{ verticalAlign: 'middle', marginRight: '10px' }} /> CRITICAL NODES DISCOVERED</span>
                </div>
                
                <div style={{ background: 'var(--panel-bg)', border: '3px solid var(--text)', padding: '15px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text)', opacity: 0.7, fontWeight: 'bold', textTransform: 'uppercase' }}>Target Token</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--accent-red)' }}>"{result.target_token}"</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text)', opacity: 0.7, fontWeight: 'bold', textTransform: 'uppercase' }}>Baseline Probability</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--accent-blue)' }}>{(result.baseline_prob * 100).toFixed(2)}%</div>
                  </div>
                </div>
                
                <h3 style={{ borderBottom: '3px solid #000', paddingBottom: '10px', marginTop: '30px' }}>Top 10 Most Critical Attention Heads</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px', marginTop: '20px' }}>
                  {result.circuit.map((node, i) => (
                    <div key={i} style={{ 
                      border: '3px solid #000', 
                      padding: '15px', 
                      background: i === 0 ? 'var(--accent-red)' : i < 3 ? 'var(--accent-orange)' : 'var(--panel-bg)',
                      color: i < 3 ? '#fff' : 'var(--text)',
                      boxShadow: '4px 4px 0px #000',
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: '900', marginBottom: '5px' }}>
                        Layer {node.layer} <br/> Head {node.head}
                      </div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 'bold', opacity: 0.8, textTransform: 'uppercase' }}>
                        Probability Drop
                      </div>
                      <div style={{ fontSize: '2rem', fontWeight: '900', textShadow: '2px 2px 0px #000' }}>
                        -{(node.drop * 100).toFixed(1)}%
                      </div>
                      
                      <div style={{ position: 'absolute', right: '-10px', bottom: '-20px', opacity: 0.1, fontSize: '6rem', fontWeight: '900' }}>
                        #{i + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
          </div>
        </div>
      </div>

      {/* Floating Lab Assistant Mascot */}
      <div style={{ position: 'fixed', bottom: '90px', right: '30px', zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        {showGuide && (
          <div className="panel hover-3d" style={{ marginBottom: '15px', width: '350px', border: '4px solid #000', boxShadow: '8px 8px 0px #000', padding: '20px', background: 'var(--panel-bg)' }}>
            <div className="panel-header" style={{ background: 'var(--accent-orange)', color: '#000', display: 'flex', justifyContent: 'space-between', margin: '-20px -20px 15px -20px', padding: '12px 20px', borderBottom: '4px solid #000' }}>
              <span style={{ fontWeight: 'bold' }}><Bot size={18} style={{ verticalAlign: 'middle', marginRight: '6px' }}/> Discovery Assistant</span>
              <X size={18} style={{ cursor: 'pointer' }} onClick={() => setShowGuide(false)} />
            </div>
            <div style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
              <p style={{ margin: '0 0 10px 0' }}><b>What is Causal Tracing?</b> Instead of manually guessing which neurons do what, we systematically ablate every single node to measure its importance.</p>
              <hr style={{ borderTop: '2px dashed var(--text)', opacity: 0.3, margin: '12px 0' }} />
              <p style={{ margin: '0' }}><i>Tip: Leave the Target Token blank to automatically trace the circuit responsible for the model's most likely next word!</i></p>
            </div>
          </div>
        )}
        
        <button 
          className="btn-main hover-3d" 
          style={{ 
            borderRadius: '50%', width: '64px', height: '64px', padding: 0, 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            background: 'var(--accent-orange)', border: '4px solid #000', color: '#000'
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
