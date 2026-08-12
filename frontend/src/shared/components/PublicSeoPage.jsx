import Head from 'next/head'

const SITE_URL = 'https://emergencyecho.org'
const SITE_NAME = 'EmergencyEcho'

export default function PublicSeoPage({
  title,
  description,
  path,
  eyebrow = 'EmergencyEcho',
  children,
  structuredData,
}) {
  const canonical = `${SITE_URL}${path}`
  const pageTitle = `${title} | ${SITE_NAME}`

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={description} />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={`${SITE_URL}/emergencyecho.png`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={`${SITE_URL}/emergencyecho.png`} />
        {structuredData ? (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
          />
        ) : null}
      </Head>
      <main className="seo-page">
        <nav className="seo-nav" aria-label="Public pages">
          <a className="seo-brand" href="/">
            <img alt="" src="/emergencyecho.png" />
            <span>EmergencyEcho</span>
          </a>
          <div>
            <a href="/about">About</a>
            <a href="/faq">FAQ</a>
            <a href="/contact">Contact</a>
            <a className="seo-cta" href="/signup">Get started</a>
          </div>
        </nav>
        <section className="seo-hero">
          <p>{eyebrow}</p>
          <h1>{title}</h1>
          <span>{description}</span>
        </section>
        <article className="seo-card">{children}</article>
        <footer className="seo-footer">
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms</a>
          <a href="/medical-disclaimer">Medical Disclaimer</a>
          <a href="/telemedicine-nigeria">Telemedicine Nigeria</a>
          <a href="/ai-symptom-checker-nigeria">AI Symptom Checker Nigeria</a>
        </footer>
      </main>
      <style jsx global>{`
        body {
          margin: 0;
          background: #f8fafc;
          color: #111827;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        .seo-page {
          min-height: 100vh;
          background:
            radial-gradient(circle at top left, rgba(230, 0, 0, 0.12), transparent 34rem),
            linear-gradient(180deg, #ffffff 0%, #f8fafc 48%, #eef2f7 100%);
          padding: 0 20px 48px;
        }

        .seo-nav {
          align-items: center;
          display: flex;
          gap: 20px;
          justify-content: space-between;
          margin: 0 auto;
          max-width: 1120px;
          padding: 22px 0;
        }

        .seo-nav a {
          color: #374151;
          font-weight: 800;
          margin-left: 18px;
          text-decoration: none;
        }

        .seo-brand {
          align-items: center;
          color: #111827 !important;
          display: inline-flex;
          font-size: 1.05rem;
          gap: 10px;
          margin-left: 0 !important;
        }

        .seo-brand img {
          height: 34px;
          width: 34px;
        }

        .seo-cta {
          background: #d71920;
          border-radius: 999px;
          color: #fff !important;
          padding: 10px 18px;
        }

        .seo-hero {
          margin: 54px auto 24px;
          max-width: 920px;
          text-align: center;
        }

        .seo-hero p {
          color: #d71920;
          font-size: 0.78rem;
          font-weight: 1000;
          letter-spacing: 0.16em;
          margin: 0 0 12px;
          text-transform: uppercase;
        }

        .seo-hero h1 {
          color: #0f172a;
          font-size: clamp(2.2rem, 6vw, 4.8rem);
          letter-spacing: -0.065em;
          line-height: 0.95;
          margin: 0 auto 18px;
          max-width: 920px;
        }

        .seo-hero span {
          color: #64748b;
          display: block;
          font-size: 1.08rem;
          line-height: 1.75;
          margin: 0 auto;
          max-width: 760px;
        }

        .seo-card {
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid #e5e7eb;
          border-radius: 28px;
          box-shadow: 0 24px 70px rgba(15, 23, 42, 0.08);
          margin: 0 auto;
          max-width: 920px;
          padding: clamp(24px, 5vw, 48px);
        }

        .seo-card h2 {
          color: #111827;
          font-size: 1.55rem;
          letter-spacing: -0.03em;
          margin: 34px 0 12px;
        }

        .seo-card h2:first-child {
          margin-top: 0;
        }

        .seo-card h3 {
          color: #111827;
          font-size: 1.1rem;
          margin: 24px 0 8px;
        }

        .seo-card p,
        .seo-card li {
          color: #4b5563;
          font-size: 1rem;
          line-height: 1.82;
        }

        .seo-card a {
          color: #d71920;
          font-weight: 900;
        }

        .seo-grid {
          display: grid;
          gap: 16px;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          margin: 22px 0;
        }

        .seo-tile {
          background: #fff7f7;
          border: 1px solid #fecaca;
          border-radius: 18px;
          padding: 18px;
        }

        .seo-tile strong {
          color: #991b1b;
          display: block;
          margin-bottom: 6px;
        }

        .seo-footer {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          justify-content: center;
          margin: 28px auto 0;
          max-width: 920px;
        }

        .seo-footer a {
          color: #64748b;
          font-weight: 800;
          text-decoration: none;
        }

        @media (max-width: 720px) {
          .seo-nav {
            align-items: flex-start;
            flex-direction: column;
          }

          .seo-nav div {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
          }

          .seo-nav a {
            margin-left: 0;
          }
        }
      `}</style>
    </>
  )
}
