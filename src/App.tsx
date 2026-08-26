import React from 'react';
import { Layers, ShieldCheck, Sparkles, Terminal, Code2, Zap } from 'lucide-react';
import { appConfig } from '@/config';
import { PRIMARY_NAVIGATION } from '@/constants';
import './App.css';

export const App: React.FC = () => {
  return (
    <div className="app-layout">
      {/* Header Shell */}
      <header className="app-header glass-panel">
        <div className="brand-group">
          <div className="brand-icon">
            <Sparkles size={18} className="icon-glow" />
          </div>
          <span className="brand-title">{appConfig.name}</span>
          <span className="badge-mono">v{appConfig.version}</span>
        </div>

        <nav className="header-nav" aria-label="Primary Navigation">
          {PRIMARY_NAVIGATION.map((item) => (
            <span key={item.path} className="nav-item-placeholder">
              {item.label}
            </span>
          ))}
        </nav>

        <div className="header-status">
          <span className="status-indicator">
            <span className="status-dot"></span>
            TypeScript Strict Mode
          </span>
        </div>
      </header>

      {/* Foundation Status Showcase */}
      <main className="main-content">
        <div className="foundation-card glass-panel">
          <div className="card-header">
            <div className="card-badge">
              <Layers size={14} />
              <span>Foundation Architecture</span>
            </div>
            <h1 className="hero-title">ElseSourav Platform</h1>
            <p className="hero-subtitle">
              Clean React 19 + Vite 6 + TypeScript foundation initialized with zero-tolerance strict
              type safety and Apple-inspired developer aesthetics.
            </p>
          </div>

          <div className="grid-specs">
            <div className="spec-card">
              <div className="spec-icon-wrapper">
                <Code2 size={20} className="spec-icon" />
              </div>
              <div className="spec-body">
                <h3>Strict TypeScript</h3>
                <p>Configured with strict mode, no implicit any, and path aliasing.</p>
                <code className="spec-code">tsconfig.app.json</code>
              </div>
            </div>

            <div className="spec-card">
              <div className="spec-icon-wrapper">
                <Zap size={20} className="spec-icon" />
              </div>
              <div className="spec-body">
                <h3>Vite 6 Fast Bundling</h3>
                <p>Lightning-fast HMR and optimized production build pipeline.</p>
                <code className="spec-code">vite.config.ts</code>
              </div>
            </div>

            <div className="spec-card">
              <div className="spec-icon-wrapper">
                <ShieldCheck size={20} className="spec-icon" />
              </div>
              <div className="spec-body">
                <h3>ESLint & Formatting</h3>
                <p>Modern flat config with strict rules preventing explicit any.</p>
                <code className="spec-code">eslint.config.js</code>
              </div>
            </div>

            <div className="spec-card">
              <div className="spec-icon-wrapper">
                <Terminal size={20} className="spec-icon" />
              </div>
              <div className="spec-body">
                <h3>Typography & Design Tokens</h3>
                <p>Geist (UI), Space Grotesk (Headings), JetBrains Mono (Code).</p>
                <code className="spec-code">src/styles/index.css</code>
              </div>
            </div>
          </div>

          <div className="footer-status-bar">
            <div className="status-tag">
              <span className="dot-green"></span>
              Environment: <code>{appConfig.environment}</code>
            </div>
            <div className="status-tag">
              Architecture Status: <span className="status-accent">Ready for Next Phase</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
