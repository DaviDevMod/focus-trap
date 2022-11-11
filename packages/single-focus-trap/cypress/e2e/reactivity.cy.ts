/// <reference types="cypress" />

import { EXPECTED_ORDER_FROM_GROUPS_2_4, EXPECTED_ORDER_FROM_F_G_H } from '../support/commands';

context('Testing reactivity of the focus trap in regard to changes in the tab order of its elements.', () => {
  // e.g.: new tabbable elements appearing in the trap, or former tabbable elements becoming untabbable.

  before(() => cy.visitDemo());

  beforeEach(() => cy.get('button[data-parent-id]').as('possibleTabbables'));

  describe('The focus trap should aknowledge changes in the tab order of its tabbable elements', () => {
    it('Should aknowledge that the tab index of an element in the trap has changed', () => {
      cy.buildTrap({ roots: ['group 2', 'group 4'], lock: false });

      cy.patchElement({ id: 'G', tabIndex: '-1' });

      cy.get('#G').as('elementG').should('have.attr', 'tabindex', '-1');

      cy.get('@elementG')
        .invoke('attr', 'data-order')
        .as('orderG')
        .should('be.oneOf', EXPECTED_ORDER_FROM_GROUPS_2_4.split(''));

      cy.get<string>('@orderG').then((orderG) => {
        // The `data-order` of the now untabbable element is being removed from the `expectedOrder`.
        const newExpectedOrder = EXPECTED_ORDER_FROM_GROUPS_2_4.replace(orderG, '');

        // Verify the tab cycle in "EVERY" direction.
        cy.get('@possibleTabbables').verifyTabCycle({ expectedOrder: newExpectedOrder });
      });

      // The element `#G` was the only one both preceded and succeeded by an element with its same tab index.
      // This was making it the only element whose tabbability could change without affecting the validity of
      // others elements' `data-forward` and `data-backward` attributes.
      // Therefore its tabbability must be restored so that other tests may abuse of it.
      cy.patchElement({ id: 'G', tabIndex: '0' });
      cy.get('@elementG').should('have.attr', 'tabindex', '0');
    });

    it.skip(`Should ignore changes affecting the tabbability of an element succeeding "topTabbable"
    or preceding "bottomTabbable" when the trap doesn't contain elements with a positive tab index
    and the mutation doesn't concern tab index values.`);
    // The only way to test this, would be to check whether the focus trap shedules an update;
    // Which, would surely be cumbersome and wouldn't even improve the coverage
    // (cause there are only statements to schedule an update,
    // while the act of ignoring a mutation would hit an implicit `return;`).
    // Let's skip this for the moment.
    // By the way skipped tests are reported as pending.
    // https://github.com/cypress-io/cypress/issues/3092
    // https://github.com/cypress-io/cypress/issues/3092#issuecomment-880650903
    // https://docs.cypress.io/guides/core-concepts/writing-and-organizing-tests#Pending

    // This test fails at the moment because `single-focus-trap` takes tabbables element only from
    // within the roots, while each root element by itself is ignored.
    // Here `'F', 'G', 'H'` are simple buttons with no children, therefore the trap ends up being empty.
    it.skip(`Should react to changes affecting the tabbability of an element preceding "topTabbable"
    or succeeding "bottomTabbable" (included) even when the trap doesn't contain elements
    with a positive tab index and the mutation doesn't concern tab index values.`, () => {
      // This trap doesn't contain elements with a positive tab index.
      cy.buildTrap({ roots: ['F', 'G', 'H'] });

      cy.get('@possibleTabbables').verifyTabCycle({ expectedOrder: EXPECTED_ORDER_FROM_F_G_H });

      // Change tabbability of "topTabbable", without changing its tab index.
      cy.patchElement({ id: 'F', display: false });

      cy.get('#F').as('elementF').should('have.css', 'display', 'none');

      cy.get('@elementF')
        .invoke('attr', 'id')
        .then((id) => {
          // The `data-order` of the now untabbable element is being removed from the `expectedOrder`.
          const newExpectedOrder = EXPECTED_ORDER_FROM_F_G_H.replace(id, '');

          // The modified element has style `dispay: none`, so it's not focusable and it's not possible to
          // tab away form it. This is why it is being removed from the elements to focus and tab away from.
          cy.get('@possibleTabbables').not('#F').verifyTabCycle({ expectedOrder: newExpectedOrder });
        });
    });
  });
});
