/// <reference types="cypress" />

export {};

declare global {
  namespace Cypress {
    interface Chainable {
      getNextTabTitle: (forward: boolean) => Cypress.Chainable<string>;
      getTabCycle: (
        from: JQuery<HTMLElement>,
        forward?: boolean,
        len?: number,
        firstCall?: boolean,
        cycle?: string
      ) => Cypress.Chainable<string>;
    }
  }
}

Cypress.Commands.add('getNextTabTitle', (forward) => {
  cy.focused().then((from) => {
    const keysPressed = ['Tab'];
    if (!forward) keysPressed.unshift('Shift');

    // Module '"cypress-real-events/commands/realPress"' declares 'KeyOrShortcut' locally, but it is not exported.
    cy.realPress(keysPressed as any);

    cy.focused().then((to) => {
      const fromTitle = from.get(0).title;
      const toTitle = to.get(0).title;

      if (fromTitle.startsWith('-')) expect(fromTitle.charAt(Number(forward) * -2 + 3)).to.equal(toTitle);
      // else expect(Number(fromTitle) + Number(forward) * 2 - 1 === Number(toTitle));
      // unnecessary cause the `cycle` would not match the `CORRECT_CYCLE` and the test would fail anyway.

      return toTitle;
    });
  });
});

Cypress.Commands.add('getTabCycle', (from, forward = true, len = 4, firstCall = true, cycle = '') => {
  if (len <= 0) throw new Error('Please provide a positive length for the tab cycle.');
  if (firstCall) cy.wrap(from).focus(); // `if (firstCall && !from) { Cypress throws an error };`
  cy.getNextTabTitle(forward).then((title) =>
    len === 1 ? cycle + title : cy.getTabCycle(null, forward, len - 1, false, cycle + title)
  );
});
