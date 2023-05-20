/*
React's "strict mode" will build a trap twice before the tests are run.
The `initialFocus` of the first trap will be both the `initialFocus` and
the default `returnFocus` of the second trap.
So when relying on the default, we always need to tab away from `initialFocus`
to prove whether `focusTrap` is returning the focus to `returnFocus`.
*/

/// <reference types="cypress" />

import { Focusable } from '../../../src/state';
import { DEFAULT_ROOTS } from '../../support/commands';

context('Test the `returnFocus` trap configuration option.', () => {
  describe('A return focus should always be given, unless `returnFocus` is set to `false`.', () => {
    it('By default, the return focus should be given to what was the active element at the time the trap was built.', () => {
      const INITIAL_FOCUS = 'A';

      cy.visitDemoAndBuildTrap({ roots: DEFAULT_ROOTS, initialFocus: INITIAL_FOCUS });

      cy.realPress('Tab');
      cy.get(`#${INITIAL_FOCUS}`).should('not.be.focused');

      cy.realPress('Escape');
      cy.get(`#${INITIAL_FOCUS}`).should('be.focused');
    });

    it('When `returnfocus` is set to `true`, the return focus should be given to what was the active element at the time the trap was built', () => {
      const INITIAL_FOCUS = 'A';

      cy.visitDemoAndBuildTrap({ roots: DEFAULT_ROOTS, initialFocus: INITIAL_FOCUS, returnFocus: true });

      cy.realPress('Tab');
      cy.get(`#${INITIAL_FOCUS}`).should('not.be.focused');

      cy.realPress('Escape');
      cy.get(`#${INITIAL_FOCUS}`).should('be.focused');
    });

    it('If `returnfocus` is set to `false`, no return focus should be given.', () => {
      cy.visitDemoAndBuildTrap({ roots: DEFAULT_ROOTS, returnFocus: false });

      // TODO: I think it's a bug, I should probably open an issue.
      // Aliasing `.focused()` directly would make the alias follow `document.activeElement`.
      cy.focused()
        .then(($focused) => cy.wrap($focused.get(0)))
        .as('defaultInitialFocus');

      cy.realPress('Tab');

      cy.focused()
        .as('activeElement')
        .then(($activeElement) => {
          cy.get('@defaultInitialFocus').then(($defaultInitialFocus) => {
            expect($activeElement.get(0)).to.not.eq($defaultInitialFocus.get(0));
          });
        });

      cy.realPress('Escape');

      cy.get('@activeElement').should('be.focused');
    });

    it('The return focus should be given to the element with the specified id', () => {
      const RETURN_FOCUS = 'A';

      cy.visitDemoAndBuildTrap({ roots: DEFAULT_ROOTS, returnFocus: RETURN_FOCUS });

      cy.get(`#${RETURN_FOCUS}`).as('returnFocus').should('not.be.focused');

      cy.realPress('Escape');

      cy.get('@returnFocus').should('be.focused');
    });

    it("When `returnfocus` is set to a string that doesn't match any `id` in the DOM, the return focus should be given to what was the active element at the time the trap was built.", () => {
      const INITIAL_FOCUS = 'A';
      const ID_NOT_IN_DOM = 'nonononononono';

      cy.visitDemoAndBuildTrap({ roots: DEFAULT_ROOTS, initialFocus: INITIAL_FOCUS, returnFocus: ID_NOT_IN_DOM });

      cy.get(`#${ID_NOT_IN_DOM}`).should('not.exist');

      cy.realPress('Tab');
      cy.get(`#${INITIAL_FOCUS}`).should('not.be.focused');

      cy.realPress('Escape');
      cy.get(`#${INITIAL_FOCUS}`).should('be.focused');
    });
  });
});
