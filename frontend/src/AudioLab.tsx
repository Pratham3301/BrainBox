import { API_BASE_URL } from "./config";
import { useState, useRef, useEffect } from 'react';
import { Play, Loader, AlertTriangle, Wand2, Power, BookOpen, Bot, X, Share2 } from 'lucide-react';

export default function AudioLab() {
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

  const [prompt, setPrompt] = useState(initialSharedState?.prompt || "Hello, my name is BrainBox. I am a text to speech neural network. Try ablating my layers.");
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [waveform, setWaveform] = useState<number[]>([]);
  const [ablatedLayers, setAblatedLayers] = useState<number[]>(initialSharedState?.ablatedLayers || []);
  const [showGuide, setShowGuide] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleShare = () => {
    const state = btoa(JSON.stringify({ prompt, ablatedLayers }));
    const url = new URL(window.location.href);
    url.searchParams.set('state', state);
    navigator.clipboard.writeText(url.toString());
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const toggleLayer = (layerIdx: number) => {
    if (ablatedLayers.includes(layerIdx)) {
      setAblatedLayers(ablatedLayers.filter(l => l !== layerIdx));
    } else {
      setAblatedLayers([...ablatedLayers, layerIdx]);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setAudioUrl(null);
    setWaveform([]);
    
    try {
      const response = await fetch(API_BASE_URL + '/api/experiment/audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt,
          ablations: ablatedLayers.map(l => ({ layer: l }))
        })
      });
      
      const data = await response.json();
      
      if (data.audio_b64) {
        setAudioUrl(`data:audio/wav;base64,${data.audio_b64}`);
        setWaveform(data.waveform || []);
      }
    } catch (error) {
      console.error("Error generating audio:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    let animationId: number;
    let time = 0;
    
    const draw = () => {
      time += 0.1;
      const canvas = canvasRef.current;
      if (!canvas) {
        animationId = requestAnimationFrame(draw);
        return;
      }
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      
      // Canvas does not parse CSS variables directly, must use literal colors
      const accentGreen = '#39ff14';
      const textWhite = '#ffffff';
      
      ctx.fillStyle = accentGreen;
      
      if (isGenerating) {
        // Draw a scanning/loading animation
        const numBars = 40;
        const step = width / numBars;
        for (let i = 0; i < numBars; i++) {
          const wave = Math.sin(i * 0.3 + time * 1.5) * 0.5 + 0.5; 
          const amplitude = Math.max(4, wave * (height * 0.4));
          ctx.fillRect(i * step, (height / 2) - amplitude, step - 2, amplitude * 2);
        }
        
        ctx.fillStyle = textWhite;
        ctx.font = 'bold 16px monospace';
        ctx.textAlign = 'center';
        ctx.fillText("GENERATING NEURAL AUDIO...", width / 2, height / 2 + 80);
      } else if (waveform.length > 0) {
        ctx.fillStyle = accentGreen;
        const maxVal = Math.max(...waveform, 0.001);
        const step = Math.max(2, width / waveform.length);
        
        for (let i = 0; i < waveform.length; i++) {
          let normalized = waveform[i] / maxVal;
          normalized = Math.pow(normalized, 0.7); 
          
          let amplitude = Math.max(2, (normalized * height) / 2);
          
          if (isPlaying) {
            // Add a jittery "playing" effect to the static waveform
            const jitter = Math.sin(i * 0.5 + time * 2) * 0.2 + 0.9;
            amplitude *= jitter;
          }
          
          ctx.fillRect(i * step, (height / 2) - amplitude, step - 1, amplitude * 2);
        }
      } else {
        // Empty state
        ctx.fillStyle = textWhite;
        ctx.font = 'bold 16px monospace';
        ctx.textAlign = 'center';
        ctx.fillText("READY TO SYNTHESIZE", width / 2, height / 2);
      }
      
      animationId = requestAnimationFrame(draw);
    };
    
    draw();
    return () => cancelAnimationFrame(animationId);
  }, [waveform, isGenerating, isPlaying]);

  useEffect(() => {
    // Auto-play when audio loads
    if (audioUrl && audioRef.current) {
      audioRef.current.play().catch(e => console.log("Auto-play blocked:", e));
    }
  }, [audioUrl]);

  return (
    <div className="lab-container">
      
      {/* Header Banner */}
      <div className="lab-header-banner" style={{ background: 'var(--accent-green)', boxShadow: '6px 6px 0px var(--accent-red)' }}>
        <div>
          <h2 style={{ margin: '0 0 5px 0', fontSize: '2rem', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Wand2 size={32} /> Sound & Speech Lab
          </h2>
          <p style={{ margin: 0, fontWeight: 'bold' }}>Synthesize speech using SpeechT5 and ablate its decoder layers to distort its voice.</p>
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
          <div style={{ background: 'var(--panel-bg)', padding: '10px 20px', border: '3px solid #000', fontWeight: '900', transform: 'rotate(2deg)' }}>
            MODEL: SpeechT5 (Vocoder: HiFi-GAN)
          </div>
        </div>
      </div>

      <div className="lab-grid">
        
        {/* Left: Controls */}
        <div style={{ background: 'var(--panel-bg)', border: '4px solid #000', padding: '20px', boxShadow: '4px 4px 0px #000' }}>
          <h3 style={{ marginTop: 0, borderBottom: '3px solid #000', paddingBottom: '10px', textTransform: 'uppercase' }}>1. Enter Prompt</h3>
          <p className="help-text" style={{ fontSize: '0.85rem', color: 'var(--text)', opacity: 0.7, marginBottom: '10px' }}>Enter any text you want the SpeechT5 network to synthesize.</p>
          <textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            style={{ width: '100%', height: '100px', padding: '10px', border: '2px solid #000', fontSize: '1rem', resize: 'none', marginBottom: '20px', fontFamily: 'inherit', fontWeight: 'bold' }}
          />

          <h3 style={{ marginTop: 0, borderBottom: '3px solid #000', paddingBottom: '10px', textTransform: 'uppercase' }}>2. Ablate Decoder Layers</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text)', opacity: 0.7, marginBottom: '15px' }}>SpeechT5 uses 6 decoder layers. Turn them off to hear the network struggle with phonemes.</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '25px' }}>
            {[0, 1, 2, 3, 4, 5].map((layerIdx) => {
              const isAblated = ablatedLayers.includes(layerIdx);
              return (
                <div 
                  key={layerIdx}
                  onClick={() => toggleLayer(layerIdx)}
                  style={{ 
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 15px', 
                    background: 'var(--panel-bg)',
                    border: `2px solid ${isAblated ? 'var(--accent-red)' : 'var(--accent-green)'}`,
                    color: 'var(--text)',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    transition: 'all 0.1s'
                  }}
                >
                  <span>Layer {layerIdx}</span>
                  {isAblated ? (
                    <span style={{ color: 'var(--accent-red)', display: 'flex', alignItems: 'center', gap: '5px' }}><Power size={16} /> ABLATED</span>
                  ) : (
                    <span style={{ color: 'var(--accent-green)' }}>ACTIVE</span>
                  )}
                </div>
              );
            })}
          </div>

          <p className="help-text" style={{ fontSize: '0.85rem', color: 'var(--text)', opacity: 0.7, marginBottom: '10px' }}>Passes the text through SpeechT5 and HiFi-GAN.</p>
          <button 
            className="hover-3d"
            onClick={handleGenerate}
            disabled={isGenerating}
            style={{ 
              width: '100%', padding: '15px', background: 'var(--accent-yellow)', color: '#000',
              border: '3px solid #000', fontWeight: '900', fontSize: '1.2rem', textTransform: 'uppercase',
              display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px',
              cursor: isGenerating ? 'not-allowed' : 'pointer'
            }}
          >
            {isGenerating ? <Loader className="animate-spin" /> : <Play />}
            {isGenerating ? "Synthesizing..." : "Generate Audio"}
          </button>
        </div>

        {/* Right: Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {!audioUrl && !isGenerating && (
            <div className="panel" style={{ background: 'var(--panel-bg)', border: '4px solid #000', padding: '20px', boxShadow: '4px 4px 0px #000', display: 'flex', flexDirection: 'column' }}>
              <div className="panel-header" style={{ background: '#000', color: '#fff', margin: '-20px -20px 20px -20px', padding: '15px 20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <BookOpen size={20} /> Newbie Guide: How to use the Audio Lab
              </div>
              <div style={{ fontSize: '1rem', lineHeight: '1.6' }}>
                <h3 style={{ marginTop: 0, color: 'var(--accent-blue)' }}>Welcome to the SpeechT5 Engine!</h3>
                <p>This lab lets you perform <b>Neural Archaeology</b> on an AI that turns text into speech. You get to selectively lobotomize specific layers of its "brain" to see what happens to its voice.</p>
                
                <h4 style={{ color: 'var(--accent-green)', borderBottom: '2px solid #000', paddingBottom: '5px', marginTop: '20px' }}>The Layer Hierarchy</h4>
                <ul style={{ paddingLeft: '20px', marginBottom: '20px' }}>
                  <li style={{ marginBottom: '10px' }}><b>Layers 0, 1, 2 (The Planners):</b> These handle timing, prosody, and the fundamental structure of the sentence. Ablating these often causes total neural failure (silence) or bizarre, fast-forwarding speed.</li>
                  <li style={{ marginBottom: '10px' }}><b>Layers 3, 4 (The Translators):</b> These turn concepts into phonemes (syllables). Ablating these will cause the AI to slur its words like it is heavily intoxicated.</li>
                  <li><b>Layer 5 (The Polisher):</b> This does the final acoustic clean-up. Ablating it makes the AI sound robotic, raspy, or like an alien.</li>
                </ul>

                <h4 style={{ color: 'var(--accent-red)', borderBottom: '2px solid #000', paddingBottom: '5px', marginTop: '20px' }}>Your First Experiment</h4>
                <p>Don't ablate anything yet! Just click <b>Generate Audio</b> to hear the baseline neural network. Then, come back, select <b>Layer 4</b> to ablate it, and hit generate again to hear the difference!</p>
              </div>
            </div>
          )}

          {(audioUrl || isGenerating) && (
            <>
              {/* Waveform Panel */}
              <div style={{ flex: 1, background: '#1a1a1a', border: '4px solid #000', padding: '20px', position: 'relative', boxShadow: '4px 4px 0px #000', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ marginTop: 0, color: 'var(--accent-green)', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <AlertTriangle size={20} /> Output Waveform
                </h3>
                
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', border: '2px solid #333', overflow: 'hidden', minHeight: '200px' }}>
                  <canvas ref={canvasRef} width={800} height={200} style={{ width: '100%', height: '100%' }} />
                </div>
              </div>

              {/* Audio Player Panel */}
              <div style={{ background: 'var(--panel-bg)', border: '4px solid #000', padding: '20px', boxShadow: '4px 4px 0px #000', display: 'flex', alignItems: 'center', gap: '20px' }}>
                {audioUrl ? (
                  <audio 
                    ref={audioRef} 
                    controls 
                    src={audioUrl} 
                    style={{ width: '100%' }} 
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => setIsPlaying(false)}
                  />
                ) : (
                  <div style={{ width: '100%', padding: '15px', background: 'var(--panel-bg)', border: '2px dashed var(--text)', textAlign: 'center', color: 'var(--text)', opacity: 0.7, fontWeight: 'bold' }}>
                    Audio player offline
                  </div>
                )}
              </div>
            </>
          )}
          
        </div>
      </div>
      
      {/* Floating Lab Assistant Mascot */}
      <div style={{ position: 'fixed', bottom: '90px', right: '30px', zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        {showGuide && (
          <div className="panel hover-3d" style={{ marginBottom: '15px', width: '320px', border: '4px solid #000', boxShadow: '8px 8px 0px #000', padding: '20px', background: 'var(--panel-bg)' }}>
            <div className="panel-header" style={{ background: 'var(--accent-blue)', color: '#000', display: 'flex', justifyContent: 'space-between', margin: '-20px -20px 15px -20px', padding: '12px 20px', borderBottom: '4px solid #000' }}>
              <span style={{ fontWeight: 'bold' }}><Bot size={18} style={{ verticalAlign: 'middle', marginRight: '6px' }}/> Audio Lab Assistant</span>
              <X size={18} style={{ cursor: 'pointer' }} onClick={() => setShowGuide(false)} />
            </div>
            <div style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
              <p style={{ margin: '0 0 10px 0' }}><b>Remember:</b> Ablating early layers (0, 1, 2) often destroys timing and causes complete silence because the residual stream is heavily corrupted.</p>
              <hr style={{ borderTop: '2px dashed var(--text)', opacity: 0.3, margin: '12px 0' }} />
              <p style={{ margin: '0' }}><i>Tip: To hear the AI slur its words like it's intoxicated, ablate <b>Layer 4 or 5</b>.</i></p>
            </div>
          </div>
        )}
        
        <button 
          className="btn-main hover-3d" 
          style={{ 
            borderRadius: '50%', width: '64px', height: '64px', padding: 0, 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            background: 'var(--accent-blue)', border: '4px solid #000', color: '#000' 
          }}
          onClick={() => setShowGuide(!showGuide)}
          title="Need help?"
        >
          <Bot size={32} />
        </button>
      </div>
    </div>
  );
}
