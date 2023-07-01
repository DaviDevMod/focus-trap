import { defineConfig } from 'cypress';
import codeCoverageTask from '@cypress/code-coverage/task';

export default defineConfig({
  video: false,
  e2e: {
    baseUrl: 'http://localhost:3000',

    // Setting an order to run the tests. The glob at the end ensures no test is left behind.
    // Note that Cypress doesn't guarantee that the order in the `specPattern` array will be
    // respected, but it currently is (and should this behaviour change, no harm is done).
    // Related issue: https://github.com/cypress-io/cypress/issues/390
    specPattern: [
      'cypress/e2e/trap-action/build.cy.ts',
      'cypress/e2e/trap-action/demolish.cy.ts',
      'cypress/e2e/trap-action/pause.cy.ts',
      'cypress/e2e/trap-action/resume.cy.ts',
      'cypress/e2e/trap-config/initialFocus.cy.ts',
      'cypress/e2e/trap-config/returnFocus.cy.ts',
      'cypress/e2e/**/**.cy.ts',
    ],

    setupNodeEvents(on, config) {
      // implement node event listeners here

      // include any other plugin code...

      codeCoverageTask(on, config);

      // It's IMPORTANT to return the config object
      // with any changed environment variables
      return config;
    },
  },
});
