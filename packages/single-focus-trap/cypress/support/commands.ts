/// <reference types="cypress" />

export const EXPECTED_ORDER = '0123456';
export const DEFAULT_TEST_CYCLE_LENGTH = 4;

type Direction = 'FORWARD' | 'BACKWARD';

declare global {
  namespace Cypress {
    interface Chainable {
      getNextTabTitle: (direction?: Direction) => Cypress.Chainable<string>;
      getTabCycle: (
        from: JQuery<HTMLElement>,
        direction?: Direction,
        len?: number,
        firstCall?: boolean,
        cycle?: string
      ) => Cypress.Chainable<string>;
      verifyTabCycle: (collection: JQuery<HTMLElement>, direction?: Direction, len?: number, order?: string) => void;
    }
  }
}

Cypress.Commands.add('getNextTabTitle', (direction = 'FORWARD') => {
  cy.focused().then((from) => {
    const keysPressed = ['Tab'];
    if (direction === 'BACKWARD') keysPressed.unshift('Shift');

    // Why `as any`? cause '"cypress-real-events/commands/realPress"' declares 'KeyOrShortcut' locally, but it is not exported.
    cy.realPress(keysPressed as any);

    cy.focused().then((to) => {
      const fromTitle = from.get(0).title;
      const toTitle = to.get(0).title;

      // Check that elements outside the trap "pass the focus" to the right elements inside the trap.
      if (fromTitle.startsWith('-')) expect(fromTitle.charAt(direction === 'FORWARD' ? 1 : 3)).to.equal(toTitle);

      return toTitle;
    });
  });
});

Cypress.Commands.add('getTabCycle', (from, direction = 'FORWARD', len = 0, firstCall = true, cycle = '') => {
  if (len <= 0) throw new Error('Please provide a positive length for the tab cycle.');
  if (firstCall) cy.wrap(from).focus(); // `if (firstCall && !from) { Cypress throws an error };`
  cy.getNextTabTitle(direction).then((title) =>
    len === 1 ? cycle + title : cy.getTabCycle(null, direction, len - 1, false, cycle + title)
  );
});

Cypress.Commands.add(
  'verifyTabCycle',
  (collection, direction = 'FORWARD', len = DEFAULT_TEST_CYCLE_LENGTH, order = EXPECTED_ORDER) => {
    const correctCycle = {
      FORWARD: order.repeat(Math.ceil(len / order.length) + 1),
      get BACKWARD() {
        return this.FORWARD.split('').reverse().join('');
      },
    };

    cy.wrap(collection).each((element) => {
      cy.getTabCycle(element, direction, len).then((cycle) => {
        expect(cycle).to.have.length(len);
        expect(correctCycle[direction]).to.have.string(cycle);
      });
    });
  }
);
