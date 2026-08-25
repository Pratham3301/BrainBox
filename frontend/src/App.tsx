import { API_BASE_URL } from "./config";
import { useState, useEffect } from 'react'
import { Moon, Sun } from 'lucide-react'
import LandingPage from './LandingPage'
import VisionLab from './VisionLab'
import LanguageLab from './LanguageLab'
import ChatbotLab from './ChatbotLab'
import SafetyLab from './SafetyLab'
import SimilarityLab from './SimilarityLab'
import AudioLab from './AudioLab'
import DiscoveryLab from './DiscoveryLab'
import DocumentationLab from './DocumentationLab'
import { Home, Brain, Eye, MessageSquareWarning, Network, Bot, ShieldAlert, Headphones, Search, BookOpen } from 'lucide-react'

type View = 'landing' | 'vision' | 'language' | 'similarity' | 'chatbot' | 'safety' | 'audio' | 'discovery' | 'docs'



function App() {
  const [activeTab, setActiveTab] = useState<View>(() => {
    const hash = window.location.hash.replace('#', '') as View;
    return ['landing', 'vision', 'language', 'similarity', 'chatbot', 'safety', 'audio', 'discovery', 'docs'].includes(hash) ? hash : 'landing';
  });

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('brainbox-dark') === 'true';
  });

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
    localStorage.setItem('brainbox-dark', String(darkMode));
  }, [darkMode]);

  useEffect(() => {
    window.location.hash = activeTab;
  }, [activeTab]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as View;
      if (['landing', 'vision', 'language', 'similarity', 'chatbot', 'safety', 'audio', 'discovery', 'docs'].includes(hash)) {
        setActiveTab(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Pre-fetch layers for vision lab
  const [layers, setLayers] = useState<any[]>([])
  useEffect(() => {
    fetch(API_BASE_URL + '/api/model/layers')
      .then(res => res.json())
      .then(data => setLayers(data.layers))
      .catch(err => console.error(err))
  }, [])

  return (
    <div style={{ overflowX: 'hidden', minHeight: '100vh', position: 'relative' }}>
      {/* Dark Mode Toggle - Sarcastic */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="hover-3d"
        style={{
          position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999,
          background: darkMode ? 'var(--accent-yellow)' : '#1a1a1a',
          color: darkMode ? '#000' : '#fff',
          border: '3px solid #000', padding: '10px 16px',
          boxShadow: '4px 4px 0px #000', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '8px',
          fontWeight: '900', fontSize: '0.75rem', textTransform: 'uppercase',
          letterSpacing: '1px'
        }}
      >
        {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        {darkMode ? 'Ugh, My Eyes!' : 'Go Dark, Nerd'}
      </button>
      {activeTab !== 'landing' && (
        <div className="lab-navbar" style={{
          display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '20px', 
          padding: '12px 24px', background: 'var(--panel-bg)', borderBottom: '6px solid #000',
          position: 'sticky', top: 0, zIndex: 1000, boxShadow: '0px 10px 0px rgba(0,0,0,0.1)'
        }}>
          {/* Brand Logo */}
          <div className="hover-3d" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#000', color: 'var(--accent-yellow)', padding: '6px 14px', border: '3px solid var(--accent-yellow)', transform: 'rotate(-2deg)', cursor: 'pointer', zIndex: 100, boxShadow: '4px 4px 0px var(--accent-red)' }} onClick={() => setActiveTab('landing')}>
            <Brain className="animate-float" size={24} style={{ display: 'inline-block' }} />
            <span style={{ fontWeight: '900', fontSize: '1.2rem', letterSpacing: '2px', textTransform: 'uppercase' }}>BrainBox</span>
          </div>

          {/* Slashed Divider */}
          <div style={{ width: '4px', height: '30px', background: 'var(--text)', transform: 'rotate(15deg)', opacity: 0.3 }} />

          {/* Navigation Buttons */}
          <div className="nav-container" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', flexGrow: 1 }}>
            {(['vision', 'language', 'similarity', 'chatbot', 'audio', 'safety', 'discovery', 'docs'] as View[]).map(v => {
              const isActive = activeTab === v;
              // Unique color identity for each lab in the navbar
              const colors: Record<string, string> = {
                vision: 'var(--accent-blue)', language: 'var(--accent-purple)',
                similarity: 'var(--accent-cyan)', chatbot: 'var(--accent-yellow)',
                audio: 'var(--accent-green)', safety: 'var(--accent-red)',
                discovery: 'var(--accent-orange)', docs: '#aaa'
              };
              const activeColor = colors[v];

              return (
                <button
                  key={v}
                  className="hover-3d"
                  onClick={() => setActiveTab(v)}
                  style={{
                    padding: '8px 14px',
                    fontSize: '0.8rem',
                    fontWeight: '900',
                    textTransform: 'uppercase',
                    background: isActive ? activeColor : 'transparent',
                    color: isActive ? '#000' : 'var(--text)',
                    border: `3px solid ${isActive ? '#000' : 'var(--border-color)'}`,
                    boxShadow: isActive ? `4px 4px 0px #000` : 'none',
                    display: 'flex', alignItems: 'center', gap: '6px',
                    transform: isActive ? 'translate(-2px, -2px)' : 'none',
                    transition: 'all 0.1s ease',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    {v === 'vision' && <Eye size={16} />}
                    {v === 'language' && <MessageSquareWarning size={16} />}
                    {v === 'similarity' && <Network size={16} />}
                    {v === 'chatbot' && <Bot size={16} />}
                    {v === 'audio' && <Headphones size={16} />}
                    {v === 'safety' && <ShieldAlert size={16} />}
                    {v === 'discovery' && <Search size={16} />}
                    {v === 'docs' && <BookOpen size={16} />}
                    {v}
                  </div>
                </button>
              )
            })}
            
            <div style={{ flexGrow: 1 }} />
            
            {/* Exit Button */}
            <button className="hover-3d" onClick={() => setActiveTab('landing')} style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: '900', textTransform: 'uppercase', background: '#000', color: '#fff', border: '3px solid #000', boxShadow: '4px 4px 0px var(--accent-red)', cursor: 'pointer' }}>
              <Home size={14} /> Exit Lab
            </button>
          </div>
        </div>
      )}

      {activeTab === 'landing' && <LandingPage onNavigate={setActiveTab} />}
      {activeTab === 'vision' && <VisionLab layers={layers} />}
      {activeTab === 'language' && <LanguageLab />}
      {activeTab === 'similarity' && <SimilarityLab />}
      {activeTab === 'chatbot' && <ChatbotLab />}
      {activeTab === 'audio' && <AudioLab />}
      {activeTab === 'safety' && <SafetyLab />}
      {activeTab === 'discovery' && <DiscoveryLab />}
      {activeTab === 'docs' && <DocumentationLab />}
    </div>
  )
}

export default App
