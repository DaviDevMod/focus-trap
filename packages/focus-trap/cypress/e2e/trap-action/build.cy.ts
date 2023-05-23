/// <reference types="cypress" />

import { DEFAULT_ROOTS } from '../../support/commands';

context('Test how the trap behaves after a "BUILD" action is performed.', () => {
  beforeEach(() => {
    cy.visitDemoAndBuildTrap({ roots: DEFAULT_ROOTS, lock: false });
    cy.get('button[data-parent-id]').as('possibleTabbables');
  });

  describe('The focus should cycle within the trap following a specific order, dictated by document order and tab index values.', () => {
    it('Should cycle forward', () => {
      cy.get('@possibleTabbables').verifyTabCycle({ check: true });
    });

    it('Should cycle backward', () => {
      cy.get('@possibleTabbables').verifyTabCycle({ direction: 'BACKWARD', check: true });
    });
  });
});
