/// <reference types="cypress" />

context('Testing how the focus cycles within the trap when the Tab key is pressed.', () => {
  before(() => cy.visit('/'));

  beforeEach(() => cy.get('button').as('possibleTabbables'));

  describe('The focus should cycle within the trap following a specific order, dictated by tab index values', () => {
    it('Should cycle forward', () => {
      cy.get('@possibleTabbables').then((possibleTabbables) => {
        cy.verifyTabCycle(possibleTabbables);
      });
    });

    it('Should cycle backward', () => {
      cy.get('@possibleTabbables').then((possibleTabbables) => {
        cy.verifyTabCycle(possibleTabbables, 'BACKWARD');
      });
    });
  });
});
