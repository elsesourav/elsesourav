import { ImageResponse } from 'next/og';
import { SITE_CONFIG } from '@elsesourav/config';

export const runtime = 'nodejs';
export const alt = `${SITE_CONFIG.name} — Personal Software Studio & Digital Archive`;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
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
            'radial-gradient(circle at 85% 15%, rgba(99, 102, 241, 0.18) 0%, transparent 60%), radial-gradient(circle at 15% 85%, rgba(56, 189, 248, 0.12) 0%, transparent 50%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Top Bar: Brand Identifier */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                backgroundColor: '#4f46e5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '26px',
                fontWeight: 'bold',
                color: '#ffffff',
                boxShadow: '0 8px 24px rgba(79, 70, 229, 0.4)',
              }}
            >
              E
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '24px', fontWeight: 'bold', letterSpacing: '-0.02em' }}>
                {SITE_CONFIG.name}
              </span>
              <span style={{ fontSize: '14px', color: '#94a3b8' }}>elsesourav.com</span>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 18px',
              borderRadius: '999px',
              backgroundColor: 'rgba(99, 102, 241, 0.12)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              fontSize: '14px',
              fontWeight: 600,
              color: '#a5b4fc',
            }}
          >
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '999px',
                backgroundColor: '#34d399',
              }}
            />
            <span>Software & Systems Studio</span>
          </div>
        </div>

        {/* Main Center Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '980px' }}>
          <div
            style={{
              fontSize: '56px',
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              color: '#ffffff',
            }}
          >
            Building software, tools, games, and experiments.
          </div>
          <div
            style={{
              fontSize: '22px',
              lineHeight: 1.5,
              color: '#cbd5e1',
              maxWidth: '840px',
            }}
          >
            A curated personal portfolio of high-performance web applications, developer utilities,
            interactive systems, and architectural field notes.
          </div>
        </div>

        {/* Bottom Bar: Creator Credentials */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '28px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '16px', color: '#94a3b8' }}>Built by</span>
            <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#ffffff' }}>
              Sourav Barui
            </span>
            <span style={{ fontSize: '16px', color: '#64748b' }}>•</span>
            <span style={{ fontSize: '16px', color: '#94a3b8' }}>Independent Software Creator</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <span
              style={{
                fontSize: '14px',
                padding: '6px 14px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                color: '#e2e8f0',
              }}
            >
              Apps
            </span>
            <span
              style={{
                fontSize: '14px',
                padding: '6px 14px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                color: '#e2e8f0',
              }}
            >
              Field Notes
            </span>
            <span
              style={{
                fontSize: '14px',
                padding: '6px 14px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                color: '#e2e8f0',
              }}
            >
              Archive
            </span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
