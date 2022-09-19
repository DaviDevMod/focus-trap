/// <reference types="cypress" />

import { EXPECTED_ORDER, DEFAULT_TEST_CYCLE_LENGTH } from '../support/commands';

context('Testing reactivity of the focus trap in regard to changes in the tab order of its elements.', () => {
  before(() => cy.visit('/'));

  beforeEach(() => cy.get('button').as('possibleTabbables'));

  describe('The focus trap should aknowledge changes in the tab order of its tabbable elements', () => {
    // e.g.: new tabbable elements appearing in the trap, or former tabbable elements becoming untabbable.
    // For simplicy, here we are testing the reactivity of the trap only by changing the tab index of one
    // of its elements (from `0` to `-1`); but the trap reacts to a variety of changes:
    // see `mutationObserverInit` in 'single-focus-trap/src/util.ts' for more details.

    it('Should aknowledge that a tabbable element in the trap has become untabbable', () => {
      // The click causes the tab index of an element in the trap to change from `0` to `-1`.
      cy.get('#clickMe').as('clickMe').click();

      cy.get('@clickMe').then((clickMe) => {
        // The `title` of the modified element is being removed from the `order` expected by `verifyTabCycle`.
        const newExpectedOrder = EXPECTED_ORDER.replace(clickMe.get(0).title, '');

        cy.get('@possibleTabbables').then((possibleTabbables) => {
          cy.verifyTabCycle(possibleTabbables, 'FORWARD', DEFAULT_TEST_CYCLE_LENGTH, newExpectedOrder);
          cy.verifyTabCycle(possibleTabbables, 'BACKWARD', DEFAULT_TEST_CYCLE_LENGTH, newExpectedOrder);
        });
      });
    });
  });
});
