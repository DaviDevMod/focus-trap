import '../styles/globals.css';
import type { AppProps } from 'next/app';

function MyApp({ Component, pageProps }: AppProps) {
  // @ts-ignore
  if (global.window?.Cypress) {
    // @ts-ignore
    global.window.appReady = true;
  }

  return <Component {...pageProps} />;
}

export default MyApp;
