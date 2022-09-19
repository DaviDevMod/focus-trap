/// <reference types="cypress" />

let possibleTabbables: HTMLCollectionOf<HTMLButtonElement>;

context('Basic focus trap behaviour', () => {
  before(() => {
    cy.visit('http://localhost:3000', {
      onLoad(win) {
        possibleTabbables = win.document.getElementsByTagName('button');
      },
    });
  });

  describe('The focus should cycle within the trap following a specific order, dictated by tab index values', () => {
    it('Should cycle forward', () => {
      cy.verifyTabCycle(possibleTabbables);
    });

    it('Should cycle backward', () => {
      cy.verifyTabCycle(possibleTabbables, 'BACKWARD');
    });
  });

  // describe('The focus should cycle within the trap following a specific order, dictated by tab index values', () => {
  //   it(`The focus trap should aknowledge relevant changes in its tabbable elements;
  //   e.g.: new tabbable elements appearing in the trap or former tabbable elements becoming untabbable.`, () => {
  //     cy.verifyTabCycle(possibleTabbables);
  //     cy.verifyTabCycle(possibleTabbables, 'BACKWARD');

  //     // remove elements

  //     // verify again
  //   });
  // });
});
