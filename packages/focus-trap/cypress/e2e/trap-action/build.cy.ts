/// <reference types="cypress" />

import { DEFAULT_ROOTS } from '../../support/commands';

context('Test how the trap behaves after a "BUILD" action is performed.', () => {
  // `check: true` is a stricter but slower way to verify that the trap is doing its job,
  // checking that elements outside the trap pass the focus to the right elements inside the trap.
  describe('The focus should cycle within the trap following a specific order, dictated by document order and tab index values.', () => {
    beforeEach(() => {
      cy.visitDemoAndBuildTrap({ roots: DEFAULT_ROOTS, lock: false });
      cy.get('button[data-parent-id]').as('possibleTabbables');
    });

    it('Should cycle forward', () => {
      cy.get('@possibleTabbables').verifyTabCycle('FORWARD', true);
    });

    it('Should cycle backward', () => {
      cy.get('@possibleTabbables').verifyTabCycle('BACKWARD', true);
    });
  });

  describe('An array of `roots` is valid "BUILD" action.', () => {
    it('Should "BUILD" with an array of `roots`.', () => {
      cy.visitDemoAndBuildTrap(DEFAULT_ROOTS);

      cy.get('button[data-parent-id]').verifyTabCycle();
    });
  });
});
