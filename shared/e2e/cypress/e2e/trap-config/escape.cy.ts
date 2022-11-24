/// <reference types="cypress" />

import { DEFAULT_ROOTS } from '../../support/commands';

context('Test the `escape` trap configuration option.', () => {
  before(() => cy.visitDemo());

  beforeEach(() => cy.get('button[data-parent-id]').as('possibleTabbables'));

  describe('Traps should always break when the "Esc" key is pressed, unless `escape` is set to `false`.', () => {
    // TODO: Write unit tests.
    // The following cases can't be tested through the current demo app, because in it `use-simple-focus-trap`
    // is called with default values already set. Refactoring the demo would solve the problem only for
    // `use-simple-focus-trap`, which would then call `single-focus-trap` with default values already set anyway.
    it.skip('By default, traps should break on "Esc" key press.');
    // This is not really necessary with TS.
    it.skip('Traps should break on "Esc" key press when `escape` is set to an invalid value.');

    // TODO: This is just a limitation of the demo app, which may be refactored to test this case.
    it.skip('`escape` should be used as handler for "Esc" key presses, when passed as a function');

    it('When `escape` is set to `true`, traps should break on "Esc" key press', () => {
      cy.on('fail', (error) => {
        if (error.message.includes("the focus landed on an element with no 'data-order' attribute")) return;
        throw error;
      });

      cy.buildTrap({ roots: DEFAULT_ROOTS, escape: true });

      // We could `verifyTabCycle()` before pressing 'Escape', but then there would be no way to know
      // whether the test failed before or after pressing 'Escape'. Luckily, some other test would fail
      // if `buildTrap` doesn't work correctly (at the very least "tab-cycle.cy.ts"), so we are
      // justified to skip `verifyTabCycle()`, unintentionally speeding up the test.

      cy.realPress('Escape');

      cy.get('@possibleTabbables').verifyTabCycle({ direction: 'FORWARD' });
    });

    it('If `escape` is set to `false`, traps should not be influenced by "Esc" key presses .', () => {
      cy.buildTrap({ roots: DEFAULT_ROOTS, escape: false });

      cy.realPress('Escape');

      cy.get('@possibleTabbables').verifyTabCycle({ direction: 'FORWARD' });
    });
  });
});
