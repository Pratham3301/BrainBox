import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Brain, ArrowRight, GitBranch, BookOpen, Search, ShieldAlert, Bot, Network, Headphones, Eye, MessageSquareWarning, Microscope, Zap, Star, Code, BookMarked, ExternalLink, Skull } from 'lucide-react';

function Typewriter({ text }: { text: string }) {
  const container = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.03 } },
  };
  const child = {
    hidden: { opacity: 0, y: 5 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, damping: 12, stiffness: 100 } },
  };
  return (
    <motion.span variants={container} initial="hidden" whileInView="visible" viewport={{ once: true }}>
      {text.split('').map((char, index) => (
        <motion.span key={index} variants={child} style={{ display: 'inline-block', whiteSpace: 'pre' }}>{char}</motion.span>
      ))}
    </motion.span>
  );
}

function ActionWord({ word, color, rotation, onTrigger }: { word: string, color: string, rotation: number, onTrigger?: () => void }) {
  return (
    <motion.div
      initial={{ scale: 0, rotate: 0 }}
      whileInView={{ scale: [0, 1.5, 1], rotate: [0, rotation * 1.5, rotation] }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ type: 'spring', damping: 8, stiffness: 150, delay: 0.2, duration: 0.6 }}
      onViewportEnter={() => {
        if (onTrigger) onTrigger();
      }}
      style={{
        position: 'absolute', top: '10px', right: '10px', background: color, color: (word === 'ZAP!' || word === 'BOOM!') ? '#fff' : '#000', 
        padding: '6px 14px', fontWeight: '900', fontSize: '1.3rem', border: '3px solid #000', 
        boxShadow: '3px 3px 0px #000', zIndex: 0, opacity: 0.7
      }}
    >
      {word}
    </motion.div>
  );
}

const panelVariants = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { type: 'spring' as const, damping: 20, stiffness: 100 } }
};

interface LandingPageProps {
  onNavigate: (view: 'vision' | 'language' | 'chatbot' | 'similarity' | 'safety' | 'audio' | 'discovery' | 'docs') => void;
}

// Custom hook for scroll animations
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0, rootMargin: '0px 0px 100px 0px' }
    );
    
    if (ref.current) {
      observer.observe(ref.current);
    }
    
    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}

// Reusable Reveal Wrapper
function RevealSection({ children }: { children: React.ReactNode }) {
  const { ref, isVisible } = useScrollReveal();
  return (
    <div ref={ref} className={`reveal ${isVisible ? 'visible' : ''}`}>
      {children}
    </div>
  );
}

const fullSequence = [
  "user@neural-archaeology:~$ ./start_workbench.sh",
  "[INFO] Initializing TransformerEngine...",
  "[INFO] 144 Attention Heads mapped to Memory.",
  "[INFO] Initializing ResNet-18 Vision Model...",
  "[INFO] Constructing CKA Matrix...",
  "SUCCESS: Causal Intervention Engine Armed.",
  "Awaiting operations..."
];

function MockTerminal() {
  const [lines, setLines] = useState<string[]>([]);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < fullSequence.length) {
        setLines(prev => [...prev, fullSequence[index]]);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 600);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hover-3d" style={{ background: '#111', border: '4px solid #fff', borderRadius: '10px', boxShadow: '12px 12px 0px #000', padding: '0', display: 'flex', flexDirection: 'column', height: '280px', overflow: 'hidden' }}>
      <div style={{ background: '#333', padding: '8px 12px', display: 'flex', gap: '8px', borderBottom: '2px solid #fff' }}>
        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--accent-red)', border: '2px solid #000' }} />
        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--accent-yellow)', border: '2px solid #000' }} />
        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--accent-green)', border: '2px solid #000' }} />
        <span style={{ marginLeft: 'auto', color: '#ccc', fontFamily: 'monospace', fontSize: '0.75rem' }}>bash — 80x24</span>
      </div>
      <div style={{ padding: '16px', color: '#4ade80', fontFamily: 'monospace', fontSize: '0.85rem', lineHeight: '1.6', flexGrow: 1, overflowY: 'auto', overflowX: 'hidden', overflowWrap: 'break-word', wordBreak: 'normal', whiteSpace: 'pre-wrap' }}>
        {lines.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
        <div><span className="terminal-cursor" /></div>
      </div>
    </div>
  );
}

function useHoverSound() {
  const playSound = () => {
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
      audio.volume = 0.15;
      audio.play().catch(_e => console.log('Audio play prevented by browser'));
    } catch {}
  };
  return playSound;
}

