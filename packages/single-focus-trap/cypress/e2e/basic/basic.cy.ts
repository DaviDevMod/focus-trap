/// <reference types="cypress" />

const CORRECT_FORWARD_CYCLE = '0123401234';
const CORRECT_BACKWARD_CYCLE = CORRECT_FORWARD_CYCLE.split('').reverse().join('');
let possibleTabbables: HTMLCollectionOf<HTMLButtonElement>;

context('Basic focus trap behaviour', () => {
  before(() => {
    cy.visit('http://localhost:3000', {
      onLoad(win) {
        possibleTabbables = win.document.getElementsByTagName('button');
      },
    });
  });

  describe('The focus should cycle within the trap following a specific order, due to tab index values', () => {
    it('Should cycle forward', () => {
      cy.wrap(possibleTabbables).each((element) => {
        cy.getTabCycle(element).then((cycle) => {
          expect(CORRECT_FORWARD_CYCLE).to.have.string(cycle);
        });
      });
    });

    it('Should cycle backward', () => {
      cy.wrap(possibleTabbables).each((element) => {
        cy.getTabCycle(element, false).then((cycle) => {
          expect(CORRECT_BACKWARD_CYCLE).to.have.string(cycle);
        });
      });
    });

    // it(`The focus trap should aknowledge relevant changes in its tabbable elements;
    // e.g.: new tabbable elements appearing in the trap or former tabbable elements becoming untabbable.`, () => {});
  });
});
