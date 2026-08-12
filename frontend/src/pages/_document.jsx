import Document, { Head, Html, Main, NextScript } from 'next/document'

export default class EmergencyEchoDocument extends Document {
  render() {
    return (
      <Html lang="en" suppressHydrationWarning>
        <Head />
        <body suppressHydrationWarning>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
