import { ImageResponse } from 'next/og';
import { SITE_CONFIG } from '@elsesourav/config';
import { getPublicBlogPostBySlug } from '@/features/blog/queries/get-blog-post';

export const runtime = 'nodejs';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

interface BlogPostOgProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function Image({ params }: BlogPostOgProps) {
  const { slug } = await params;

  let post;
  try {
    post = await getPublicBlogPostBySlug(slug);
  } catch {
    post = null;
  }

  const title = post?.title || 'Field Note';
  const excerpt =
    post?.excerpt ||
    'Architectural deep-dive, engineering reflections, and technical notes from ElseSourav.';
  const authorName = post?.author?.displayName || 'Sourav Barui';
  const readingTime = post?.readingTime ? `${post.readingTime} min read` : '5 min read';
  const tags: string[] = post?.tags?.map((t: { name: string }) => t.name).slice(0, 3) || [];

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
            'radial-gradient(circle at 85% 15%, rgba(139, 92, 246, 0.22) 0%, transparent 60%), radial-gradient(circle at 15% 85%, rgba(99, 102, 241, 0.14) 0%, transparent 50%)',
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
                backgroundColor: '#7c3aed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                fontWeight: 'bold',
                color: '#ffffff',
                boxShadow: '0 4px 16px rgba(124, 58, 237, 0.4)',
              }}
            >
              E
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '20px', fontWeight: 'bold', letterSpacing: '-0.02em' }}>
                {SITE_CONFIG.name}
              </span>
              <span style={{ fontSize: '13px', color: '#94a3b8' }}>Field Notes & Journal</span>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '6px 16px',
              borderRadius: '999px',
              backgroundColor: 'rgba(139, 92, 246, 0.15)',
              border: '1px solid rgba(139, 92, 246, 0.35)',
              fontSize: '14px',
              fontWeight: 600,
              color: '#ddd6fe',
            }}
          >
            <span>{readingTime}</span>
          </div>
        </div>

        {/* Center: Article Title and Excerpt */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '1000px' }}>
          <div
            style={{
              fontSize: '54px',
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              color: '#ffffff',
            }}
          >
            {title}
          </div>

          <div
            style={{
              fontSize: '22px',
              lineHeight: 1.5,
              color: '#cbd5e1',
              maxWidth: '880px',
            }}
          >
            {excerpt}
          </div>
        </div>

        {/* Bottom Bar: Author Attribution & Canonical */}
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
            <span style={{ fontSize: '15px', color: '#94a3b8' }}>Written by</span>
            <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#ffffff' }}>
              {authorName}
            </span>
            {tags.length > 0 && (
              <>
                <span style={{ fontSize: '15px', color: '#64748b' }}>•</span>
                <span style={{ fontSize: '14px', color: '#a78bfa' }}>
                  {tags.map((t: string) => `#${t}`).join(' ')}
                </span>
              </>
            )}
          </div>

          <span style={{ fontSize: '14px', color: '#8b5cf6', fontWeight: 600 }}>
            elsesourav.com/blog/{slug}
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
