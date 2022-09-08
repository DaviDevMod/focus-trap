/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

export {};

declare global {
  namespace Cypress {
    interface Chainable {
      getNextTabId: () => Cypress.Chainable<string>;
      getTabCycle: (
        len: number,
        from?: JQuery<HTMLElement>,
        firstCall?: boolean,
        cycle?: string
      ) => Cypress.Chainable<string>;
    }
  }
}

Cypress.Commands.add('getNextTabId', () => {
  cy.realPress('Tab');
  cy.focused().then((activeElement) => activeElement.get(0).id);
});

Cypress.Commands.add('getTabCycle', (len, from = null, firstCall = true, cycle = '') => {
  if (len <= 0) throw new Error('Please provide a positive length for the tab cycle.');
  if (firstCall) cy.wrap(from).focus();
  cy.getNextTabId().then((id) => (len === 1 ? cycle + id : cy.getTabCycle(len - 1, null, false, cycle + id)));
});
