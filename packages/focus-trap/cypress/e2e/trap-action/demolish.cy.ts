/// <reference types="cypress" />

import { DEFAULT_ROOTS } from '../../support/commands';

context('Test how the trap behaves after a "DEMOLISH" action is performed.', () => {
  beforeEach(() => cy.visitDemoAndBuildTrap({ roots: DEFAULT_ROOTS, lock: false }));

  describe('The focus trap should cease to work.', () => {
    it('Should not trap the focus after "DEMOLISH".', () => {
      cy.actionShouldSucceed('DEMOLISH');
    });

    it('Should Throw an error when trying to "DEMOLISH" an inexistent trap.', () => {
      cy.actOnTrap('DEMOLISH');

      cy.actionShouldThrow('DEMOLISH');
    });
  });
});
