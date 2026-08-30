import { ImageResponse } from 'next/og';
import { SITE_CONFIG } from '@elsesourav/config';
import { getPublicAppBySlug } from '@/features/apps/queries/get-apps';

export const runtime = 'nodejs';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

interface AppOgProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function Image({ params }: AppOgProps) {
  const { slug } = await params;

  let app;
  try {
    app = await getPublicAppBySlug(slug);
  } catch {
    app = null;
  }

  const appName = app?.name || 'Application';
  const categoryName = app?.primaryCategory || 'Software';
  const description =
    app?.shortDescription ||
    app?.description?.slice(0, 140) ||
    'High-performance web tool and application built by Sourav Barui.';
  const version = app?.currentVersion ? `v${app.currentVersion}` : 'v1.0';
  const tags: readonly string[] = app?.tags?.slice(0, 4) || [];

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
            'radial-gradient(circle at 85% 15%, rgba(99, 102, 241, 0.22) 0%, transparent 60%), radial-gradient(circle at 20% 90%, rgba(14, 165, 233, 0.12) 0%, transparent 50%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Top Header Bar */}
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
                boxShadow: '0 4px 16px rgba(79, 70, 229, 0.4)',
              }}
            >
              E
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '20px', fontWeight: 'bold', letterSpacing: '-0.02em' }}>
                {SITE_CONFIG.name}
              </span>
              <span style={{ fontSize: '13px', color: '#94a3b8' }}>Applications Directory</span>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              borderRadius: '999px',
              backgroundColor: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.35)',
              fontSize: '14px',
              fontWeight: 600,
              color: '#c7d2fe',
            }}
          >
            <span>{categoryName}</span>
          </div>
        </div>

        {/* Center: App Identity and Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '1000px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                fontSize: '60px',
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: '-0.03em',
                color: '#ffffff',
              }}
            >
              {appName}
            </div>
            <span
              style={{
                fontSize: '14px',
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: '6px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: '#e2e8f0',
                marginTop: '10px',
              }}
            >
              {version}
            </span>
          </div>

          <div
            style={{
              fontSize: '24px',
              lineHeight: 1.5,
              color: '#cbd5e1',
              maxWidth: '880px',
            }}
          >
            {description}
          </div>
        </div>

        {/* Bottom Metadata & Status */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '28px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {tags.map((tag, idx) => (
              <span
                key={idx}
                style={{
                  fontSize: '13px',
                  padding: '4px 12px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#94a3b8',
                }}
              >
                #{tag}
              </span>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '999px',
                  backgroundColor: '#34d399',
                }}
              />
              <span style={{ fontSize: '14px', color: '#94a3b8' }}>Live on ElseSourav</span>
            </div>
            <span style={{ fontSize: '14px', color: '#6366f1', fontWeight: 600 }}>
              elsesourav.com/apps/{slug}
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
