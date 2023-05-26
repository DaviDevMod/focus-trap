/// <reference types="cypress" />

import { DEFAULT_ROOTS } from '../../support/commands';

context('Test how the trap behaves after a "RESUME" action is performed.', () => {
  beforeEach(() => cy.visitDemoAndBuildTrap({ roots: DEFAULT_ROOTS, lock: false }));

  describe('The focus trap should start to work again.', () => {
    it('Should trap the focus agian after "RESUME".', () => {
      cy.actionShouldSucceed('PAUSE');
    });

    it('Should Throw an error when trying to "RESUME" an inexistent trap.', () => {
      cy.actOnTrap('DEMOLISH');

      cy.actionShouldThrow('RESUME');
    });
  });
});
