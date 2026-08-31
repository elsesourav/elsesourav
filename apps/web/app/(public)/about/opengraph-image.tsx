import { ImageResponse } from 'next/og';
import { SITE_CONFIG } from '@elsesourav/config';

export const runtime = 'nodejs';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '64px',
        backgroundColor: '#09090b',
        color: '#ffffff',
        fontFamily: 'sans-serif',
        backgroundImage:
          'radial-gradient(circle at 85% 15%, rgba(99, 102, 241, 0.2) 0%, transparent 60%), radial-gradient(circle at 15% 85%, rgba(14, 165, 233, 0.12) 0%, transparent 50%)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              backgroundColor: '#4f46e5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              fontWeight: 'bold',
              color: '#ffffff',
            }}
          >
            E
          </div>
          <span style={{ fontSize: '20px', fontWeight: 'bold' }}>{SITE_CONFIG.name}</span>
        </div>

        <div
          style={{
            padding: '6px 16px',
            borderRadius: '999px',
            backgroundColor: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid rgba(99, 102, 241, 0.35)',
            fontSize: '14px',
            fontWeight: 600,
            color: '#c7d2fe',
          }}
        >
          Creator Profile & Engineering Philosophy
        </div>
      </div>

      {/* Center: Profile Narrative */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '980px' }}>
        <div
          style={{
            fontSize: '56px',
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            color: '#ffffff',
          }}
        >
          Sourav Barui
        </div>
        <div
          style={{
            fontSize: '24px',
            color: '#a5b4fc',
            fontWeight: 600,
          }}
        >
          Software Engineer & Independent Creator
        </div>
        <div
          style={{
            fontSize: '20px',
            lineHeight: 1.5,
            color: '#cbd5e1',
            maxWidth: '860px',
          }}
        >
          Building thoughtful software, developer tools, web applications, and architectural
          experiments with a focus on craft, performance, and accessibility.
        </div>
      </div>

      {/* Bottom Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '28px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: '#94a3b8',
            fontSize: '15px',
          }}
        >
          <span>TypeScript</span>
          <span>•</span>
          <span>Next.js</span>
          <span>•</span>
          <span>Systems Design</span>
          <span>•</span>
          <span>WASM</span>
          <span>•</span>
          <span>Developer Tools</span>
        </div>

        <span style={{ fontSize: '14px', color: '#6366f1', fontWeight: 600 }}>
          elsesourav.com/about
        </span>
      </div>
    </div>,
    {
      ...size,
    }
  );
}