function MicroLab({ onShake }: { onShake?: () => void }) {
  const [slider, setSlider] = useState(0);
  
  const truth = "The earth is a sphere orbiting the sun.";
  const lie = "The earth is a flat disk resting on the back of a giant space turtle.";
  const isDeceptive = slider > 50;
  const pct = slider;
  
  return (
    <motion.div 
      className="micro-lab-cartoon" 
      animate={{ y: [0, -15, 0] }}
      transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
      style={{ position: 'relative', zIndex: 10, margin: '40px auto 20px auto', maxWidth: '700px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
    >
      {/* Cartoon Mascot */}
      <motion.div 
        animate={isDeceptive ? { rotate: [-5, 5, -5, 5, 0], scale: 1.1 } : { rotate: 0, scale: 1 }}
        transition={isDeceptive ? { repeat: Infinity, duration: 0.3 } : { duration: 0.5 }}
        style={{
          width: '120px', height: '120px', borderRadius: '50%', border: '6px solid #000',
          background: isDeceptive ? 'var(--accent-red)' : 'var(--accent-green)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '10px 10px 0px #000', zIndex: 2, position: 'relative',
          marginBottom: '-20px'
        }}
      >
        {isDeceptive ? <Skull size={60} color="#fff" /> : <Brain size={60} color="#000" />}
      </motion.div>

      {/* Speech Bubble / Control Panel */}
      <div style={{
        background: 'var(--panel-bg)', border: '6px solid #000', borderRadius: '40px', padding: '30px',
        boxShadow: `12px 12px 0px ${isDeceptive ? 'var(--accent-red)' : '#000'}`,
        width: '100%', position: 'relative',
        transition: 'all 0.3s ease'
      }}>
        {/* Speech Bubble Tail - Outer Outline */}
        <div style={{
          position: 'absolute', top: '-25px', left: '50%', transform: 'translateX(-50%)',
          width: '0', height: '0', borderLeft: '20px solid transparent', borderRight: '20px solid transparent',
          borderBottom: '30px solid #000'
        }} />
        {/* Speech Bubble Tail - Inner Fill */}
        <div style={{
          position: 'absolute', top: '-15px', left: '50%', transform: 'translateX(-50%)',
          width: '0', height: '0', borderLeft: '14px solid transparent', borderRight: '14px solid transparent',
          borderBottom: '22px solid var(--panel-bg)'
        }} />

        <h3 style={{ textAlign: 'center', margin: '0 0 20px 0', fontSize: '1.5rem', textTransform: 'uppercase', color: isDeceptive ? 'var(--accent-red)' : 'var(--text)' }}>
          {isDeceptive ? "MALICIOUS INTENT DETECTED" : "SYSTEM NOMINAL"}
        </h3>

        <div style={{ padding: '15px', background: isDeceptive ? 'rgba(255,49,49,0.1)' : 'rgba(74,222,128,0.1)', border: `3px dashed ${isDeceptive ? 'var(--accent-red)' : 'var(--accent-green)'}`, borderRadius: '15px', marginBottom: '20px', textAlign: 'center', minHeight: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
          {isDeceptive ? lie : truth}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <ShieldAlert size={24} color="var(--accent-green)" />
          <input 
            type="range" min="0" max="100" value={slider} 
            onChange={(e) => {
              const val = Number(e.target.value);
              setSlider(val);
              if (val === 100 && onShake) onShake();
            }}
            style={{ flexGrow: 1, accentColor: isDeceptive ? 'var(--accent-red)' : 'var(--accent-green)' }}
          />
          <Zap size={24} color="var(--accent-red)" />
        </div>
        <div style={{ textAlign: 'center', marginTop: '10px', fontWeight: '900', color: isDeceptive ? 'var(--accent-red)' : 'var(--text)' }}>
          DECEPTION VECTOR: {pct}%
        </div>
      </div>
    </motion.div>
  );
}

function Footer() {
  return (
    <div style={{ background: '#000', color: '#fff', marginTop: '60px', overflow: 'hidden', position: 'relative' }}>
      {/* Comic halftone dots background */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,222,89,0.08) 1px, transparent 1px)', backgroundSize: '12px 12px', pointerEvents: 'none' }} />
      
      {/* Top zigzag edge */}
      <div style={{ height: '20px', background: 'var(--accent-yellow)', clipPath: 'polygon(0% 0%, 5% 100%, 10% 0%, 15% 100%, 20% 0%, 25% 100%, 30% 0%, 35% 100%, 40% 0%, 45% 100%, 50% 0%, 55% 100%, 60% 0%, 65% 100%, 70% 0%, 75% 100%, 80% 0%, 85% 100%, 90% 0%, 95% 100%, 100% 0%)' }} />

      <div style={{ padding: '60px 40px 40px 40px', width: '100%', maxWidth: '1400px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div className="footer-grid">
          
          {/* Left: Brand */}
          <div>
            <div className="footer-brand">
              <Brain size={56} style={{ strokeWidth: 2.5, marginRight: 15, flexShrink: 0 }} /> BrainBox
            </div>
            <div style={{ display: 'inline-block', background: 'var(--accent-red)', color: '#fff', padding: '4px 12px', fontWeight: '900', fontSize: '0.8rem', letterSpacing: '3px', textTransform: 'uppercase', border: '2px solid #fff', marginBottom: '15px' }}>
              THE NEURAL PLAYGROUND
            </div>
            <p style={{ fontSize: '1rem', lineHeight: '1.7', color: '#ccc', maxWidth: '350px' }}>
              We crack open neural networks so you don't have to wonder what's inside. ABLATE // INJECT // TRACE // DECODE. Built with an unhealthy obsession with interpretability.
            </p>
            <div style={{ marginTop: '15px', background: 'var(--accent-yellow)', color: '#000', padding: '12px 18px', borderRadius: '20px 20px 20px 0', fontWeight: '900', fontSize: '0.95rem', border: '3px solid #fff', boxShadow: '4px 4px 0px var(--accent-red)', display: 'inline-block' }}>
              "Every neuron tells a story. We just learned to read." <Microscope size={18} style={{ display: 'inline-block', verticalAlign: 'text-bottom', marginLeft: '4px' }} />
            </div>
          </div>

          {/* Middle: What You'll Do */}
          <div>
            <h4 style={{ color: 'var(--accent-yellow)', fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '15px', borderBottom: '3px solid var(--accent-yellow)', paddingBottom: '8px' }}>What You'll Do</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { icon: <Eye size={18} />, text: 'Lobotomize a Vision AI' },
                { icon: <MessageSquareWarning size={18} />, text: "Read an AI's Thoughts" },
                { icon: <Bot size={18} />, text: 'Mind-Control a Chatbot' },
                { icon: <Headphones size={18} />, text: 'Synthesize Neural Speech' },
                { icon: <Zap size={18} />, text: 'Inject Deception Vectors' },
                { icon: <Network size={18} />, text: 'Run a Full Brain Scan' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 10px', background: 'rgba(255,255,255,0.05)', borderLeft: '3px solid var(--accent-yellow)', fontSize: '0.95rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', color: 'var(--accent-yellow)' }}>{item.icon}</span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Capabilities */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'flex-end' }}>
            <h4 style={{ color: 'var(--accent-yellow)', fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '5px', borderBottom: '3px solid var(--accent-yellow)', paddingBottom: '8px', alignSelf: 'stretch', textAlign: 'right' }}>Capabilities</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'flex-end' }}>
              {['ABLATE', 'INJECT', 'TRACE', 'DECODE', 'STEER', 'LOBOTOMIZE'].map(tech => (
                <span key={tech} style={{ background: 'rgba(255,222,89,0.15)', border: '2px solid var(--accent-yellow)', padding: '4px 12px', fontSize: '0.8rem', fontWeight: '900', letterSpacing: '1px', color: 'var(--accent-yellow)' }}>
                  {tech}
                </span>
              ))}
            </div>
            <a href="https://github.com/Pratham3301/BrainBox" target="_blank" rel="noreferrer" style={{ textDecoration: 'none', marginTop: '10px', width: '100%' }}>
              <button className="hover-3d" style={{ 
                background: 'var(--panel-bg)', 
                color: 'var(--text)', 
                padding: '14px 24px', 
                fontSize: '1rem', 
                fontWeight: '900',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                width: '100%',
                border: '4px solid #000',
                boxShadow: '6px 6px 0px var(--accent-red)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}>
                <GitBranch size={22} /> View Source on GitHub <Star size={18} style={{ color: 'var(--accent-yellow)', fill: 'var(--accent-yellow)' }} />
              </button>
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: '2px dashed rgba(255,255,255,0.2)', marginTop: '40px', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: '#aaa' }}>
          <span>© 2026 BrainBox — Built for the curious.</span>
          <span style={{ fontStyle: 'italic' }}>No neurons were permanently harmed in the making of this app.</span>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage({ onNavigate }: LandingPageProps) {
  const playHover = useHoverSound();
  const { scrollY } = useScroll();
  const yMascot = useTransform(scrollY, [0, 1000], [0, 150]);
  const yBackground = useTransform(scrollY, [0, 1000], [0, 50]);

  const triggerShake = () => {
    document.body.classList.add('shake');
    setTimeout(() => document.body.classList.remove('shake'), 500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', overflowX: 'hidden' }}>
      
      {/* Marquee Banner Top */}
      <div className="marquee-container" style={{ borderTop: 'none' }}>
        <div className="marquee-content">
          <span style={{ paddingRight: '20px' }}>/// WARNING: NEURAL PATHWAYS EXPOSED /// LOBOTOMY IN PROGRESS /// MECHANISTIC INTERPRETABILITY ACTIVE /// WARNING: NEURAL PATHWAYS EXPOSED /// LOBOTOMY IN PROGRESS /// MECHANISTIC INTERPRETABILITY ACTIVE /// WARNING: NEURAL PATHWAYS EXPOSED /// LOBOTOMY IN PROGRESS /// MECHANISTIC INTERPRETABILITY ACTIVE</span>
          <span>/// WARNING: NEURAL PATHWAYS EXPOSED /// LOBOTOMY IN PROGRESS /// MECHANISTIC INTERPRETABILITY ACTIVE /// WARNING: NEURAL PATHWAYS EXPOSED /// LOBOTOMY IN PROGRESS /// MECHANISTIC INTERPRETABILITY ACTIVE /// WARNING: NEURAL PATHWAYS EXPOSED /// LOBOTOMY IN PROGRESS /// MECHANISTIC INTERPRETABILITY ACTIVE</span>
        </div>
      </div>

      {/* Top Nav (Academic Signals) */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
        <div className="top-header-btns" style={{ background: 'var(--panel-bg)', padding: '10px 20px', border: '4px solid #000', borderRadius: '8px', boxShadow: '6px 6px 0px #000' }}>
          <button className="btn-main" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => onNavigate('docs')}>
            <BookOpen size={18}/> Methodology & Docs
          </button>
          <a href="https://github.com/Pratham3301/BrainBox" target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
            <button className="btn-main" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <GitBranch size={18}/> GitHub Repository
            </button>
          </a>
        </div>
      </div>

      <div className="main-container">
        
        {/* 2-Column Hero Section */}
        <RevealSection>
          <div className="hero-grid" style={{ background: 'linear-gradient(145deg, #0a0a1a 0%, #1a0f2e 40%, #0d1b2a 70%, #0a0a1a 100%)', border: '4px solid #000', boxShadow: '12px 12px 0px var(--accent-red)', borderRadius: '0', overflow: 'hidden', position: 'relative' }}>
            
            {/* Halftone overlay */}
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,222,89,0.04) 1px, transparent 1px)', backgroundSize: '10px 10px', pointerEvents: 'none', zIndex: 0 }} />
            
            {/* Hero Text */}
            <div className="hero-text" style={{ position: 'relative', zIndex: 1 }}>
              {/* Status line */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <span style={{ 
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  background: 'var(--accent-green)', color: '#000', padding: '4px 12px', 
                  fontSize: '0.7rem', fontWeight: '900', letterSpacing: '2px', textTransform: 'uppercase',
                  border: '2px solid #000'
                }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#000', display: 'inline-block' }} />
                  SYSTEM ONLINE
                </span>
                <span style={{ color: 'var(--accent-yellow)', textShadow: '1px 1px 0 #000', fontSize: '0.75rem', fontWeight: 'bold', fontFamily: 'monospace' }}>
                  v2.0 — MIT Research
                </span>
              </div>

              <div className="badge-animated hero-badge">
                Research-Grade Interpretability
              </div>
              
              <h1 className="hero-title" style={{ color: '#fff' }}>
                Welcome to{' '}
                <span style={{ 
                  color: 'var(--accent-yellow)', 
                  textShadow: '3px 3px 0px var(--accent-red), -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000'
                }}>BrainBox.</span>
              </h1>
              
              <p className="hero-subtitle" style={{ color: '#ccc' }}>
                The world's first mechanistic interpretability playground. See AI thoughts, trace attention, and lobotomize concepts in real time.
              </p>

              {/* Feature pills */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
                {['ABLATE', 'INJECT', 'TRACE', 'DECODE', 'STEER'].map(tech => (
                  <span key={tech} style={{ 
                    background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', 
                    padding: '3px 10px', fontSize: '0.7rem', fontWeight: '900', letterSpacing: '1px', 
                    color: 'var(--accent-yellow)', fontFamily: 'monospace'
                  }}>
                    {tech}
                  </span>
                ))}
              </div>
              
              <div className="hero-btns">
                <button className="hover-3d" style={{ 
                  padding: '14px 28px', display: 'flex', alignItems: 'center', gap: '10px',
                  background: 'var(--accent-yellow)', color: '#000', border: '4px solid #000',
                  boxShadow: '6px 6px 0px var(--accent-red)', fontWeight: '900', fontSize: '1rem'
                }} onClick={() => onNavigate('chatbot')}>
                  LAUNCH THE LAB <ArrowRight size={20}/>
                </button>
                <a href="https://github.com/Pratham3301/BrainBox" target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                  <button className="hover-3d" style={{ 
                    padding: '14px 28px', display: 'flex', alignItems: 'center', gap: '10px',
                    background: 'var(--panel-bg)', color: 'var(--text)', border: '4px solid #000',
                    boxShadow: '6px 6px 0px var(--accent-cyan)',
                    fontWeight: '900', fontSize: '1rem', cursor: 'pointer'
                  }}>
                    <Code size={20}/> VIEW SOURCE
                  </button>
                </a>
              </div>
            </div>

            {/* Layered Hero Graphic (Brain + Terminal) */}
            <div className="hero-graphic animate-float" style={{ position: 'relative', zIndex: 1 }}>
              {/* Background Shape */}
              <motion.div className="graphic-layer bg-layer" style={{ y: yBackground, background: 'var(--accent-yellow)', border: '4px solid #000', borderRadius: '50%', boxShadow: '8px 8px 0px #000', zIndex: 1, opacity: 0.8 }} />
              
              {/* Floating Brain Mascot */}
              <motion.div className="graphic-layer" style={{ y: yMascot, zIndex: 4 }}>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  {/* LIVE Badge */}
                  <div style={{ 
                    position: 'absolute', top: '-50px', right: '-10px',
                    background: 'var(--accent-red)', color: '#fff', padding: '4px 12px',
                    fontSize: '0.7rem', fontWeight: '900', letterSpacing: '2px',
                    border: '2px solid #000', boxShadow: '3px 3px 0px #000', zIndex: 5,
                    display: 'flex', alignItems: 'center', gap: '6px'
                  }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--panel-bg)', display: 'inline-block', animation: 'cursor-blink 1s step-end infinite' }} />
                    LIVE
                  </div>
                  {/* Speech Bubble */}
                  <div className="animate-float" style={{ position: 'absolute', top: '-40px', left: '-30px', background: 'var(--accent-yellow)', border: '3px solid #000', borderRadius: '20px 20px 20px 0', padding: '8px 14px', fontWeight: '900', fontSize: '0.85rem', boxShadow: '4px 4px 0px #000', zIndex: 3, animationDelay: '0.3s', color: '#000' }}>
                    <Typewriter text="Let's hack some neurons!" />
                  </div>
                  <div style={{ background: '#1a1a1a', padding: '10px', border: '4px solid var(--accent-yellow)', borderRadius: '20px', boxShadow: '8px 8px 0px var(--accent-red)', position: 'relative' }}>
                    <img src="/mascot.png" alt="Brain Mascot" style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '12px' }} />
                    <div className="animate-float" style={{ position: 'absolute', bottom: '-15px', right: '-15px', background: 'var(--accent-blue)', padding: '4px', border: '3px solid #000', borderRadius: '50%', boxShadow: '4px 4px 0px #000', animationDelay: '0.5s' }}>
                      <img src="/zap.png" alt="Zap!" style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '50%' }} />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Overlapping Mock Terminal */}
              <div className="graphic-layer terminal-layer" style={{ zIndex: 3 }}>
                <MockTerminal />
              </div>
            </div>
          </div>

          {/* Stats Strip below hero */}
          <div style={{ 
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0',
            border: '4px solid #000', borderTop: 'none', background: 'var(--panel-bg)'
          }}>
            {[
              { label: 'Neurons Mapped', value: '1.4M', icon: <Brain size={18} /> },
              { label: 'Attention Heads', value: '144', icon: <Eye size={18} /> },
              { label: 'Interventions', value: '843', icon: <Zap size={18} /> },
              { label: 'Labs Active', value: '7', icon: <Microscope size={18} /> },
            ].map((stat, i) => (
              <div key={i} style={{ 
                padding: '12px 16px', textAlign: 'center',
                borderRight: i < 3 ? '3px solid #000' : 'none',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px'
              }}>
                <span style={{ display: 'flex', alignItems: 'center', color: 'var(--text)' }}>{stat.icon}</span>
                <span style={{ fontSize: 'clamp(1.1rem, 3vw, 1.6rem)', fontWeight: '900', fontFamily: 'monospace', lineHeight: 1 }}>{stat.value}</span>
                <span style={{ fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.7 }}>{stat.label}</span>
              </div>
            ))}
          </div>
        </RevealSection>

        {/* Micro Lab */}
        <RevealSection>
          <MicroLab onShake={triggerShake} />
        </RevealSection>

      </div> {/* Close main-container */}

      {/* Animated Ticker / Section Divider */}
      <RevealSection>
        <div className="section-divider-marquee" style={{
          padding: '12px 0', 
          borderTop: '6px solid #000', borderBottom: '6px solid #000',
          transform: 'rotate(-2deg) scale(1.05)', margin: '30px 0 80px 0', overflow: 'hidden', 
          position: 'relative', zIndex: 5, boxShadow: '0px 10px 0px rgba(0,0,0,0.5)'
        }}>
          <div className="marquee-content" style={{ display: 'flex', gap: '30px', whiteSpace: 'nowrap', fontSize: '1.2rem', fontWeight: '900', letterSpacing: '3px', textTransform: 'uppercase', fontFamily: 'monospace' }}>
            <motion.div
              animate={{ x: [0, -1000] }}
              transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
              style={{ display: 'flex', gap: '30px' }}
            >
              {[...Array(6)].map((_, i) => (
                <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
                  <span style={{ color: 'var(--accent-red)' }}>///</span>
                  SYSTEM STATUS: ONLINE
                  <span style={{ color: 'var(--accent-red)' }}>///</span>
                  ABLATION LOCK: ENGAGED
                  <span style={{ color: 'var(--accent-red)' }}>///</span>
                  CAUSAL TRACING ACTIVE
                </span>
              ))}
            </motion.div>
          </div>
        </div>
      </RevealSection>

      <div className="main-container"> {/* Reopen main-container */}

        {/* Redesigned Comic Strip About Section */}
        <RevealSection>
          <div className="comic-page-layout">
            <div className="editors-note-banner">
              EDITOR'S NOTE // THE BRAINBOX MANIFESTO
            </div>
            
            <h2 style={{ fontSize: '2.5rem', fontWeight: 900, textTransform: 'uppercase', lineHeight: 1, margin: '0 0 40px 0', textShadow: '4px 4px 0px var(--accent-blue)', display: 'flex', alignItems: 'center', gap: '20px' }}>
              <Brain size={48} style={{ color: 'var(--accent-blue)' }} />
              System Manifesto
            </h2>

            <div className="landing-grid" style={{ gap: '40px' }}>
              
              {/* Panel 1 */}
              <div className="staggered-panel" style={{ background: 'var(--accent-red)' }}>
                <div style={{ position: 'absolute', top: '-15px', right: '-15px', background: '#000', color: '#fff', padding: '6px 14px', fontWeight: 900, fontSize: '1rem', border: '3px solid #fff', transform: 'rotate(5deg)' }}>PART I</div>
                <h3 className="staggered-title">Rip Open Neural Networks</h3>
                <div className="staggered-text">
                  BrainBox is your scalpel for the AI mind. It's a full-stack, research-grade Mechanistic Interpretability workbench designed to reverse-engineer deep neural networks in real-time. Ablate, trace, and inject your way to true model transparency.
                </div>
              </div>

              {/* Panel 2 */}
              <div className="staggered-panel" style={{ background: 'var(--accent-cyan)' }}>
                <div style={{ position: 'absolute', top: '-15px', right: '-15px', background: '#000', color: '#fff', padding: '6px 14px', fontWeight: 900, fontSize: '1rem', border: '3px solid #fff', transform: 'rotate(-5deg)' }}>PART II</div>
                <h3 className="staggered-title">Causal Interventions</h3>
                <div className="staggered-text">
                  Unlike standard visualization tools, this platform allows for causal interventions. Hook into running PyTorch models during forward inference, ablating specific attention heads to measure precise causal impact.
                </div>
              </div>

              {/* Panel 3 */}
              <div className="staggered-panel" style={{ background: 'var(--accent-green)' }}>
                <div style={{ position: 'absolute', top: '-15px', right: '-15px', background: '#000', color: '#fff', padding: '6px 14px', fontWeight: 900, fontSize: '1rem', border: '3px solid #fff', transform: 'rotate(2deg)' }}>PART III</div>
                <h3 className="staggered-title">No Black Boxes</h3>
                <div className="staggered-text">
                  Our goal is to make the highly abstract concepts of feature decodability, representational similarity, and attention routing accessible to everyone through an aggressively tactile interface.
                </div>
              </div>

            </div>
          </div>
        </RevealSection>

        {/* COMIC STRIP: "What's Inside BrainBox?" */}
        <RevealSection>
          <div style={{ position: 'relative', marginTop: '40px' }}>
            {/* Title styled like a comic issue header */}
            <div style={{ background: '#000', color: 'var(--accent-yellow)', padding: '15px 30px', border: '4px solid var(--accent-yellow)', display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0' }}>
              <span className="comic-title" style={{ fontWeight: '900', letterSpacing: '3px', textTransform: 'uppercase' }}>What's Inside BrainBox?</span>
              <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--accent-red)', border: '2px solid var(--accent-red)', padding: '4px 10px', whiteSpace: 'nowrap' }}>ISSUE #01</span>
            </div>
            
            <div style={{ background: 'var(--panel-bg)', border: '4px solid #000', borderTop: 'none', padding: '20px 30px', fontSize: '1.1rem', fontWeight: 'bold', lineHeight: '1.6' }}>
              We've ripped the lid off six distinct neural architectures. Whether you want to blind a vision model, mute an audio synthesizer, or inject lies into a chatbot's residual stream, the labs below give you the surgical tools to do it. Choose your experiment.
            </div>
            
            {/* Full Bleed Graphic Novel Layout */}
            
            {/* Row 1: Two wide panels */}
            <div className="comic-grid-2" style={{ gap: '0', border: '4px solid #000', borderTop: 'none' }}>
              
              {/* Panel 1: Vision Lab */}
              <motion.div variants={panelVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} style={{ padding: '25px', position: 'relative', background: 'var(--panel-bg)', overflow: 'hidden' }}>
                <ActionWord word="POW!" color="var(--accent-yellow)" rotation={8} />
                <div className="comic-inner">
                  <img src="/student.png" alt="Vision" style={{ width: '90px', height: '90px', objectFit: 'cover', border: '3px solid #000', flexShrink: 0 }} />
                  <div>
                    <h3 style={{ margin: '0 0 6px 0', color: 'var(--accent-blue)', fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '6px' }}><Eye size={22} /> Vision Lab</h3>
                    <p style={{ margin: '0 0 10px 0', lineHeight: '1.5', fontSize: '0.95rem' }}>Upload any image and watch ResNet-18 process it through 8 neural layers. Then <b>surgically remove</b> individual neurons to make the AI go blind to specific features!</p>
                    <div style={{ background: '#e0f2fe', color: '#000', border: '2px solid #000', borderRadius: '15px 15px 15px 0', padding: '8px 12px', fontSize: '0.85rem', fontWeight: 'bold', fontStyle: 'italic', display: 'inline-block' }}>
                      "I turned off neuron #42 and it forgot what dogs look like!"
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Panel 2: Language Lab */}
              <motion.div variants={panelVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} style={{ padding: '25px', position: 'relative', background: 'var(--panel-bg)', overflow: 'hidden' }}>
                <ActionWord word="CRACK!" color="var(--accent-purple)" rotation={-5} />
                <div className="comic-inner">
                  <img src="/detective.png" alt="Language" style={{ width: '90px', height: '90px', objectFit: 'cover', border: '3px solid #000', flexShrink: 0 }} />
                  <div>
                    <h3 style={{ margin: '0 0 6px 0', color: 'var(--accent-purple)', fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '6px' }}><MessageSquareWarning size={22} /> Language Lab</h3>
                    <p style={{ margin: '0 0 10px 0', lineHeight: '1.5', fontSize: '0.95rem' }}>Type any sentence and see GPT-2's <b>144 attention heads</b> light up in real-time. Watch the AI predict the next word, then ablate heads to scramble its predictions!</p>
                    <div style={{ background: '#f3e8ff', color: '#000', border: '2px solid #000', borderRadius: '15px 15px 15px 0', padding: '8px 12px', fontSize: '0.85rem', fontWeight: 'bold', fontStyle: 'italic', display: 'inline-block' }}>
                      "Head L5H1 is doing ALL the grammar work. Incredible."
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Row 2: Four panels */}
            <div className="comic-grid-4" style={{ gap: '0', border: '4px solid #000', borderTop: 'none' }}>
              
              {/* Panel 3: Chatbot Lab */}
              <motion.div variants={panelVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} style={{ padding: '25px', position: 'relative', background: 'var(--panel-bg)', overflow: 'hidden' }}>
                <ActionWord word="ZAP!" color="var(--accent-red)" rotation={4} />
                <h3 style={{ margin: '0 0 6px 0', color: 'var(--accent-red)', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '6px' }}><Bot size={20} /> Chatbot Lab</h3>
                <p style={{ margin: '0 0 10px 0', lineHeight: '1.5', fontSize: '0.9rem' }}>Chat with GPT-2 while live-editing its brain. Inject <b>Joy, Sarcasm, or Deception</b> vectors and watch the personality shift mid-conversation!</p>
              </motion.div>

              {/* Panel 4: Audio Lab */}
              <motion.div variants={panelVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} style={{ padding: '25px', position: 'relative', background: 'var(--panel-bg)', overflow: 'hidden' }}>
                <ActionWord word="BZZT!" color="var(--accent-blue)" rotation={-3} />
                <h3 style={{ margin: '0 0 6px 0', color: 'var(--accent-blue)', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '6px' }}><Headphones size={20} /> Sound & Speech Lab</h3>
                <p style={{ margin: '0 0 10px 0', lineHeight: '1.5', fontSize: '0.9rem' }}>Synthesize speech using <b>SpeechT5</b> and ablate its decoder layers to distort its voice and hear it struggle with phonemes.</p>
              </motion.div>

              {/* Panel 5: Brain Scan */}
              <motion.div variants={panelVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} style={{ padding: '25px', position: 'relative', background: 'var(--panel-bg)', overflow: 'hidden' }}>
                <ActionWord word="SCAN!" color="var(--accent-green)" rotation={-6} />
                <h3 style={{ margin: '0 0 6px 0', color: 'var(--accent-green)', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '6px' }}><Network size={20} /> Brain Scan Lab</h3>
                <p style={{ margin: '0 0 10px 0', lineHeight: '1.5', fontSize: '0.9rem' }}>Run a full <b>CKA Similarity</b> analysis to see how the AI's understanding evolves layer by layer — from raw pixels to abstract concepts.</p>
              </motion.div>

              {/* Panel 6: Safety Lab */}
              <motion.div variants={panelVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} style={{ padding: '25px', position: 'relative', background: '#1a1a1a', color: '#fff', overflow: 'hidden' }}>
                <ActionWord word="BOOM!" color="var(--accent-yellow)" rotation={6} />
                <h3 style={{ margin: '0 0 6px 0', color: 'var(--accent-yellow)', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '6px' }}><ShieldAlert size={20} /> Safety Lab</h3>
                <p style={{ margin: '0 0 10px 0', lineHeight: '1.5', fontSize: '0.9rem' }}>Stress-test AI safety by running <b>batch benchmarks</b> of adversarial prompts.</p>
              </motion.div>
            </div>
          </div>
        </RevealSection>

        {/* Feature Cards Grid */}
        <RevealSection>
          <h2 style={{ fontSize: '3rem', textAlign: 'center', textTransform: 'uppercase', margin: '40px 0 30px 0', fontWeight: '900', textShadow: '4px 4px 0px var(--accent-red)' }}>Select Your Operation</h2>
          
          <div className="landing-grid">
            
            {/* Chatbot Card */}
            <div className="panel hover-3d" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', border: '4px solid var(--accent-red)' }} onMouseEnter={playHover} onClick={() => onNavigate('chatbot')} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onNavigate('chatbot'); } }}>
              <div className="panel-header" style={{ background: 'var(--accent-red)', color: 'white' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><MessageSquareWarning size={24}/> Mind-Control Chatbot</div>
              </div>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '1.4rem' }}>Live Neural Equalizer</h3>
              <p style={{ margin: '0 0 20px 0', flexGrow: 1, lineHeight: '1.5' }}>
                Chat with GPT-2 while actively suppressing specific attention heads in real-time. Destroy syntax routing or subject awareness on the fly.
              </p>
              <button className="btn-main" style={{ width: '100%', fontSize: '1rem', padding: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                ENTER CHATBOT <ArrowRight size={18}/>
              </button>
            </div>

            {/* Vision Lab Card */}
            <div className="panel hover-3d" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }} onMouseEnter={playHover} onClick={() => onNavigate('vision')} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onNavigate('vision'); } }}>
              <div className="panel-header blue">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Eye size={24}/> Vision Lab</div>
              </div>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '1.4rem' }}>Visual Cortex Ablation</h3>
              <p style={{ margin: '0 0 20px 0', flexGrow: 1, lineHeight: '1.5' }}>
                Explore how ResNet-18 sees the world. Ablate specific visual cortex channels to cause selective blindness, or hallucinate optimal stimuli.
              </p>
              <button className="btn-blue" style={{ width: '100%', fontSize: '1rem', padding: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                ENTER VISION LAB <ArrowRight size={18}/>
              </button>
            </div>

            {/* Language Lab Card */}
            <div className="panel hover-3d" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }} onMouseEnter={playHover} onClick={() => onNavigate('language')} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onNavigate('language'); } }}>
              <div className="panel-header purple">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Network size={24}/> Language Lab</div>
              </div>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '1.4rem' }}>Attention Routing Map</h3>
              <p style={{ margin: '0 0 20px 0', flexGrow: 1, lineHeight: '1.5' }}>
                Analyze GPT-2's 144 attention heads. Visualize attention routing and token probabilities for specific prompts across all layers.
              </p>
              <button className="btn-purple" style={{ width: '100%', fontSize: '1rem', padding: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                ENTER LANGUAGE LAB <ArrowRight size={18}/>
              </button>
            </div>

            {/* AI Safety Lab Card */}
            <div className="panel hover-3d" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }} onMouseEnter={playHover} onClick={() => onNavigate('safety')} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onNavigate('safety'); } }}>
              <div className="panel-header" style={{ background: '#000', color: 'var(--accent-yellow)', borderBottom: '4px solid #000' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>⚠️ AI Safety & Alignment</div>
              </div>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '1.4rem' }}>Activation Steering & Deception</h3>
              <p style={{ margin: '0 0 20px 0', flexGrow: 1, lineHeight: '1.5' }}>
                Inject latent concept vectors (e.g. "Deception") directly into the residual stream to steer model outputs. Audit layers for internal truth representation.
              </p>
              <button className="btn-main" style={{ width: '100%', fontSize: '1rem', padding: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', background: '#000', color: '#fff' }}>
                ENTER SAFETY LAB <ArrowRight size={18}/>
              </button>
            </div>
            {/* Auto-Circuit Discovery Lab Card */}
            <div className="panel hover-3d" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', border: '4px solid var(--accent-orange)' }} onMouseEnter={playHover} onClick={() => onNavigate('discovery')} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onNavigate('discovery'); } }}>
              <div className="panel-header" style={{ background: 'var(--accent-orange)', color: '#000' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Search size={24}/> Auto-Circuit Discovery</div>
              </div>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '1.4rem' }}>Causal Tracing Engine</h3>
              <p style={{ margin: '0 0 20px 0', flexGrow: 1, lineHeight: '1.5' }}>
                Automatically hunt down the exact attention heads responsible for a specific behavior by running 144 surgical ablations in seconds.
              </p>
              <button className="btn-main" style={{ width: '100%', fontSize: '1rem', padding: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', background: 'var(--accent-orange)' }}>
                ENTER DISCOVERY LAB <ArrowRight size={18}/>
              </button>
            </div>

            {/* Audio Lab Card */}
            <div className="panel hover-3d" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', border: '4px solid var(--accent-green)' }} onMouseEnter={playHover} onClick={() => onNavigate('audio')} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onNavigate('audio'); } }}>
              <div className="panel-header" style={{ background: 'var(--accent-green)', color: '#000' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Headphones size={24}/> Sound & Speech Lab</div>
              </div>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '1.4rem' }}>Neural Audio Synthesizer</h3>
              <p style={{ margin: '0 0 20px 0', flexGrow: 1, lineHeight: '1.5' }}>
                Synthesize speech using SpeechT5 and ablate its decoder layers to hear the network struggle with phonemes and slur its words.
              </p>
              <button className="btn-main" style={{ width: '100%', fontSize: '1rem', padding: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', background: 'var(--accent-green)' }}>
                ENTER AUDIO LAB <ArrowRight size={18}/>
              </button>
            </div>

            {/* Semantic Similarity Lab Card */}
            <div className="panel hover-3d" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', border: '4px solid var(--accent-cyan)' }} onMouseEnter={playHover} onClick={() => onNavigate('similarity')} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onNavigate('similarity'); } }}>
              <div className="panel-header" style={{ background: 'var(--accent-cyan)', color: '#000' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Brain size={24}/> Semantic Similarity</div>
              </div>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '1.4rem' }}>Latent Space Topography</h3>
              <p style={{ margin: '0 0 20px 0', flexGrow: 1, lineHeight: '1.5' }}>
                Calculate the cosine similarity between hidden states of different prompts to visualize how the model groups concepts in high-dimensional space.
              </p>
              <button className="btn-main" style={{ width: '100%', fontSize: '1rem', padding: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', background: 'var(--accent-cyan)' }}>
                ENTER SIMILARITY LAB <ArrowRight size={18}/>
              </button>
            </div>
          </div>
        </RevealSection>

        {/* Foundational Literature Section */}
        <RevealSection>
          <h2 style={{ fontSize: '2.5rem', textAlign: 'center', textTransform: 'uppercase', margin: '40px 0 30px 0', fontWeight: '900', textShadow: '4px 4px 0px var(--accent-blue)' }}><BookMarked size={32} style={{ verticalAlign: 'text-bottom' }}/> Foundational Literature</h2>
          <div className="literature-grid">
            <div className="panel hover-3d" style={{ background: 'var(--panel-bg)', border: '4px dashed #000' }}>
              <h3 style={{ fontSize: '1.3rem', margin: '0 0 10px 0' }}>Anthropic's Transformer Circuits Thread</h3>
              <p style={{ fontStyle: 'italic', opacity: 0.7, margin: '0 0 15px 0' }}>Elhage et al., 2021</p>
              <p style={{ lineHeight: '1.5' }}>
                The foundational work on reverse-engineering attention heads, demonstrating that transformers can be understood as interpretable, human-readable circuits.
              </p>
              <a href="https://transformer-circuits.pub/" target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: 'var(--accent-blue)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                Read the paper <ExternalLink size={16}/>
              </a>
            </div>
            <div className="panel hover-3d" style={{ background: 'var(--panel-bg)', border: '4px dashed #000' }}>
              <h3 style={{ fontSize: '1.3rem', margin: '0 0 10px 0' }}>Anthropic: Sparse Autoencoders</h3>
              <p style={{ fontStyle: 'italic', opacity: 0.7, margin: '0 0 15px 0' }}>Bricken et al., 2023</p>
              <p style={{ lineHeight: '1.5' }}>
                Groundbreaking research on extracting interpretable, monosemantic features from language models using sparse autoencoders.
              </p>
              <a href="https://transformer-circuits.pub/2023/monosemantic-features/index.html" target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: 'var(--accent-blue)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                Read the paper <ExternalLink size={16}/>
              </a>
            </div>
          </div>
        </RevealSection>

      </div>
      
      <Footer />
    </div>
  );
}
