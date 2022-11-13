/// <reference types="cypress" />

import { EXPECTED_ORDER_FROM_GROUPS_2_4 } from '../support/commands';

context('Testing reactivity of the focus trap in regard to changes in the tab order of its elements.', () => {
  // e.g.: new tabbable elements appearing in the trap, or former tabbable elements becoming untabbable.

  before(() => {
    cy.visitDemo();
    // `lock: false` is necessary to allow `patchElement` to click around.
    cy.buildTrap({ roots: ['group 2', 'group 4'], lock: false });
  });

  beforeEach(() => cy.get('button[data-parent-id]').as('possibleTabbables'));

  describe('The focus trap should aknowledge changes in the tab order of its tabbable elements', () => {
    it('Should aknowledge that the tab index of an element in the trap has changed', () => {
      cy.patchElement({ id: 'G', tabIndex: '-1' });

      cy.get('#G').as('elementG').should('have.attr', 'tabindex', '-1');

      cy.get('@elementG')
        .invoke('attr', 'data-order')
        .as('orderG')
        .should('be.oneOf', EXPECTED_ORDER_FROM_GROUPS_2_4.split(''));

      cy.get<string>('@orderG').then((orderG) => {
        // The `data-order` of the now untabbable element is being removed from the `expectedOrder`.
        const newExpectedOrder = EXPECTED_ORDER_FROM_GROUPS_2_4.replace(orderG, '');

        cy.get('@possibleTabbables').verifyTabCycle({ expectedOrder: newExpectedOrder });
      });
    });
  });
});
