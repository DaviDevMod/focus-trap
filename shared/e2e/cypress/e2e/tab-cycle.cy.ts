/// <reference types="cypress" />

import { DEFAULT_ROOTS } from '../support/commands';

context('Test how the focus cycles within the trap when the Tab key is pressed.', () => {
  before(() => {
    cy.visitDemo();
    cy.buildTrap({ roots: DEFAULT_ROOTS });
  });

  beforeEach(() => cy.get('button[data-parent-id]').as('possibleTabbables'));

  describe('The focus should cycle within the trap following a specific order, dictated by document order and tab index values.', () => {
    it('Should cycle forward', () => {
      cy.get('@possibleTabbables').verifyTabCycle({ direction: 'FORWARD', check: true });
    });

    it('Should cycle backward', () => {
      cy.get('@possibleTabbables').verifyTabCycle({ direction: 'BACKWARD', check: true });
    });
  });
});
