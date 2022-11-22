/// <reference types="cypress" />

import { DEFAULT_ROOTS } from '../../support/commands';

context('Test the `escape` trap configuration option.', () => {
  before(() => cy.visitDemo());

  beforeEach(() => cy.get('button[data-parent-id]').as('possibleTabbables'));

  describe('Traps should always break when the "Esc" key is pressed, unless `escape` is set to `false`.', () => {
    // TODO: The fact is that the demo app uses `single-focus-trap` through `use-simple-focus-trap`,
    // which will `resolveConfig()` before calling `single-focus-trap` with default values already set.
    // There are many ways to solve this, but I think I'll go for unit tests just to practice with them.
    it.skip('By default, traps should break on "Esc" key press.');
    // This is not strictly necessary cause TS would prevent it, but it's still good for JS and non-typesafe code.
    it.skip('Traps should break on "Esc" key press when `escape` is set to an invalid value.');

    // TODO: This is just a limitation of the demo app, again, I gotta do some practice with unit testing.
    it.skip('`escape` should be used as handler for "Esc" key presses, when passed as a function');

    it('When `escape` is set to `true`, traps should break on "Esc" key press', () => {
      cy.on('fail', (error) => {
        if (error.message.includes("the focus landed on an element with no 'data-order' attribute")) return;
        throw error;
      });

      cy.buildTrap({ roots: DEFAULT_ROOTS, escape: true });

      // We could `verifyTabCycle()` before pressing 'Escape', but then there would be no way to know
      // whether the test failed before or after pressing 'Escape'.
      // In any case, other tests would fail if `buildTrap` doesn't work.

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
