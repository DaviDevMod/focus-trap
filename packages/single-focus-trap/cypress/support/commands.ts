/// <reference types="cypress" />

export {};

type Direction = 'FORWARD' | 'BACKWARD';

const CORRECT_CYCLE = '01234';
const DEFAULT_TEST_CYCLE_LENGTH = 4;

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
      verifyTabCycle: (collection: HTMLCollectionOf<HTMLButtonElement>, direction?: Direction, len?: number) => void;
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

Cypress.Commands.add('verifyTabCycle', (collection, direction = 'FORWARD', len = DEFAULT_TEST_CYCLE_LENGTH) => {
  const extendedCorrectCycle = {
    FORWARD: CORRECT_CYCLE.repeat(Math.ceil(DEFAULT_TEST_CYCLE_LENGTH / CORRECT_CYCLE.length) + 1),
    get BACKWARD() {
      return this.FORWARD.split('').reverse().join('');
    },
  };

  cy.wrap(collection).each((element) => {
    cy.getTabCycle(element, direction, len).then((cycle) => {
      expect(cycle).to.have.length(DEFAULT_TEST_CYCLE_LENGTH);
      expect(extendedCorrectCycle[direction]).to.have.string(cycle);
    });
  });
});
