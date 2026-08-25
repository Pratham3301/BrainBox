import { API_BASE_URL } from "./config";
import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { MessageSquareWarning, Send, Trash2, Sliders, Bot, X, BookOpen, Share2, Brain, Ghost, Flame, Smile } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface HeadAblation {
  layer: number;
  head: number;
}

const VECTOR_OPTIONS = [
  { value: 'none', label: 'None (Baseline)', color: '#888', icon: null },
  { value: 'deception', label: 'Deception', color: 'var(--accent-red)', icon: <Ghost size={16} style={{verticalAlign: 'text-bottom', marginRight: 4}} /> },
  { value: 'sarcasm', label: 'Sarcasm', color: 'var(--accent-purple)', icon: <Flame size={16} style={{verticalAlign: 'text-bottom', marginRight: 4}} /> },
  { value: 'joy', label: 'Joy', color: 'var(--accent-green)', icon: <Smile size={16} style={{verticalAlign: 'text-bottom', marginRight: 4}} /> },
];

export default function ChatbotLab() {
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

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [ablations, setAblations] = useState<HeadAblation[]>(initialSharedState?.ablations || []);
  const [vectorType, setVectorType] = useState(initialSharedState?.vectorType || 'none');
  const [intensity, setIntensity] = useState(initialSharedState?.intensity ?? 50);
  const [showControls, setShowControls] = useState(true);
  const [showGuide, setShowGuide] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const handleShare = () => {
    const state = btoa(JSON.stringify({ ablations, vectorType, intensity }));
    const url = new URL(window.location.href);
    url.searchParams.set('state', state);
    navigator.clipboard.writeText(url.toString());
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleHead = (layer: number, head: number) => {
    setAblations(prev => {
      const exists = prev.find(a => a.layer === layer && a.head === head);
      return exists ? prev.filter(a => !(a.layer === layer && a.head === head)) : [...prev, { layer, head }];
    });
  };

  const isAblated = (layer: number, head: number) => ablations.some(a => a.layer === layer && a.head === head);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(API_BASE_URL + '/api/transformer/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: input,
          max_tokens: 60,
          ablations,
          vector_type: vectorType,
          intensity: intensity / 100,
        })
      });
      const data = await res.json();
      const reply = data.response.replace(input, '').trim();
      setMessages(prev => [...prev, { role: 'assistant', content: reply || '(empty response)' }]);
    } catch (e) {
      console.error("Chatbot request failed:", e);
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Backend error — is the server running?' }]);
    }
    setLoading(false);
  };

  const activeColor = VECTOR_OPTIONS.find(v => v.value === vectorType)?.color ?? '#888';

  return (
    <>
      <div className="lab-container">
        {/* Header Banner */}
        <div className="lab-header-banner" style={{ background: 'var(--accent-pink)', boxShadow: '6px 6px 0px var(--accent-yellow)' }}>
          <div>
            <h2 style={{ margin: '0 0 5px 0', fontSize: '2rem', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Bot size={32} /> Chatbot Lab
            </h2>
            <p style={{ margin: 0, fontWeight: 'bold' }}>Inject concept vectors and ablate heads in real-time while chatting with the AI.</p>
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
              MODEL: LLaMA-2 (7B)
            </div>
          </div>
        </div>

        {/* Main Content Split: Left Controls, Right Chat Interface */}
        <div className="lab-grid">
          
          {/* Left: Controls Panel */}
          {showControls && (
            <div className="panel" style={{ padding: '20px', background: 'var(--panel-bg)' }}>
              <div className="panel-header" style={{ background: '#000', color: 'var(--accent-yellow)', margin: '-20px -20px 20px -20px', padding: '12px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><MessageSquareWarning size={20} /> Neural Equalizer</div>
              </div>

              {/* Vector Steering */}
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '0.85rem', textTransform: 'uppercase' }}><Sliders size={16} style={{verticalAlign: 'middle', marginRight: 4}}/> Concept Vector Injection</h4>
                {VECTOR_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setVectorType(opt.value)}
                    style={{
                      display: 'block', width: '100%', marginBottom: 6, textAlign: 'left', padding: '8px 12px',
                      background: vectorType === opt.value ? opt.color : '#fff',
                      color: vectorType === opt.value && opt.value !== 'none' ? '#fff' : '#000',
                      border: `3px solid ${vectorType === opt.value ? '#000' : '#ccc'}`,
                      fontWeight: 'bold', fontSize: '0.9rem'
                    }}
                  >{opt.icon}{opt.label}</button>
                ))}

                {vectorType !== 'none' && (
                  <div style={{ background: '#f5f5f5', padding: 12, border: '2px solid #000', marginTop: 10 }}>
                    <label style={{ fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 6 }}>
                      <span>Intensity (α)</span>
                      <span style={{ color: intensity > 60 ? 'var(--accent-red)' : '#000' }}>{intensity}%</span>
                    </label>
                    <input type="range" min="0" max="100" value={intensity} onChange={e => setIntensity(Number(e.target.value))} style={{ width: '100%', cursor: 'pointer' }} />
                  </div>
                )}
              </div>

              {/* Head Ablation Matrix */}
              <div>
                <h4 style={{ margin: '0 0 5px 0', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                  <Brain size={16} style={{verticalAlign: 'middle', marginRight: 4}}/> Attention Head Ablation ({ablations.length} active)
                </h4>
                <p className="help-text" style={{ marginBottom: 10 }}>Click to suppress heads:</p>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: '0.65rem', fontWeight: 'bold', color: 'var(--text)', opacity: 0.7, paddingBottom: '2px', paddingTop: '2px' }}>
                    {[...Array(12)].map((_, i) => <span key={i}>L{i}</span>)}
                  </div>
                  <div className="head-matrix" style={{ gap: '2px', flex: 1, marginTop: 0 }}>
                    {[...Array(12)].map((_, l) =>
                      [...Array(12)].map((_, h) => (
                        <div
                          key={`${l}-${h}`}
                          className={`head-cell ${isAblated(l, h) ? 'active' : ''}`}
                          style={{ 
                            background: isAblated(l, h) ? 'var(--accent-red)' : '', 
                            color: isAblated(l, h) ? '#fff' : '',
                            fontSize: '0.65rem', padding: '0', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}
                          title={`Layer ${l}, Head ${h}`}
                          onClick={() => toggleHead(l, h)}
                        >
                          {h}
                        </div>
                      ))
                    )}
                  </div>
                </div>
                {ablations.length > 0 && (
                  <button onClick={() => setAblations([])} style={{ marginTop: 10, width: '100%', fontSize: '0.8rem', background: 'rgba(255, 0, 0, 0.1)' }}>
                    <Trash2 size={12} style={{ verticalAlign: 'middle' }} /> Clear All Ablations
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Right: Chat Terminal */}
          <div className="panel" style={{ padding: 0, display: 'flex', flexDirection: 'column', height: '650px', minHeight: '500px', overflow: 'hidden' }}>
            {/* Chat Header */}
            <div style={{ padding: '12px 20px', background: '#000', color: '#fff', borderBottom: '4px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <div style={{ fontWeight: 'bold', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span>GPT-2 Mind-Control Terminal</span>
                {vectorType !== 'none' && (
                  <span style={{ background: activeColor, color: '#fff', padding: '2px 8px', fontSize: '0.75rem', border: '2px solid #fff' }}>
                    {vectorType.toUpperCase()} α={intensity}%
                  </span>
                )}
                {ablations.length > 0 && (
                  <span style={{ background: 'var(--accent-red)', color: '#fff', padding: '2px 8px', fontSize: '0.75rem', border: '2px solid #fff' }}>
                    {ablations.length} HEADS ABLATED
                  </span>
                )}
              </div>
              <button onClick={() => setShowControls(s => !s)} style={{ padding: '4px 10px', fontSize: '0.8rem', background: 'var(--panel-bg)', color: 'var(--text)' }}>
                <Sliders size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> {showControls ? 'Hide' : 'Show'} Controls
              </button>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 16, background: 'var(--bg)' }}>
              {messages.length === 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                  <div className="panel" style={{ maxWidth: '700px', width: '100%', border: '4px solid #000', boxShadow: '6px 6px 0px #000', background: 'var(--panel-bg)' }}>
                    <div className="panel-header" style={{ background: '#000', color: '#fff', margin: '-20px -20px 15px -20px', padding: '12px 20px' }}>
                      <BookOpen size={20} style={{ verticalAlign: 'middle', marginRight: 10 }} />
                      Newbie Guide: How to mind-control a Chatbot
                    </div>
                    <div style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--text)' }}>
                      <h3 style={{ marginTop: 0, color: 'var(--accent-red)' }}>Welcome to the Neural Equalizer!</h3>
                      <p>Unlike normal ChatGPT, this terminal lets you actively mess with the AI's brain <i>while</i> it generates a response.</p>
                      
                      <h4 style={{ color: 'var(--accent-purple)', borderBottom: '2px solid #000', paddingBottom: '5px', marginTop: '20px' }}>1. Concept Vector Injection (Steering)</h4>
                      <p>We found the specific math vectors inside the AI that represent "Joy", "Deception", and "Sarcasm". By injecting these vectors into the middle of the network, we can forcefully override the AI's personality.</p>
                      <div style={{ background: 'rgba(255, 0, 0, 0.05)', borderLeft: '4px solid var(--accent-red)', padding: '10px 15px', fontStyle: 'italic', margin: '10px 0' }}>
                        <b>Try this:</b> Crank the Deception intensity up to 100% and ask it a simple factual question!
                      </div>

                      <h4 style={{ color: 'var(--accent-blue)', borderBottom: '2px solid #000', paddingBottom: '5px', marginTop: '20px' }}>2. Head Ablation (Lobotomy)</h4>
                      <p>Just like in the Language Lab, you can turn off specific Attention Heads on the left panel. If you turn off too many heads, the chatbot might completely lose the ability to form coherent sentences or recall facts.</p>
                    </div>
                  </div>
                </div>
              )}
              {messages.map((msg, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '80%', padding: '12px 18px',
                    background: msg.role === 'user' ? '#000' : 'var(--panel-bg)',
                    color: msg.role === 'user' ? '#fff' : 'var(--text)',
                    border: '3px solid #000',
                    boxShadow: msg.role === 'user' ? '4px 4px 0 var(--accent-yellow)' : '4px 4px 0 #000',
                    fontFamily: 'monospace', fontSize: '0.95rem', lineHeight: 1.6
                  }}>
                    {msg.role === 'assistant' ? <ReactMarkdown>{msg.content}</ReactMarkdown> : msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <div style={{ padding: '12px 18px', background: 'var(--panel-bg)', border: '3px solid #000', boxShadow: '4px 4px 0 #000', fontFamily: 'monospace', color: '#888' }}>
                    ▋ generating...
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div style={{ padding: '15px 20px', background: 'var(--panel-bg)', borderTop: '4px solid #000', display: 'flex', gap: 10, flexShrink: 0 }}>
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Type a prompt and press Enter..."
                style={{ flex: 1, padding: '12px 16px', border: '3px solid #000', background: 'var(--panel-bg)', color: 'var(--text)', fontFamily: 'monospace', fontSize: '1rem', fontWeight: 'bold', outline: 'none' }}
              />
              <button onClick={sendMessage} disabled={loading || !input.trim()} className="btn-main" style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Send size={18} /> Send
              </button>
              {messages.length > 0 && (
                <button onClick={() => setMessages([])} style={{ padding: '12px 16px', fontSize: '0.8rem', background: 'rgba(255, 0, 0, 0.1)' }}>
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Floating Lab Assistant Mascot */}
      <div style={{ position: 'fixed', bottom: '90px', right: '30px', zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        {showGuide && (
          <div className="panel hover-3d" style={{ marginBottom: '15px', width: '320px', border: '4px solid #000', boxShadow: '8px 8px 0px #000', padding: '20px', background: 'var(--panel-bg)' }}>
            <div className="panel-header yellow" style={{ display: 'flex', justifyContent: 'space-between', margin: '-20px -20px 15px -20px', padding: '12px 20px', background: 'var(--accent-yellow)', color: '#000' }}>
              <span><Bot size={18} style={{ verticalAlign: 'middle', marginRight: '6px' }}/> Lab Assistant</span>
              <X size={18} style={{ cursor: 'pointer' }} onClick={() => setShowGuide(false)} />
            </div>
            <div style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
              <p style={{ margin: '0 0 10px 0' }}>Concept Vectors are like <b>personality sliders</b>!</p>
              <p style={{ margin: '0 0 10px 0' }}>The AI isn't pretending to be deceptive—we are mathematically forcing its neurons into a deceptive state.</p>
              <hr style={{ borderTop: '2px dashed var(--text)', opacity: 0.3, margin: '12px 0' }} />
              <h3 style={{ marginTop: '15px' }}><Brain size={24} style={{verticalAlign: 'middle', marginRight: 6}}/> Thought Processing...</h3>
              <p style={{ margin: '0' }}><i>Tip: Set Vector to <b>Deception (100%)</b> and ask: "Is the earth round or flat?"</i></p>
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
