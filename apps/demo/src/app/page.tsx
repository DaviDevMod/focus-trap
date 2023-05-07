'use client';

import { Playground } from '../components/playground/Playground';

export default function HomePage() {
  // https://docs.cypress.io/api/commands/window#Start-tests-when-app-is-ready
  // https://github.com/cypress-io/cypress/issues/3924#issuecomment-481430796
  // @ts-ignore
  if (global.window?.Cypress) {
    // @ts-ignore
    window.appReady = true;
  }

  return <Playground />;
}
