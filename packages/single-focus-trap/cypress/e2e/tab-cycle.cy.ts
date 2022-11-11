/// <reference types="cypress" />

context('Testing how the focus cycles within the trap when the Tab key is pressed.', () => {
  before(() => {
    cy.visitDemo();
    cy.buildTrap({ roots: ['group 2', 'group 4'] });
  });

  beforeEach(() => cy.get('button[data-parent-id]').as('possibleTabbables'));

  describe('The focus should cycle within the trap following a specific order, dictated by document order and tab index values', () => {
    it('Should cycle forward', () => {
      cy.get('@possibleTabbables').verifyTabCycle({ direction: 'FORWARD' });
    });

    it('Should cycle backward', () => {
      cy.get('@possibleTabbables').verifyTabCycle({ direction: 'BACKWARD' });
    });
  });
});
