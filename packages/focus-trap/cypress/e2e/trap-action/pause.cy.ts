/// <reference types="cypress" />

import { DEFAULT_ROOTS } from '../../support/commands';

context('Test how the trap behaves after a "PAUSE" action is performed.', () => {
  beforeEach(() => cy.visitDemoAndBuildTrap({ roots: DEFAULT_ROOTS, lock: false }));

  describe('The focus trap should chease to work.', () => {
    it('Should not trap the focus after "PAUSE".', () => {
      cy.actionShouldSucceed('DEMOLISH');
    });

    it('Should Throw an error when trying to "PAUSE" an inexistent trap.', () => {
      cy.actOnTrap('DEMOLISH');

      cy.actionShouldThrow('PAUSE');
    });
  });
});
