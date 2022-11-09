/// <reference types="cypress" />

import { EXPECTED_ORDER, NESTED_EXPECTED_ORDER } from '../support/commands';

context.skip('Testing reactivity of the focus trap in regard to changes in the tab order of its elements.', () => {
  // e.g.: new tabbable elements appearing in the trap, or former tabbable elements becoming untabbable.

  before(() => cy.visit('/'));

  beforeEach(() => {
    cy.get('button').as('possibleTabbables');
    cy.get('#modify-me').as('modifyMe');

    cy.get('@modifyMe').invoke('attr', 'tabindex', '0').should('have.attr', 'tabindex', '0');
    cy.get('@modifyMe')
      .then((element) => element.get(0).style.setProperty('display', 'inline-block'))
      .should('have.css', 'display', 'inline-block');
  });

  describe('The focus trap should aknowledge changes in the tab order of its tabbable elements', () => {
    it('Should aknowledge that the tab index of an element in the trap has changed', () => {
      // When elements in the trap are modified, the focus trap only schedules an update,
      // withouth actually reacting. Then, when a `Tab` key press occurs, the trap updates,
      // before the focus can go from an element to another. In the same way:
      // when a trap is built, it doesn't go throughout its elements looking for those that are tabbable,
      // instead, it just schedules an update that will occur at the first `Tab` key press.
      // If an update is already scheduled, the trap doesn't look for further mutations.
      // Now, if the first `Tab` event occurs only after giving `#modify-me` a tab index of `-1`,
      // the logic that makes the trap react to changes would never kick in, because
      // an update was already scheduled when the trap was built and any mutation would be ignored.
      // So here we are, updating the trap before to mutate the tab index of `#modify-me`.
      // TODO:
      // actually since we are leaving `initialFocus` to its default, the trap DOES update when it's built
      // because it needs to get the first tabbable element, which is used as default `initialFocus`.
      // So why is this trap update required to see the reactivity logic kick in (and the coverage go up)?
      // IDK, but probably has something to do with the fact that here we are changing the tab index of
      // an element without going through React. We are changing the state of an application without
      // giving React the possibility to notice that it's virtual DOM has changed and it may be that somehow
      // this leads the mutationObserver to miss the change in tab index.
      // **Refactor app and tests so that the UI is modified only through React**
      cy.realPress('Tab');

      cy.get('@modifyMe').invoke('attr', 'tabindex', '-1').should('have.attr', 'tabindex', '-1');

      cy.get('@modifyMe')
        .invoke('attr', 'title')
        .then((title) => {
          cy.get('@possibleTabbables').then((possibleTabbables) => {
            // The `title` of the modified element is being removed from the `order` expected by `verifyTabCycle`.
            const newExpectedOrder = EXPECTED_ORDER.replace(title, '');

            cy.verifyTabCycle(possibleTabbables, 'FORWARD', newExpectedOrder);
            cy.verifyTabCycle(possibleTabbables, 'BACKWARD', newExpectedOrder);
          });
        });
    });

    it('Should aknowledge that the style of an element in the trap has changed', () => {
      // Updating the state of the focus trap.
      cy.realPress('Tab');

      cy.get('@modifyMe')
        .then((element) => element.get(0).style.setProperty('display', 'none'))
        .should('have.css', 'display', 'none');

      cy.get('@modifyMe')
        .invoke('attr', 'title')
        .then((title) => {
          cy.get('@possibleTabbables').then((possibleTabbables) => {
            // `#modify-me` has style `dispay: none`, so it can't be focused and it's not possible to tab away form it.
            // This is why it is being removed from the collection of elements to focus and tab away from.
            const newPossibleTabbables = possibleTabbables.not('#modify-me');

            // The `title` of the modified element is being removed from the `order` expected by `verifyTabCycle`.
            const newExpectedOrder = EXPECTED_ORDER.replace(title, '');

            cy.verifyTabCycle(newPossibleTabbables, 'FORWARD', newExpectedOrder);
            cy.verifyTabCycle(newPossibleTabbables, 'BACKWARD', newExpectedOrder);
          });
        });
    });

    // it.skip(`Should ignore changes affecting the tabbability of an element succeeding "topTabbable"
    // or preceding "bottomTabbable" when the trap doesn't contain elements with a positive tab index
    // and the mutation doesn't concern tab index values.`);
    // The only way to test this, would be to check whether the focus trap shedules an update;
    // Which, if possible, would surely be cumbersome and wouldn't even improve the coverage
    // (cause there are only statements to schedule an update,
    // while the act of ignoring a mutation would hit an implicit `return;`).
    // Let's skip this for the moment.
    // By the way skipped tests are reported as pending:
    // https://github.com/cypress-io/cypress/issues/3092
    // https://github.com/cypress-io/cypress/issues/3092#issuecomment-880650903
    // https://docs.cypress.io/guides/core-concepts/writing-and-organizing-tests#Pending

    it(`Should react to changes affecting the tabbability of an element preceding "topTabbable"
    or succeeding "bottomTabbable" (included) even when the trap doesn't contain elements
    with a positive tab index and the mutation doesn't concern tab index values.`, () => {
      // Activating the `nested-trap`, which doesn't contain elements with positive tab index.
      cy.get('#activate-nested-trap').as('activateNestedTrap').click();

      cy.get('#nested-trap').find('button').as('nestedPossibleTabbables');

      cy.get('@nestedPossibleTabbables').then((nestedPossibleTabbables) => {
        cy.verifyTabCycle(nestedPossibleTabbables, 'FORWARD', NESTED_EXPECTED_ORDER);
        cy.verifyTabCycle(nestedPossibleTabbables, 'BACKWARD', NESTED_EXPECTED_ORDER);
      });

      // Change tabbability of "topTabbable", without changing its tab index.
      cy.get('@activateNestedTrap').invoke('attr', 'disabled', 'yeah');

      cy.get('@activateNestedTrap')
        .invoke('attr', 'title')
        .then((title) => {
          cy.get('@nestedPossibleTabbables').then((nestedPossibleTabbables) => {
            // The disabled element is being removed from the collection of elements to focus and tab away from.
            const newNestedPossibleTabbables = nestedPossibleTabbables.not('#activate-nested-trap');

            // The `title` of the disabled element is being removed from the `order` expected by `verifyTabCycle`.
            const newNestedExpectedOrder = NESTED_EXPECTED_ORDER.replace(title, '');

            cy.verifyTabCycle(newNestedPossibleTabbables, 'FORWARD', newNestedExpectedOrder);
            cy.verifyTabCycle(newNestedPossibleTabbables, 'BACKWARD', newNestedExpectedOrder);
          });
        });
    });
  });
});
