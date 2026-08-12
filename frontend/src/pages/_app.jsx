import Head from 'next/head'
import Script from 'next/script'
import '../index.css'

export default function NextApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
        <style>{`
          .goog-te-banner-frame.skiptranslate { display: none !important; }
          body { top: 0px !important; }
          body { visibility: visible !important; }
          #google_translate_element { display: none !important; }
        `}</style>
      </Head>
      <div id="google_translate_element"></div>
      <Script
        id="google-translate-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            function googleTranslateElementInit() {
              new google.translate.TranslateElement({
                pageLanguage: 'en',
                autoDisplay: false
              }, 'google_translate_element');
            }
          `,
        }}
      />
      <Script
        src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        strategy="afterInteractive"
      />
      <Component {...pageProps} />
    </>
  )
}
