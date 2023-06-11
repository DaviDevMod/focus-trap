/// <reference types="cypress" />

import { TrapArg, TrapAction } from '../../src';

type Direction = 'FORWARD' | 'BACKWARD';

export const DEFAULT_ROOTS = ['group 2', 'group 4'];

export const ID_FIRST_TABBABLE_IN_DEFAULT_ROOTS = 'E';

export const ERROR_STEPPING_OUT_OF_THE_TRAP =
  "After a `Tab` key press, the focus landed on an element with no 'data-order' attribute.";

const DEFAULT_EXPECTED_ORDER = '0123456';

declare global {
  namespace Cypress {
    interface Chainable {
      visitDemoAndBuildTrap: (trapArg: TrapArg) => void;

      actOnTrap: (action: TrapAction) => Cypress.Chainable<void>;

      actionShouldSucceed: (action: TrapAction) => void;

      actionShouldThrow: (action: TrapAction) => void;

      tabbingShouldThrowBecauseThereAreNoTabbables: (originId: string) => void;

      getNextTabbedDatasetOrder: (direction: Direction, check: boolean) => Cypress.Chainable<string>;

      getTabCycle: (from: JQuery<HTMLElement> | null, direction: Direction, len: number) => Cypress.Chainable<string[]>;

      verifyTabCycle: (direction?: Direction, check?: boolean, expectedOrder?: string) => Cypress.Chainable<void>;
    }
  }
}

Cypress.Commands.add('visitDemoAndBuildTrap', (trapArg) => {
  cy.visit(`/e2e?arg=${encodeURIComponent(JSON.stringify(trapArg))}`);
  // https://docs.cypress.io/api/commands/window#Start-tests-when-app-is-ready
  cy.window().should('have.property', 'appReady', true);
});

Cypress.Commands.add('actOnTrap', (action) => {
  cy.get('button')
    .contains(action)
    .click({ force: true })
    .then(() => true);
});

Cypress.Commands.add('actionShouldSucceed', (action) => {
  const trapShouldStopWorking = action === 'PAUSE' || action === 'DEMOLISH';

  cy.on('fail', (error) => {
    if (trapShouldStopWorking && error.message.includes(ERROR_STEPPING_OUT_OF_THE_TRAP)) return;
    throw error;
  });

  cy.actOnTrap(action);

  cy.get('button[data-parent-id]')
    .verifyTabCycle()
    .then(() => {
      if (trapShouldStopWorking) throw new Error('The focus should not be trapped anymore.');
    });
});

Cypress.Commands.add('actionShouldThrow', (action) => {
  cy.on('fail', (error) => {
    if (error.message.includes(`Cannot "${action}" inexistent trap.`)) return;
    throw error;
  });

  cy.actOnTrap(action).then(() => {
    throw new Error(`This "${action}" action should have thrown an error.`);
  });
});

Cypress.Commands.add('tabbingShouldThrowBecauseThereAreNoTabbables', (originId) => {
  cy.on('fail', (error) => {
    if (error.message.includes('There are no tabbable elements in the focus trap.')) return;
    throw error;
  });

  cy.get(`#${originId}`).focus();

  cy.realPress('Tab').then(() => {
    throw new Error(
      '`focusTrap` should throw when when trying to find a destination in a trap with no tabbable elements.'
    );
  });
});

// Fire a `Tab` event and return the `dataset.order` of the element that received the focus.
Cypress.Commands.add('getNextTabbedDatasetOrder', (direction, check) => {
  cy.focused().then(($origin) => {
    cy.realPress(direction === 'FORWARD' ? 'Tab' : ['Shift', 'Tab']);

    cy.focused().then(($destination) => {
      if (!$destination.get(0).dataset.order) {
        throw new Error(ERROR_STEPPING_OUT_OF_THE_TRAP);
      }

      // Check that elements outside the trap pass the focus to the right elements inside the trap.
      // This check is possible only for a trap with `DEFAULT_ROOTS` and no patched elements.
      // Making it available to arbitrary traps would require some (non-trivial) logic to modify
      // the `data-forward` and `data-backward` attributes of every element in demo playground.
      // All the effort has been made to ensure that the default setup covers all the relevant scenarios.
      if (check && !$origin.get(0).dataset.order) {
        expect($origin.get(0).dataset[direction.toLowerCase()]).to.equal($destination.get(0).dataset.order);
      }

      return $destination.get(0).dataset.order;
    });
  });
});

// `Tab` multiple times and return an array filled with the `dataset-order` of the focused elements.
Cypress.Commands.add('getTabCycle', (origin, direction, len) => {
  const tabCycle: string[] = new Array(len);

  cy.wrap(origin).focus();

  cy.wrap(tabCycle).each((_, i) =>
    cy.getNextTabbedDatasetOrder(direction, false).then((datasetOrder) => (tabCycle[i] = datasetOrder))
  );
});

/*
Most of the times tests only verify that the focus cycles within the trap.

When `check === true` tests also check that
elements outside the trap pass the focus to the right elements inside the trap.

This takes a while and is done only in the 'build.cy.ts' spec.

Note that enabling the `check` has no effect if `trapConfig.lock === true` (the default).
*/
// Assert whether the tab cycle returned by `getTabCycle` is a substring of `repeatedOrder`.
// When needed, also `check` whether elements outside the trap pass the focus to the right elements inside the trap.
Cypress.Commands.add(
  'verifyTabCycle',
  { prevSubject: ['element'] },
  (collection, direction = 'FORWARD', check = false, expectedOrder = DEFAULT_EXPECTED_ORDER) => {
    if (expectedOrder.length < 2) throw new Error('A meaningful `expectedOrder` must have at least two characters.');

    const repeatedOrder = {
      FORWARD: expectedOrder.repeat(2),
      BACKWARD: expectedOrder.split('').reverse().join('').repeat(2),
    };

    // If this block doesn't throw, the trap works for elements outside of the trap.
    if (check) {
      cy.wrap(collection)
        .each(($origin) => {
          cy.wrap($origin).focus();
          cy.getNextTabbedDatasetOrder(direction, true);
        })
        .then(() => true);
    }

    // Verify that the focus never leaves the trap.
    cy.wrap(collection.get(0)).then(($origin) => {
      cy.getTabCycle($origin, direction, expectedOrder.length).then((cycle) => {
        expect(cycle).to.have.length(expectedOrder.length);
        expect(repeatedOrder[direction]).to.have.string(cycle.join(''));
        return true;
      });
    });
  }
);
