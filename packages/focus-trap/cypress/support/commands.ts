/*
The tabbing behavior is tested using two different algorithms:

- If `check === true` (see `verifyTabCycle`),
  for each element in the playground,
  tests will press `Tab` `tabsPerCycle` times.

- If `check === false`,
  for one and only one element in the playground,
  tests will press `Tab` `expectedOrder.length` times.

When `check === false` tests only verify that the focus cycles within the trap.
This is quite fast.

When `check === true` tests also check that
elements outside the trap pass the focus to the right elements inside the trap.
This takes a while.

The `check` for elements outside of the trap is enabled only in the 'tab-key-pres.cy.ts' spec.

Note that enabling the `check` has no effect if `trapConfig.lock === true` (the default).
*/

/// <reference types="cypress" />

import { TrapArg } from '../../src';

type Direction = 'FORWARD' | 'BACKWARD';

interface TabCycleConfig {
  direction?: Direction;
  expectedOrder?: string;
  tabsPerCycle?: number;
  check?: boolean;
}

export const DEFAULT_ROOTS = ['group 2', 'group 4'];
export const ID_FIRST_TABBABLE_IN_DEFAULT_ROOTS = 'E';
export const ERROR_STEPPING_OUT_OF_THE_TRAP =
  "After a `Tab` key press, the focus landed on an element with no 'data-order' attribute.";

const DEFAULT_EXPECTED_ORDER = '0123456';

// A minimum of `2` is required to get meaningfull tests. Larger values make the tests last longer.
const DEFAULT_TABS_PER_CYCLE = 2;

declare global {
  namespace Cypress {
    interface Chainable {
      visitDemoAndBuildTrap: (trapArg: TrapArg) => void;

      getNextTabbedDatasetOrder: (direction: Direction, check: boolean) => Cypress.Chainable<string>;

      getTabCycle: (
        from: JQuery<HTMLElement> | null,
        direction: Direction,
        len: number,
        check: boolean
      ) => Cypress.Chainable<string[]>;

      assertTabCycle: (
        collection: JQuery<HTMLElement>,
        direction: Direction,
        len: number,
        repeatedOrder: string,
        check: boolean
      ) => Cypress.Chainable<true>;

      verifyTabCycle: (config?: TabCycleConfig) => Cypress.Chainable<true>;
    }
  }
}

Cypress.Commands.add('visitDemoAndBuildTrap', (trapArg) => {
  cy.visit(`/e2e?arg=${encodeURIComponent(JSON.stringify(trapArg))}`);
  // https://docs.cypress.io/api/commands/window#Start-tests-when-app-is-ready
  cy.window().should('have.property', 'appReady', true);
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

// Return an array filled with results from `getNextTabbedDatasetOrder`.
Cypress.Commands.add('getTabCycle', (origin, direction, len, check) => {
  if (len < 2) throw new Error('Please provide a tab cycle length greater than 1.');
  if (!Number.isInteger(len)) throw new Error('Please provide an integer tab cycle length.');

  const tabCycle: string[] = new Array(len);

  cy.wrap(origin).focus();

  cy.wrap(tabCycle).each((_, i) =>
    cy.getNextTabbedDatasetOrder(direction, check).then((datasetOrder) => (tabCycle[i] = datasetOrder))
  );
});

// Call `getTabCycle` and assert whether the tab cycle is a substring of `repeatedOrder`.
Cypress.Commands.add('assertTabCycle', (collection, direction, len, repeatedOrder, check) => {
  cy.wrap(collection).each(($origin) => {
    cy.getTabCycle($origin, direction, len, check).then((cycle) => {
      expect(cycle).to.have.length(len);
      expect(repeatedOrder).to.have.string(cycle.join(''));
      return true;
    });
  });
});

// Call `assertTabCycle` with the proper arguments, depending on the value of `check`.
Cypress.Commands.add(
  'verifyTabCycle',
  { prevSubject: ['element'] },
  (
    collection,
    {
      direction = 'FORWARD',
      tabsPerCycle = DEFAULT_TABS_PER_CYCLE,
      expectedOrder = DEFAULT_EXPECTED_ORDER,
      check = false,
    } = {
      direction: 'FORWARD',
      tabsPerCycle: DEFAULT_TABS_PER_CYCLE,
      expectedOrder: DEFAULT_EXPECTED_ORDER,
      check: false,
    }
  ) => {
    if (expectedOrder.length < 1) {
      throw new Error("It's not possible to build an empty trap. Please provide a meaningful `expectedOrder`.");
    }

    if (check && tabsPerCycle < 2) {
      throw new Error('When `check` is `true`, `tabsPerCycle` must be at least `2` in order to get meaningful tests.');
    }

    const cycleLength = check ? tabsPerCycle : expectedOrder.length;

    // Is the expected sequence of tabbed `dataset-order` repeated the least amount of times needed to
    // include any sequence of tabbed `dataset-order` that could show up during the tests.
    const repeatedOrder = {
      FORWARD: expectedOrder.repeat(Math.ceil((cycleLength - 1) / expectedOrder.length) + 1),
      get BACKWARD() {
        return this.FORWARD.split('').reverse().join('');
      },
    };

    return cy.assertTabCycle(
      check ? collection : collection.slice(0, 1),
      direction,
      cycleLength,
      repeatedOrder[direction],
      check
    );
  }
);
