/// <reference types="cypress" />

const CORRECT_CYCLE = 'abcdeabcde';
const LENGTH_TEST_CYCLE = 4;
let possibleTabbables: HTMLCollectionOf<HTMLButtonElement>;

context('Basic tab testing', () => {
  before(() => {
    cy.visit('http://localhost:3000', {
      onLoad(win) {
        possibleTabbables = win.document.getElementsByTagName('button');
      },
    });
  });

  describe('Basic focus trap behaviour', () => {
    it('The focus should cycle within the trap following a specific order, due to tab index values', () => {
      cy.wrap(possibleTabbables).each((element) => {
        cy.getTabCycle(LENGTH_TEST_CYCLE, element).then((cycle) => {
          expect(cycle).to.have.length(LENGTH_TEST_CYCLE);
          expect(CORRECT_CYCLE).to.have.string(cycle);
        });
      });
    });

    it(`The focus trap should aknowledge relevant changes in its tabbable elements;
    e.g.: new tabbable elements appearing in the trap or former tabbable elements becoming untabbable.`, () => {});
  });
});
