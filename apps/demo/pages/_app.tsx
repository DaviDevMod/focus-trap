import '../styles/globals.css';
import type { AppProps } from 'next/app';

function MyApp({ Component, pageProps }: AppProps) {
  // https://docs.cypress.io/api/commands/window#Start-tests-when-app-is-ready
  // https://github.com/cypress-io/cypress/issues/3924#issuecomment-481430796
  // @ts-ignore
  if (global.window?.Cypress) {
    // @ts-ignore
    window.appReady = true;
  }

  return <Component {...pageProps} />;
}

export default MyApp;
