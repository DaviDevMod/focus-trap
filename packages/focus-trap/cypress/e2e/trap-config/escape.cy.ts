/// <reference types="cypress" />

import { DEFAULT_ROOTS, ERROR_STEPPING_OUT_OF_THE_TRAP } from '../../support/commands';

context('Test the `escape` trap configuration option.', () => {
  describe('Traps should always break when the "Esc" key is pressed, unless `escape` is set to `false`.', () => {
    it('By default, traps should break on "Esc" key press.', () => {
      cy.on('fail', (error) => {
        if (error.message.includes(ERROR_STEPPING_OUT_OF_THE_TRAP)) return;
        throw error;
      });

      cy.visitDemoAndBuildTrap({ roots: DEFAULT_ROOTS });

      cy.get('button[data-parent-id]').as('possibleTabbables');

      // We could `verifyTabCycle()` before pressing 'Escape', but then there would be no way to know
      // whether the test failed before or after pressing 'Escape'. Luckily, some other test would fail
      // if `visitDemoAndBuildTrap` doesn't work correctly (at the very least "trap-action/build.cy.ts"),
      // so we are justified to skip `verifyTabCycle()`, also speeding up the test.

      cy.realPress('Escape');

      cy.get('@possibleTabbables')
        .verifyTabCycle()
        .then(() => {
          throw new Error('The focus should not be trapped any more.');
        });
    });

    it('When `escape` is set to `true`, traps should break on "Esc" key press', () => {
      cy.on('fail', (error) => {
        if (error.message.includes(ERROR_STEPPING_OUT_OF_THE_TRAP)) return;
        throw error;
      });

      cy.visitDemoAndBuildTrap({ roots: DEFAULT_ROOTS, escape: true });

      cy.get('button[data-parent-id]').as('possibleTabbables');

      cy.realPress('Escape');

      cy.get('@possibleTabbables')
        .verifyTabCycle()
        .then(() => {
          throw new Error('The focus should not be trapped any more.');
        });
    });

    it('If `escape` is set to `false`, traps should not be influenced by "Esc" key presses .', () => {
      cy.visitDemoAndBuildTrap({ roots: DEFAULT_ROOTS, escape: false });

      cy.get('button[data-parent-id]').as('possibleTabbables');

      cy.realPress('Escape');

      cy.get('@possibleTabbables').verifyTabCycle();
    });
  });
});
