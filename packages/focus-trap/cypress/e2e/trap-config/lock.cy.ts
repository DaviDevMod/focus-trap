/// <reference types="cypress" />

import { DEFAULT_ROOTS } from '../../support/commands';

context('Test the `lock` trap configuration option.', () => {
  describe('Clicks outside of the trap should be possible only when `lock` is set to the boolean `false`.', () => {
    it('Clicks outside of the trap should be prevented by default.', () => {
      const ATTEMPT_FOCUS = 'A';

      cy.visitDemoAndBuildTrap({ roots: DEFAULT_ROOTS });

      cy.get(`#${ATTEMPT_FOCUS}`).as('attemptFocus').click();

      cy.get('@attemptFocus').should('not.be.focused');
    });

    it('Clicks outside of the trap should be prevented when `lock` is set to `true`.', () => {
      const ATTEMPT_FOCUS = 'A';

      cy.visitDemoAndBuildTrap({ roots: DEFAULT_ROOTS, lock: true });

      cy.get(`#${ATTEMPT_FOCUS}`).as('attemptFocus').click();

      cy.get('@attemptFocus').should('not.be.focused');
    });

    it('The focus trap should not interfere with clicks when `lock` is set to `true`.', () => {
      const ATTEMPT_FOCUS = 'A';

      cy.visitDemoAndBuildTrap({ roots: DEFAULT_ROOTS, lock: false });

      cy.get(`#${ATTEMPT_FOCUS}`).as('attemptFocus').click();

      cy.get('@attemptFocus').should('be.focused');
    });

    // I will write it eventually.
    it.skip('`lock` should be used as handler for clicks outside of the trap, when passed as a function', () => {});
  });
});
