/// <reference types="cypress" />

import { DEFAULT_ROOTS, ERROR_STEPPING_OUT_OF_THE_TRAP } from '../../support/commands';

context('Test how the trap behaves after a "PAUSE" action is performed.', () => {
  beforeEach(() => {
    cy.visitDemoAndBuildTrap({ roots: DEFAULT_ROOTS, lock: false });
    cy.get('button[data-parent-id]').as('possibleTabbables');
  });

  describe('The focus trap should chease to work.', () => {
    it('Should not trap the focus after "PAUSE".', () => {
      cy.on('fail', (error) => {
        if (error.message.includes(ERROR_STEPPING_OUT_OF_THE_TRAP)) return;
        throw error;
      });

      cy.actOnTrap('PAUSE');

      cy.get('@possibleTabbables')
        .verifyTabCycle()
        .then((verified) => {
          if (verified) throw new Error('The focus should not be trapped anymore.');
        });
    });

    it('Should Throw an error when trying to "PAUSE" an inhexistent trap.', () => {
      cy.on('fail', (error) => {
        if (error.message.includes('Cannot pause inexistent trap.')) return;
        throw error;
      });

      cy.actOnTrap('DEMOLISH');

      cy.actOnTrap('PAUSE');
    });
  });
});
