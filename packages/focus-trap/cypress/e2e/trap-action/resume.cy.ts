/// <reference types="cypress" />

import { DEFAULT_ROOTS } from '../../support/commands';

context('Test how the trap behaves after a "RESUME" action is performed.', () => {
  beforeEach(() => {
    cy.visitDemoAndBuildTrap({ roots: DEFAULT_ROOTS, lock: false });
    cy.get('button[data-parent-id]').as('possibleTabbables');
  });

  describe('The focus trap should start to work again.', () => {
    it('Should trap the focus agian after "RESUME".', () => {
      cy.actOnTrap('PAUSE');

      cy.actOnTrap('RESUME');

      cy.get('@possibleTabbables').verifyTabCycle();
    });

    it('Should Throw an error when trying to "RESUME" an inhexistent trap.', () => {
      cy.on('fail', (error) => {
        if (error.message.includes('Cannot resume inexistent trap.')) return;
        throw error;
      });

      cy.actOnTrap('DEMOLISH');

      cy.actOnTrap('RESUME');
    });
  });
});
