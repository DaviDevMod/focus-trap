/// <reference types="cypress" />

import { EXPECTED_ORDER, DEFAULT_TEST_CYCLE_LENGTH } from '../../support/commands';

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

  describe('The focus trap should aknowledge changes in the tabbing order of its tabbable elements', () => {
    // e.g.: new tabbable elements appearing in the trap, or former tabbable elements becoming untabbable.
    // For simplicy, here we are testing the reactivity of the trap only by changing the tab index of one
    // of its elements (from `0` to `-1`); but the trap reacts to a variety of changes:
    // see `mutationObserverInit` in 'single-focus-trap/src/util.ts' for more details.

    it('Should aknowledge that a tabbable element in the trap has become untabbable', () => {
      cy.get('#clickMe').then((JQElement) => {
        const clickMe = JQElement.get(0);

        // The click causes the tab index of an element in the trap to change from `0` to `-1`.
        clickMe.click();

        // The `title` of the modified element is being removed from the `order` expected by `verifyTabCycle`.
        const newExpectedOrder = EXPECTED_ORDER.replace(clickMe.title, '');

        cy.verifyTabCycle(possibleTabbables, 'FORWARD', DEFAULT_TEST_CYCLE_LENGTH, newExpectedOrder);
        cy.verifyTabCycle(possibleTabbables, 'BACKWARD', DEFAULT_TEST_CYCLE_LENGTH, newExpectedOrder);
      });
    });
  });
});
